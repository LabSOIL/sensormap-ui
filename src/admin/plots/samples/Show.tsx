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
    Labeled,
    NumberField,
    FunctionField,
    TabbedShowLayout,
    useRedirect,
    useGetOne,
    Button,
    useGetManyReference,
    ReferenceField,
} from "react-admin";
import { Grid, Typography } from '@mui/material';
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

    const buttonStyle = {
        minWidth: '50px', // Adjust the width as needed for 4-character names
        padding: '4px 6px',
        margin: '0 2px',
    };

    return (
        <Button
            style={buttonStyle}
            color={sample ? 'primary' : 'error'}
            disabled={disabled}
            onClick={handleClick}
        >
            {sample ? sample.name : name}
        </Button>
    );
}



const PlotSampleArrowNavation = () => {
    // Create a back and forward button if samples A and B exist in the same
    // plot. There are three samples, A B and C. If A and B exist, then we
    // can navigate between them. The current sample is emboldened and there is
    // no link to it. If there is no other sample, fade the text and no link

    // Build a 2D matrix of choices instead of the 1D array of A B C to be
    // grouped by depths. Each object has an upper_depth_cm, lower_depth_cm,
    // replicate, and name keys.The two depth keys are to be grouped together,
    // for example they can be 10 and 0, and 30 and 10, for example, with at
    // least a replicate of 1 in each, but any number of replicates.

    // The sample representation is the names of the replicates. For example,
    // if there are
    // lower, upper, replicate, name
    // 0,10,1,A1
    // 10,30,1,B1
    // 30,50,1,C1
    // 0,10,2,A2
    // 0,10,3,A3

    // There should be three rows visibly in the UI:
    //  0-10 cm A1 A2 A4
    // 10-30 cm B1
    // 30-50 cm C1

    const record = useRecordContext();
    if (!record) return null;

    const { data: samples, isPending: isPendingSamples, error } = useGetManyReference(
        'plot_samples',
        {
            target: 'plot_id',
            id: record.plot_id,
            // pagination: { page: 1, perPage: 10 },
            sort: { field: 'upper_depth_cm', order: 'DESC' }
        }
    );

    if (isPendingSamples || !samples) return null;
    // Sort samples by upper_depth_cm in ascending order
    samples.sort((a, b) => a.upper_depth_cm - b.upper_depth_cm);


    // Group samples by their depth range
    const groupedSamples = samples.reduce((acc, sample) => {
        const depthKey = `${sample.upper_depth_cm}-${sample.lower_depth_cm} cm`;
        if (!acc[depthKey]) {
            acc[depthKey] = [];
        }
        acc[depthKey].push(sample);
        return acc;
    }, {});

    return (
        <Grid container spacing={0}>
            {Object.keys(groupedSamples).map(depthKey => (
                <Grid item xs={12} key={depthKey} container alignItems="center">
                    <Typography variant='body2' align='right' style={{ width: '80px' }}>{depthKey}</Typography>
                    {groupedSamples[depthKey].map((sample: any) => (
                        <NavigationButton
                            key={sample.replicate}
                            sample={sample}
                            name={sample.name}
                            activeSample={record}
                        />
                    ))}
                </Grid>
            ))}
        </Grid>
    );
}

export const PlotSampleShow = () => (
    <Show title={<PlotSampleShowTitle />} actions={<PlotSampleShowActions />}>
        <SimpleShowLayout>
            <Grid container spacing={0}>
                <Grid item xs={4} align='center'>
                    <Typography variant="body2" >Samples</Typography>
                    <PlotSampleArrowNavation />
                </Grid>
                <Grid item xs={2} align='center'>
                    <Typography variant="body2" >Plot</Typography>
                    <PlotLinkedLabel />
                </Grid>
                <Grid item xs={2} align='center'>
                    <Typography variant="body2" >Area</Typography>
                    <AreaLinkedLabel />
                </Grid>
                <Grid item xs={2} align='center'>
                    <Typography variant="body2" >Project</Typography>
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
                    <Labeled label="Replicate">
                        <NumberField source="replicate" />
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
                <Grid item xs={3}>
                    <Labeled label="Soil Classification">
                        <ReferenceField source="soil_classification_id" reference="soil_classifications">
                            <TextField source="soil_type.name" link />
                        </ReferenceField>
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="FE Abundance (g/cm3)">
                        <NumberField source="fe_abundance_g_per_cm3" />
                    </Labeled>
                </Grid>
                <Grid item xs={3}>
                    <Labeled label="SOC Stock (g/cm3)">
                        <NumberField source="soc_stock_g_per_cm3" />
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
