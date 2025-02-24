import {
    useRecordContext,
    useGetManyReference,
    useTheme,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { Grid, Switch, FormControlLabel } from '@mui/material';
import Plot from 'react-plotly.js';
import { useState } from 'react';
import { Typography } from '@mui/material';


export const SensorPlot = ({ highResolution, setHighResolution }) => {
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

export default SensorPlot;