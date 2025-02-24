import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceField,
    useRecordContext,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    DateField,
    Labeled,
    FunctionField,
    useTheme,
    ArrayField,
    NumberField,
    Datagrid,
    useCreatePath,
    useNotify,
    useRedirect,
    ReferenceArrayField,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { Grid, Switch, FormControlLabel } from '@mui/material';
import Plot from 'react-plotly.js';
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { IconButton } from '@mui/material';
import plots from '../plots';

const SensorProfileShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><EditButton /><DeleteButton /></>}
        </TopToolbar>
    );
}

// export const SensorProfilePlot = () => {
//     const record = useRecordContext();
//     const [theme, setTheme] = useTheme();
//     if (!record) return null;

//     const x = record.data.map((d) => d.time_utc);
//     const traces = [
//         {
//             x: x,
//             y: record.data.map((d) => d.temperature_1),
//             name: 'Temperature 1',
//         },
//         {
//             x: x,
//             y: record.data.map((d) => d.temperature_2),
//             name: 'Temperature 2',
//         },
//         {
//             x: x,
//             y: record.data.map((d) => d.temperature_3),
//             name: 'Temperature 3',
//         },
//         {
//             x: x,
//             y: record.data.map((d) => d.temperature_average),
//             name: 'Temperature Average',
//         },
//         {
//             x: x,
//             y: record.data.map((d) => d.soil_moisture_count),
//             yaxis: 'y2',
//             name: 'Soil Moisture'
//         },
//     ];

//     return (
//         <Plot
//             data={traces}
//             layout={{
//                 width: 800,
//                 autosize: true,
//                 paper_bgcolor: theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
//                 plot_bgcolor: theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',

//                 font: {
//                     color: theme === 'dark' ? 'white' : 'black',
//                     size: 12,
//                 },
//                 margin: {
//                     l: 50,  // Left margin
//                     r: 50,  // Right margin
//                     t: 50,  // Top margin
//                     b: 50,  // Bottom margin
//                 },
//                 yaxis: {
//                     title: 'Temperature (°C)',
//                     titlefont: { color: 'rgb(31, 119, 180)' },
//                     tickfont: { color: 'rgb(31, 119, 180)' },
//                     gridcolor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
//                 },
//                 yaxis2: {
//                     title: 'Soil Moisture',
//                     titlefont: { color: 'rgb(148, 103, 189)' },
//                     tickfont: { color: 'rgb(148, 103, 189)' },
//                     overlaying: 'y',
//                     side: 'right'
//                 },
//             }}
//         />
//     );
// };


export const CreatePlotRelationship = () => {
    const record = useRecordContext();
    const redirect = useRedirect();
    const notify = useNotify();
    if (!record) return null;

    // Only show button if plot as we can only create sensor:plot relationships
    if (record.type !== 'plot') return null;

    return <IconButton
        color="success"
        title="Create sensor"
    // onClick={(event) => {
    //     if (navigator.clipboard) {
    //         const clipboardText = `${record.name}: ${record.comment}`;
    //         navigator.clipboard.writeText(clipboardText).then(() => {
    //             notify(`Copied "${clipboardText}" to clipboard`);
    //         });
    //     }
    //     redirect('create', 'plot_sensor', null, {}, {
    //         record: {
    //             coord_x: record.x,
    //             coord_y: record.y,
    //             coord_z: record.elevation_gps,
    //             name: record.name,
    //             description: record.comment,
    //             created_on: record.time
    //         }
    //     })
    //     event.stopPropagation();
    // }}
    >
        <plots.plot.icon />
    </IconButton>;
};

const SensorProfileShow = () => {
    const [lowResolution, setLowResolution] = useState(true);
    const createPath = useCreatePath();
    // Function to toggle lowResolution
    const handleToggle = () => {
        setLowResolution(!lowResolution);
    };

    const handleRowClick = (id, basePath, record) => {
        if (record.type === 'plot') {
            return createPath({ type: 'show', resource: 'plots', id: id });
        }
        if (record.type === 'soil_profile') {
            return createPath({ type: 'show', resource: 'soil_profiles', id: id });
        }
        return null;
    }
    // Rerender data when lowResolution state changes
    useEffect(() => { }, [lowResolution]);

    return (
        <Show
            actions={<SensorProfileShowActions />}
            queryOptions={{ meta: { low_resolution: lowResolution } }}
        >
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={2}>
                        <Grid item xs={6}>
                            <Labeled label="Name">
                                <TextField source="name" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6}>
                            <Labeled label="Area">
                                <ReferenceField
                                    source='area_id'
                                    reference='areas'
                                    link="show"
                                >
                                    <TextField source='name' />
                                </ReferenceField>
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Last Updated">
                                <DateField source="last_updated" showTime />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="XY Coordinates (m)">
                                <FunctionField render={record =>
                                    `${record.coord_x}, ${record.coord_y}`}
                                    label="Coordinates"
                                />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Elevation (m)">
                                <TextField source="coord_z" />
                            </Labeled>
                        </Grid>
                    </Grid>

                    <Grid item xs={10}>
                        {/* <SensorProfilePlot source="temperature_plot" /> */}
                        <Grid container justifyContent="flex-start">
                            {/* <FormControlLabel
                                control={
                                    <Switch
                                        checked={lowResolution}
                                        onChange={handleToggle}
                                        name="lowResolution"
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        Low Resolution
                                    </Typography>
                                }
                            /> */}
                            {/* <Box width="400px" mb={1}>
                                <Typography variant="caption">
                                    The sensor data is large, by default the plot is downsampled with
                                    the <i>Largest-Triangle-Three-Buckets</i> algorithm for memory efficiency.<br />
                                    Disable to load high-resolution data.
                                </Typography>
                            </Box> */}
                        </Grid>
                    </Grid>
                </Grid>
                {/* <ReferenceArrayField source="sensor_profile_assignments" reference="sensorprofile_id" label="Sensor Data">
                    <Datagrid>
                        <TextField source="sensor_id" label="Sensor ID" />

                    </Datagrid>
                </ReferenceArrayField> */}
                <ArrayField source="assignments">
                    <Datagrid
                        bulkActionButtons={false}
                        rowClick={false}
                    >
                        <ReferenceField source="sensor_id" reference="sensors" link="show" >
                            <TextField source="name" />
                        </ReferenceField>
                        <FunctionField source="type" render={record => record.type === 'soil_profile' ? "Soil Profile" : "Plot"} />
                        <TextField source="name" label="Name" />
                        <DateField source="date_from" label="From" showTime />
                        <DateField source="date_to" label="To" showTime />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    );
};

export default SensorProfileShow;
