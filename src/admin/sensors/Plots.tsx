import {
    useRecordContext,
    useGetManyReference,
    useTheme,
    TextField,
    FunctionField,
    ArrayField,
    Datagrid,
    DateField,
    ReferenceField,
} from 'react-admin';
import { Grid, Switch, FormControlLabel } from '@mui/material';
import Plot from 'react-plotly.js';
import { useState } from 'react';
import { Typography } from '@mui/material';
import { Checkbox } from '@mui/material';

export const SensorPlot = ({ highResolution, setHighResolution }: (any)) => {
    const [theme] = useTheme();
    const record = useRecordContext();
    const [showShapes, setShowShapes] = useState(true);

    // Function to toggle resolution
    const handleToggle = () => {
        setHighResolution(!highResolution);
    };

    const handleToggleShapes = () => {
        setShowShapes(!showShapes);
    };

    if (!record) return null;


    const {
        data: sensorProfileAssignments,
        isPending: isPendingProfileAssignment,
        error
    } = useGetManyReference(
        'sensor_profile_assignments',
        {
            target: 'sensor_id',
            id: record.id,
            pagination: { page: 1, perPage: 10 },
        }
    );
    if (isPendingProfileAssignment) return <p>Loading...</p>;



    const x = record.data.map((d) => d.time_utc);
    const traces = [
        {
            x: x,
            y: record.data.map((d) => d.temperature_1),
            name: 'Temperature 1',
        },
        {
            x: x,
            y: record.data.map((d) => d.temperature_2),
            name: 'Temperature 2',
        },
        {
            x: x,
            y: record.data.map((d) => d.temperature_3),
            name: 'Temperature 3',
        },
        {
            x: x,
            y: record.data.map((d) => d.temperature_average),
            name: 'Temperature Average',
        },
        {
            x: x,
            y: record.data.map((d) => d.soil_moisture_count),
            yaxis: 'y2',
            name: 'Soil Moisture'
        },
    ];

    const assignmentShapes = sensorProfileAssignments?.map((assignment) => ({
        type: 'rect',
        xref: 'x',
        yref: 'paper',
        x0: assignment.date_from,
        x1: assignment.date_to,
        y0: 0,
        y1: 1,
        fillcolor: 'rgba(255,0,0,0.2)',
        line: {
            width: 0
        },
    }));


    const assignmentAnnotations = sensorProfileAssignments?.map((assignment) => {
        // Calculate a midpoint for the x position (assuming date_from and date_to are numbers or convertible to Date objects)
        const midX = new Date((new Date(assignment.date_from).getTime() + new Date(assignment.date_to).getTime()) / 2);
        return {
            x: midX,
            y: 0.5, // Position near the top of the plot (using paper coordinates)
            xref: 'x',
            yref: 'paper',
            text: `Assignment: ${assignment.sensor_profile.name}`,
            showarrow: false,
            font: {
                color: theme === 'dark' ? 'white' : 'black',
                size: 10,
            },
        };
    });

    return (
        <>
            <Plot
                data={traces}
                useResizeHandler={true}
                layout={{
                    paper_bgcolor: theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
                    plot_bgcolor: theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
                    font: {
                        color: theme === 'dark' ? 'white' : 'black',
                        size: 12,
                    },
                    margin: {
                        l: 50,
                        r: 50,
                        t: 50,
                        b: 50,
                    },
                    yaxis: {
                        title: 'Temperature (°C)',
                        titlefont: { color: 'rgb(31, 119, 180)' },
                        tickfont: { color: 'rgb(31, 119, 180)' },
                        gridcolor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        // range: [null, 45],
                    },
                    yaxis2: {
                        title: 'Soil Moisture',
                        titlefont: { color: 'rgb(148, 103, 189)' },
                        tickfont: { color: 'rgb(148, 103, 189)' },
                        overlaying: 'y',
                        side: 'right',
                    },
                    shapes: showShapes ? assignmentShapes : [],
                    annotations: showShapes ? assignmentAnnotations : [],
                }}
                style={{ width: '100%' }}
            />
            <Grid container justifyContent="flex-start" alignItems="center" spacing={2} mt={2}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showShapes}
                            onChange={handleToggleShapes}
                            name="showShapes"
                            color="primary"
                        />
                    }
                    label={
                        <Typography variant="body2">
                            Show sensor profile
                        </Typography>
                    }
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={highResolution}
                            onChange={handleToggle}
                            name="highResolution"
                            color="primary"
                        />
                    }
                    label={
                        <Typography variant="body2">
                            High resolution
                        </Typography>
                    }
                />
            </Grid>
        </>
    );
}


export const SensorProfilePlot = ({ highResolution, setHighResolution, visibleAssignments }) => {
    const record = useRecordContext();
    const theme = useTheme();
    const mode = theme?.palette?.mode || 'light';
    if (!record) return null;
    const assignments = record.assignments || [];

    // Keep local state for highlighted assignment (optional hover effect)
    const [highlightedAssignment, setHighlightedAssignment] = useState(null);

    // Only include shapes for assignments that are visible
    const assignmentShapes = assignments
        .filter(assignment => visibleAssignments[assignment.id])
        .map(assignment => ({
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: assignment.date_from,
            x1: assignment.date_to,
            y0: 0,
            y1: 1,
            fillcolor: 'rgba(204, 179, 179, 0.2)',
            line: { width: 0 },
        }));

    // Build Plotly traces from the new data structure
    const traces = [];
    
    // Temperature traces grouped by depth from temperature_by_depth_cm
    if (record.temperature_by_depth_cm && Object.keys(record.temperature_by_depth_cm).length > 0) {
        Object.entries(record.temperature_by_depth_cm).forEach(([depth, dataPoints]) => {
            traces.push({
                x: dataPoints.map(d => d.time_utc),
                y: dataPoints.map(d => d.y),
                name: `Temperature at ${depth}cm depth`,
                line: { color: `hsl(${(parseInt(depth) * 30) % 360}, 70%, 50%)` },
                type: 'scatter',
                mode: 'lines',
            });
        });
    }

    // VWC moisture traces grouped by depth from moisture_vwc_by_depth_cm
    if (record.moisture_vwc_by_depth_cm && Object.keys(record.moisture_vwc_by_depth_cm).length > 0) {
        Object.entries(record.moisture_vwc_by_depth_cm).forEach(([depth, dataPoints]) => {
            traces.push({
                x: dataPoints.map(d => d.time_utc),
                y: dataPoints.map(d => d.y),
                name: `VWC at ${depth}cm depth`,
                line: { color: `hsl(${(parseInt(depth) * 30 + 180) % 360}, 70%, 50%)` },
                type: 'scatter',
                mode: 'lines',
                yaxis: 'y2', // Use secondary y-axis for moisture
            });
        });
    }

    // Fallback: If no new data structure, show legacy assignment data or data_by_depth_cm
    const hasNewData = (record.temperature_by_depth_cm && Object.keys(record.temperature_by_depth_cm).length > 0) ||
                       (record.moisture_vwc_by_depth_cm && Object.keys(record.moisture_vwc_by_depth_cm).length > 0);

    if (!hasNewData) {
        // Try legacy data_by_depth_cm first
        if (record.data_by_depth_cm && Object.keys(record.data_by_depth_cm).length > 0) {
            Object.entries(record.data_by_depth_cm).forEach(([depth, dataPoints]) => {
                traces.push({
                    x: dataPoints.map(d => d.time_utc),
                    y: dataPoints.map(d => d.y),
                    name: `Temperature at ${depth}cm depth (legacy)`,
                    line: { color: `hsl(${(parseInt(depth) * 30) % 360}, 70%, 50%)` },
                    type: 'scatter',
                    mode: 'lines',
                });
            });
        } else {
            // Fallback to assignment-based data
            const metrics = [
                { key: 'temperature_1', name: 'Temperature 1', color: 'blue' },
                { key: 'temperature_2', name: 'Temperature 2', color: 'red' },
                { key: 'temperature_3', name: 'Temperature 3', color: 'green' },
                { key: 'temperature_average', name: 'Temperature Average', color: 'orange' },
            ];
            const soilMetric = {
                key: 'soil_moisture_count',
                name: 'Soil Moisture (Raw)',
                color: 'purple',
            };

            assignments.forEach(assignment => {
                if (visibleAssignments[assignment.id]) {
                    const data = assignment.data || [];
                    metrics.forEach(metric => {
                        traces.push({
                            x: data.map(d => d.time_utc),
                            y: data.map(d => d[metric.key]),
                            name: `${assignment.sensor?.name || assignment.sensor_id} - ${metric.name}`,
                            line: {
                                color: metric.color,
                                width: highlightedAssignment === assignment.id ? 4 : 2,
                            },
                        });
                    });
                    // Soil moisture on secondary y-axis (raw counts)
                    traces.push({
                        x: data.map(d => d.time_utc),
                        y: data.map(d => d[soilMetric.key]),
                        name: `${assignment.sensor?.name || assignment.sensor_id} - ${soilMetric.name}`,
                        line: {
                            color: soilMetric.color,
                            width: highlightedAssignment === assignment.id ? 4 : 2,
                        },
                        yaxis: 'y2',
                    });
                }
            });
        }
    }

    const hasMoistureData = record.moisture_vwc_by_depth_cm && Object.keys(record.moisture_vwc_by_depth_cm).length > 0;

    const layout = {
        paper_bgcolor: mode === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
        plot_bgcolor: mode === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
        font: { color: mode === 'dark' ? 'white' : 'black', size: 12 },
        margin: { l: 50, r: 50, t: 50, b: 50 },
        xaxis: { title: 'Time' },
        yaxis: {
            title: 'Temperature (°C)',
            titlefont: { color: 'rgb(31, 119, 180)' },
            tickfont: { color: 'rgb(31, 119, 180)' },
            gridcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
        yaxis2: {
            title: hasMoistureData ? 'Volumetric Water Content (VWC)' : 'Soil Moisture (Raw Counts)',
            titlefont: { color: 'rgb(148, 103, 189)' },
            tickfont: { color: 'rgb(148, 103, 189)' },
            overlaying: 'y',
            side: 'right',
            range: hasMoistureData ? [0, 1] : undefined, // VWC is between 0 and 1
        },
        shapes: assignmentShapes,
        title: hasNewData 
            ? 'Sensor Data Grouped by Depth' 
            : 'Legacy Sensor Data View',
    };

    const handleToggleHighResolution = () => {
        setHighResolution(!highResolution);
    };

    return (
        <>
            <Plot
                data={traces}
                layout={layout}
                style={{ width: '100%', height: '400px' }}
                useResizeHandler
            />
            <Grid container justifyContent="flex-start" alignItems="center" spacing={2} mt={2}>
                <Grid item>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={highResolution}
                                onChange={handleToggleHighResolution}
                                color="primary"
                            />
                        }
                        label={<Typography variant="body2">High resolution</Typography>}
                    />
                </Grid>
                {hasNewData && (
                    <Grid item>
                        <Typography variant="body2" color="textSecondary">
                            {hasMoistureData ? 
                                'Showing temperature and VWC data grouped by depth' : 
                                'Showing temperature data grouped by depth'
                            }
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </>
    );
};



export default SensorPlot;
