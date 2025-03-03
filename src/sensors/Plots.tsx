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


export const SensorProfilePlot = ({ highResolution, setHighResolution }) => {
    const record = useRecordContext();
    const theme = useTheme();
    // Default to 'light' if palette or mode is not available.
    const mode = theme?.palette?.mode || 'light';

    if (!record) return null;

    // Use assignments from the record.
    const assignments = record.assignments || [];

    // Maintain a visibility flag per assignment (default true)
    const [visibleAssignments, setVisibleAssignments] = useState(() => {
        const init = {};
        assignments.forEach((a) => {
            init[a.id] = true;
        });
        return init;
    });
    // Track which assignment is highlighted (via hover)
    const [highlightedAssignment, setHighlightedAssignment] = useState(null);

    // Compute shapes and annotations exactly as before.
    const assignmentShapes = assignments.map((assignment) => ({
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


    const metrics = [
        { key: 'temperature_1', name: 'Temperature 1', color: 'blue' },
        { key: 'temperature_2', name: 'Temperature 2', color: 'red' },
        { key: 'temperature_3', name: 'Temperature 3', color: 'green' },
        { key: 'temperature_average', name: 'Temperature Average', color: 'orange' },
    ];
    const soilMetric = {
        key: 'soil_moisture_count',
        name: 'Soil Moisture',
        color: 'purple',
    };

    // Build Plotly traces per assignment.
    // Each trace is built similarly to your original traces but now per assignment.
    const traces = [];
    assignments.forEach((assignment) => {
        if (visibleAssignments[assignment.id]) {
            const data = assignment.data || [];
            metrics.forEach((metric) => {
                traces.push({
                    x: data.map((d) => d.time_utc),
                    y: data.map((d) => d[metric.key]),
                    name: `${assignment.sensor?.name || assignment.sensor_id} - ${metric.name}`,
                    // Preserve original style by not explicitly setting markers.
                    line: {
                        color: metric.color,
                        width: highlightedAssignment === assignment.id ? 4 : 2,
                    },
                });
            });
            // Soil moisture trace on secondary y-axis.
            traces.push({
                x: data.map((d) => d.time_utc),
                y: data.map((d) => d[soilMetric.key]),
                name: `${assignment.sensor?.name || assignment.sensor_id} - ${soilMetric.name}`,
                line: {
                    color: soilMetric.color,
                    width: highlightedAssignment === assignment.id ? 4 : 2,
                },
                yaxis: 'y2',
            });
        }
    });

    // Use your original layout settings.
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
            title: 'Soil Moisture',
            titlefont: { color: 'rgb(148, 103, 189)' },
            tickfont: { color: 'rgb(148, 103, 189)' },
            overlaying: 'y',
            side: 'right',
        },
        // Always show shapes and annotations as before.
        shapes: assignmentShapes,
    };

    const handleCheckboxChange = (assignmentId) => {
        setVisibleAssignments((prev) => ({
            ...prev,
            [assignmentId]: !prev[assignmentId],
        }));
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
            </Grid>
            <ArrayField source="assignments" sort={{ field: 'date_from', order: 'ASC' }}>
                <Datagrid
                    bulkActionButtons={false}
                    rowClick={false}
                >
                    <FunctionField
                        render={(record) => (
                            <Checkbox
                                checked={visibleAssignments[record.id] || false}
                                onChange={() => handleCheckboxChange(record.id)}
                                size="small"
                                sx={{ padding: 0 }}
                            />
                        )}
                    />
                    <ReferenceField source="sensor_id" reference="sensors" link="show" >
                        <TextField source="name" />
                    </ReferenceField>
                    <DateField source="date_from" label="From" showTime />
                    <DateField source="date_to" label="To" showTime />
                </Datagrid>
            </ArrayField >
        </>
    );
};


export default SensorPlot;
