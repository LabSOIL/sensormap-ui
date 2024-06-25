import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceManyCount,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    DateField,
    ReferenceField,
    Labeled,
    NumberField,
    FunctionField,
    TabbedShowLayout,
} from "react-admin";
import { Grid, Typography } from '@mui/material';
import Plot from 'react-plotly.js';



const PlotSampleShowTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} Plot Sample</span>;
};

const PlotSampleShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <>
                <EditButton />
                <DeleteButton />
            </>}
        </TopToolbar>
    );
}
const ColoredLine = ({ color, height }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: height
        }}
    />
);

const PlotSampleTitle = ({ record }) => {

    return <span>{record ? `${record.name}` : ''}</span>;
}


const texturePolygons = [{
    name: 'Heavy Clay',
    geom: [[0, 100], [40, 60], [0, 60]],
},
{
    name: 'Clay',
    geom: [[0, 60], [40, 60], [45, 55], [45, 40], [20, 40]],
},
{
    name: 'Silty Clay',
    geom: [[0, 60], [0, 40], [20, 40]],
},
{
    name: 'Sandy Clay',
    geom: [[45, 55], [45, 35], [65, 35]],
},
{
    name: 'Silty Clay Loam',
    geom: [[0, 40], [0, 28], [20, 28], [20, 40]],
},
{
    name: 'Clay Loam',
    geom: [[20, 40], [20, 28], [45, 28], [45, 40]],
},
{
    name: 'Sandy Clay Loam',
    geom: [[45, 35], [45, 28], [52, 20], [80, 20], [65, 35]],
},
{
    name: 'Silt',
    geom: [[0, 0], [0, 12], [8, 12], [19, 0]],
},
{
    name: 'Silt Loam',
    geom: [[0, 12], [0, 28], [8, 12], [19, 0], [50, 0], [25, 28]],
},
{
    name: 'Loam',
    geom: [[25, 28], [45, 5], [52, 5], [52, 20], [45, 28]],
},
{
    name: 'Sandy Loam',
    geom: [[52, 20], [52, 5], [45, 5], [50, 0], [70, 0], [85, 15], [80, 20]],
},
{
    name: 'Loamy Sand',
    geom: [[70, 0], [85, 15], [90, 10], [83, 0]],
},
{
    name: 'Sand',
    geom: [[90, 10], [83, 0], [100, 0]],
}];

const SedimentPieChart = () => {
    const record = useRecordContext();

    const clay = record.clay_percent;
    const silt = record.silt_percent;
    const sand = record.sand_percent;

    const soilSample = {
        type: 'scatterternary',
        mode: 'markers',
        a: [clay],
        b: [silt],
        c: [sand],
        text: ['Soil Sample'],
        marker: {
            symbol: 'circle',
            color: '#DB7365',
            size: 14,
            line: { width: 0 }
        }
    };

    const polygonTraces = texturePolygons.map((polygon) => ({
        type: 'scatterternary',
        mode: 'lines',
        a: polygon.geom.map((point) => point[1]),
        b: polygon.geom.map((point) => 100 - point[0] - point[1]),
        c: polygon.geom.map((point) => point[0]),
        name: polygon.name,
        line: {
            color: 'rgba(0,0,0,0.5)',
            width: 2
        },
        fill: 'toself',
        fillcolor: 'rgba(0,0,0,0.1)'
    }));

    const data = [soilSample, ...polygonTraces];

    const layout = {
        ternary: {
            sum: 100,
            aaxis: {
                title: 'Clay',
                min: 0.01,
                linewidth: 2,
                ticks: 'outside'
            },
            baxis: {
                title: 'Silt',
                min: 0.01,
                linewidth: 2,
                ticks: 'outside'
            },
            caxis: {
                title: 'Sand',
                min: 0.01,
                linewidth: 2,
                ticks: 'outside'
            }
        },
        showlegend: false,
        width: 500,
        height: 500,
        autosize: true,
        margin: {
            l: 30,
            r: 30,
            t: 30,
            b: 30
        },
        font: {
            size: 16
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Plot
                data={data}
                layout={layout}
            />
        </div>
    );
};



export const PlotSampleShow = () => (
    <Show title={<PlotSampleShowTitle />} actions={<PlotSampleShowActions />}>
        <SimpleShowLayout>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <ReferenceField
                        label="Plot"
                        reference="plots"
                        sort={{ field: 'name', order: 'ASC' }}
                        link="show"
                        source="plot_id"
                    >
                        <Labeled label="Name"><TextField source="name" /></Labeled>
                    </ReferenceField>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Created On">
                        <DateField source="created_on" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Last Updated">
                        <DateField source="last_updated" showTime />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Depth (cm)">
                        <FunctionField render={record => `${record.upper_depth_cm} - ${record.lower_depth_cm} cm`} />
                    </Labeled>

                </Grid>

                <Grid item xs={3}>
                    <Labeled label="Sample Weight (g)">
                        <NumberField source="sample_weight" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Subsample Weight">
                        <TextField source="subsample_weight" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Subsample Replica Weight">
                        <TextField source="subsample_replica_weight" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="pH">
                        <NumberField source="ph" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Residual Humidity (RH)">
                        <NumberField source="rh" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Loss on Ignition (LOI)">
                        <NumberField source="loi" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Moisture Factor Correction (MFC)">
                        <NumberField source="mfc" />
                    </Labeled>
                </Grid>

            </Grid>
            <TabbedShowLayout>
                <TabbedShowLayout.Tab label="Soil Texture">
                    <Grid container spacing={2}>

                        <Grid item xs={4}>
                            <Labeled label="Clay (%)">
                                <NumberField source="clay_percent" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Silt (%)">
                                <NumberField source="silt_percent" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Sand (%)">
                                <NumberField source="sand_percent" />
                            </Labeled>
                        </Grid>
                    </Grid>
                    <SedimentPieChart />

                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="Composition">
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Labeled label="Carbon (C) %">
                                <NumberField source="c" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Nitrogen (N) %">
                                <NumberField source="n" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Carbon:Nitrogen Ratio">
                                <NumberField source="cn" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Iron (Fe) in ug/g">
                                <NumberField source="fe_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Sodium (Na) in ug/g">
                                <NumberField source="na_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Aluminum (Al) in ug/g">
                                <NumberField source="al_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Potassium (K) in ug/g">
                                <NumberField source="k_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Calcium (Ca) in ug/g">
                                <NumberField source="ca_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Magnesium (Mg) in ug/g">
                                <NumberField source="mg_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Manganese (Mn) in ug/g">
                                <NumberField source="mn_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Sulfur (S) in ug/g">
                                <NumberField source="s_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Chlorine (Cl) in ug/g">
                                <NumberField source="cl_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Phosphorus (P) in ug/g">
                                <NumberField source="p_ug_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Silicon (Si) in ug/g">
                                <NumberField source="si_ug_per_g" />
                            </Labeled>
                        </Grid>
                    </Grid>
                </TabbedShowLayout.Tab>
                <TabbedShowLayout.Tab label="🦠">

                </TabbedShowLayout.Tab>
            </TabbedShowLayout>

        </SimpleShowLayout>
    </Show >
);


export default PlotSampleShow;
