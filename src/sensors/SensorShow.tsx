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
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { Grid } from '@mui/material';
import Plot from 'react-plotly.js';


const SensorShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><EditButton /><DeleteButton /></>}
        </TopToolbar>
    );
}

export const SensorPlot = () => {
    const record = useRecordContext();
    const [theme, setTheme] = useTheme();
    if (!record) return null;

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

    return (
        <Plot
            data={traces}
            layout={{
                width: 800,
                autosize: true,
                paper_bgcolor: theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
                plot_bgcolor: theme === 'dark' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',

                font: {
                    color: theme === 'dark' ? 'white' : 'black',
                    size: 12,
                },
                margin: {
                    l: 50,  // Left margin
                    r: 50,  // Right margin
                    t: 50,  // Top margin
                    b: 50,  // Bottom margin
                },
                yaxis: {
                    title: 'Temperature (°C)',
                    titlefont: { color: 'rgb(31, 119, 180)' },
                    tickfont: { color: 'rgb(31, 119, 180)' },
                    gridcolor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                },
                yaxis2: {
                    title: 'Soil Moisture',
                    titlefont: { color: 'rgb(148, 103, 189)' },
                    tickfont: { color: 'rgb(148, 103, 189)' },
                    overlaying: 'y',
                    side: 'right'
                },
            }}
        />
    );
};

const SensorShow = () => (
    <Show
        actions={<SensorShowActions />}
        queryOptions={{ meta: { low_resolution: true } }}
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
                    <Grid item xs={6}>
                        <Labeled label="Description">
                            <TextField source="description" />

                        </Labeled>
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs={6}>
                        <Labeled label="Notes/Comments">
                            <TextField source="comment" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs={6}>
                        <Labeled label="Serial Number">
                            <TextField source="serial_number" />
                        </Labeled>
                    </Grid>
                </Grid>

                <Grid item xs={10}>
                    <SensorPlot source="temperature_plot" />
                </Grid>
            </Grid>
        </SimpleShowLayout>

    </Show >
);

export default SensorShow;
