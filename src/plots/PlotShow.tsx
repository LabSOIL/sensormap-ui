import {
    Show,
    SimpleShowLayout,
    TextField,
    useRedirect,
    Button,
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
    CreateButton,
    Datagrid,
    ReferenceManyField,
    Loading,
} from "react-admin";
import { Grid, Typography } from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';


const PlotShowTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} SoilProfile</span>;
};

const PlotShowActions = () => {
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


const CreateManyButton = () => {
    const redirect = useRedirect();
    const record = useRecordContext();

    return (
        <Button
            label="Add Many"
            onClick={(event) => {
                redirect(
                    '/plot_samples/createMany',
                    undefined,
                    undefined,
                    undefined,
                    { record: { plot_id: record.id } }
                );
            }}
            startIcon={< LibraryAddIcon fontSize='inherit' />}
        />
    )
}

const CreateSampleButton = () => {
    const record = useRecordContext();

    return (
        <CreateButton
            label="Add"
            resource="plot_samples"
            state={{
                record: {
                    plot_id: record.id,
                }
            }}
        />
    );

}

const ImageField = ({ source }) => {
    const record = useRecordContext();
    if (!record) {
        return <Loading />;
    }

    if (!record[source]) {

        return <>
            <br />
            <Typography align="center">No image available</Typography>
        </>;
    }
    const base64Image = record[source];
    return (
        <div style={{ textAlign: 'center', margin: '0 10px' }}>
            <img src={`${base64Image}`} style={{ maxWidth: '80%', height: 'auto' }} />
        </div>
    );
};

export const PlotShow = () => (
    <Show title={<PlotShowTitle />} actions={<PlotShowActions />}>
        <SimpleShowLayout >
            <Grid container>
                <Grid item xs={8} textAlign="left">
                    <FunctionField
                        render={record => `${record.name}: `}
                        variant="h5"
                        gutterBottom
                        label={null}
                    />
                    <ReferenceField source="area_id" reference="areas" link="show">
                        <TextField source="name" variant="h5" />
                    </ReferenceField>{" "}
                    <TextField source="gradient" variant="h5" />
                </Grid>

                <Grid item xs={4} textAlign="right">
                    <DateField
                        source="created_on"
                        variant="h5"
                        gutterBottom
                    />
                </Grid>
                <Grid item xs={4}>
                    <Labeled>
                        <TextField source="coord_x" label="X (m)" />
                    </Labeled >
                </Grid>
                <Grid item xs={4}>
                    <Labeled><TextField source="coord_y" label="Y (m)" /></Labeled >
                </Grid>
                <Grid item xs={4}>
                    <Labeled><TextField source="coord_z" label="Elevation (m)" /></Labeled >
                </Grid>
                <Grid item xs={4}>
                    <Labeled><TextField source="aspect" /></Labeled >
                </Grid>
                <Grid item xs={4}>
                    <Labeled><TextField source="topography" /></Labeled >
                </Grid>
                <Grid item xs={8}>
                    <Labeled><TextField source="vegetation_type" /></Labeled >
                </Grid>
                <Grid item xs={4}>
                    <Labeled><DateField source="last_updated" showTime /></Labeled>
                </Grid>
            </Grid>

            <ColoredLine color="grey" height={2} />
            <Grid container>
                <Grid item xs={6}>
                    <Typography variant="h6" textAlign="center" gutterBottom>Samples</Typography>
                    <TopToolbar><CreateSampleButton /></TopToolbar>
                    <ReferenceManyField
                        reference="plot_samples"
                        target="plot_id"
                        label="Samples"
                        sort={{ field: 'name', order: 'ASC' }}
                    >
                        <Datagrid rowClick="show" bulkActionButtons={false}>
                            <TextField source="name" />
                            <NumberField source="upper_depth_cm" label="Upper Depth (cm)" />
                            <NumberField source="lower_depth_cm" label="Lower Depth (cm)" />
                            <NumberField source="sample_weight" label="Weight (g)" />
                            <DateField source="sampled_on" />
                        </Datagrid>
                    </ReferenceManyField>

                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h6" textAlign="center" gutterBottom>Plot illustration</Typography>
                    <ImageField source="image" />
                </Grid>

            </Grid>
        </SimpleShowLayout>
    </Show >
);

export default PlotShow;
