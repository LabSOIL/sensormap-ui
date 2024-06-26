import {
    Show,
    SimpleShowLayout,
    TextField,
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
    useRedirect,
    useGetOne,
    Button,
    useCreate,
} from "react-admin";
import { Grid } from '@mui/material';
import { SedimentChart, MicrobialPieChart } from './Charts';
import { Link } from 'react-router-dom';


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

const AreaLinkedLabel = () => {
    // Link to the area show page
    const record = useRecordContext();
    if (!record) return null;

    const areaId = record.plot.area.id;
    const redirect = useRedirect();

    const handleClick = () => {
        redirect('show', 'areas', areaId);
    }
    return (
        <><Button onClick={handleClick} style={{ textDecoration: 'none' }}> {record.plot.area.name}</Button ></>
    );
}

const PlotLinkedLabel = () => {
    // Link to the area show page
    const record = useRecordContext();
    if (!record) return null;

    const plotId = record.plot.id;
    const redirect = useRedirect();

    const handleClick = () => {
        redirect('show', 'plots', plotId);
    }
    return (
        <><Button onClick={handleClick} style={{ textDecoration: 'none' }}> {record.plot.name}</Button ></>
    );
}

const ProjectLinkedLabel = () => {
    // Link to the project show page
    const record = useRecordContext();
    if (!record) return null;

    const projectId = record.plot.area.project.id;
    const redirect = useRedirect();

    const handleClick = () => {
        redirect('show', 'projects', projectId);
    }

    return (
        <><Button onClick={handleClick} style={{ textDecoration: 'none' }}> {record.plot.area.project.name}</Button ></>
    );
}
const NavigationButton = ({ sample, name, activeSample }) => {
    const record = useRecordContext();
    if (!record) return null;
    const redirect = useRedirect();
    const disabled = activeSample.name === name;

    const handleClick = () => {
        if (sample) {
            redirect('show', 'plot_samples', sample.id);
        } else {
            redirect(
                'create',
                'plot_samples',
                null,
                {},
                {
                    record: { plot_id: record.plot.id, name: name }
                }
            );
        }
    }
    return (
        <Button
            color={sample ? 'primary' : 'error'}
            disabled={disabled}
            onClick={handleClick}
        >{sample ? sample.name : name}</Button>
    );
}
const PlotSampleArrowNavation = () => {
    // Create a back and forward button if samples A and B exist in the same
    // plot. There are three samples, A B and C. If A and B exist, then we
    // can navigate between them. The current sample is emboldened and there is
    // no link to it. If there is no other sample, fade the text and no link
    const record = useRecordContext();
    if (!record) return null;

    // Get the related plot, it has samples embedded as a list of objects
    const { data: plot, isPending } = useGetOne('plots', { id: record.plot.id });
    if (isPending) return null;
    if (!plot) return null;
    const samples = plot.samples;
    // Go through array of samples and look for name: A and B and C
    let sampleA = null;
    let sampleB = null;
    let sampleC = null;
    for (let i = 0; i < samples.length; i++) {
        if (samples[i].name === 'A') {
            sampleA = samples[i];
        }
        if (samples[i].name === 'B') {
            sampleB = samples[i];
        }
        if (samples[i].name === 'C') {
            sampleC = samples[i];
        }
    }
    const activeSample = record;


    return (
        <div>
            <NavigationButton sample={sampleA} name="A" activeSample={activeSample} />
            <NavigationButton sample={sampleB} name="B" activeSample={activeSample} />
            <NavigationButton sample={sampleC} name="C" activeSample={activeSample} />
        </div >
    );
}

export const PlotSampleShow = () => (
    <Show title={<PlotSampleShowTitle />} actions={<PlotSampleShowActions />}>
        <SimpleShowLayout>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    <PlotSampleArrowNavation />
                </Grid>
                <Grid item xs={3}>
                    <PlotLinkedLabel />
                </Grid>
                <Grid item xs={3}>
                    <AreaLinkedLabel />
                </Grid>
                <Grid item xs={3}>
                    <ProjectLinkedLabel />
                </Grid>
                <Grid item xs={12}>
                    <hr style={{
                        color: 'black',
                        backgroundColor: 'black',
                        height: 1,
                        borderColor: 'black',
                        opacity: 0.25
                    }} />
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Name">
                        <TextField source="name" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="Depth (cm)">
                        <FunctionField render={record => `${record.upper_depth_cm} - ${record.lower_depth_cm} cm`} />
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
                    <SedimentChart />

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

                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Labeled label="Fungi (fungal 18S gene copy number per g of soil)">
                                <FunctionField render={record => {
                                    const total = record.fungi_per_g + record.bacteria_per_g + record.archea_per_g;
                                    const percentage = (record.fungi_per_g * 100 / total).toFixed(2);  // Rounds to two decimal places
                                    return `${record.fungi_per_g} (${percentage}%)`;
                                }} />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Bacteria (bacterial 16S gene copy number per g of soil)">
                                <FunctionField render={record => {
                                    const total = record.fungi_per_g + record.bacteria_per_g + record.archea_per_g;
                                    const percentage = (record.bacteria_per_g * 100 / total).toFixed(2);  // Rounds to two decimal places
                                    return `${record.bacteria_per_g} (${percentage}%)`;
                                }
                                } />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Archea (archeal 16S gene copy number per g of soil)">
                                <FunctionField render={record => {
                                    const total = record.fungi_per_g + record.bacteria_per_g + record.archea_per_g;
                                    const percentage = (record.archea_per_g * 100 / total).toFixed(2);  // Rounds to two decimal places
                                    return `${record.archea_per_g} (${percentage}%)`;
                                }
                                } />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Methanogens (mcrA gene copy number per g of soil)">
                                <NumberField source="methanogens_per_g" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={4}>
                            <Labeled label="Methanotrophs (pmoA gene copy number per g of soil)">
                                <NumberField source="methanotrophs_per_g" />
                            </Labeled>
                            <MicrobialPieChart />
                        </Grid>
                    </Grid>
                </TabbedShowLayout.Tab>
            </TabbedShowLayout>

        </SimpleShowLayout>
    </Show >
);


export default PlotSampleShow;
