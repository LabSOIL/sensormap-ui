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

const SedimentPieChart = () => {
    // Using the clay, silt and sand percentages to create a pie chart

    const record = useRecordContext();

    const clay = record.clay_percent;
    const silt = record.silt_percent;
    const sand = record.sand_percent;

    const data = [
        { class: 'clay', percentage_cover: clay },
        { class: 'silt', percentage_cover: silt },
        { class: 'sand', percentage_cover: sand },
    ];
    const colors = ['#FFA07A', '#87CEFA', '#FFD700'];

    // Set labels to capitalise the first letter
    const labels = data.map(
        (item) => item.class.charAt(0).toUpperCase() + item.class.slice(1)
    );

    const pieData = [{
        values: data.map((item) => item.percentage_cover),
        labels: labels,
        type: 'pie',
        hoverinfo: 'label+percent',
        textinfo: 'label+percent',
        textposition: 'inside',
        insidetextorientation: 'radial',
        marker: {
            colors: colors, // Assign the custom colors to the pie chart
        },
    }];

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Plot
                data={pieData}
                layout={{
                    width: 400,
                    height: 400,
                    autosize: true,
                    margin: {
                        l: 0,  // Left margin
                        r: 0,  // Right margin
                        t: 0,  // Top margin
                        b: 0,  // Bottom margin
                    },
                    font: {
                        size: 16,
                    }
                }}
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
                <TabbedShowLayout.Tab label="Sediments">
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
            </TabbedShowLayout>

        </SimpleShowLayout>
    </Show >
);


export default PlotSampleShow;
