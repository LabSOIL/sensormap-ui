import { Grid, Typography } from '@mui/material';
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
    Labeled,
    ReferenceArrayField,
    ReferenceManyField,
    Datagrid,
    ReferenceField,
} from "react-admin";


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
const SoilTypeTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} SoilType</span>;
};

const SoilTypeShowActions = () => {
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

export const SoilTypeShow = () => (
    <Show title={<SoilTypeTitle />} actions={<SoilTypeShowActions />}>
        <SimpleShowLayout>
            <Grid container>
                <Grid item xs={6}>
                    <Labeled><TextField source="name" /></Labeled>
                    <Labeled><TextField source="description" /></Labeled>
                    <Labeled><DateField source="last_updated" showTime /></Labeled>
                    <br />
                    <Labeled><ReferenceManyCount
                        label="Soil Profiles"
                        reference="soil_profiles"
                        target="soil_type_id"
                        link
                    /></Labeled>
                </Grid>
                {/* // Show all of the related soil Classifications and their FE value */}
                <Grid item xs={6}>
                    <Labeled>
                        <ReferenceManyField
                            label="Soil Classifications"
                            reference="soil_classifications"
                            target="soil_type_id"
                        >
                            <Datagrid bulkActionButtons={false} rowClick="show">
                                <ReferenceField
                                    label="Area"
                                    reference="areas"
                                    source="area_id"
                                >
                                    <TextField source="name" />
                                </ReferenceField>
                                <TextField source='depth_upper_cm' label='Depth Upper (cm)' />
                                <TextField source='depth_lower_cm' label='Depth Lower (cm)' />
                                <TextField source="fe_abundance_g_per_cm3" label="Fe Abundance (g/cm³)" />
                                <DateField source="created_on" />
                            </Datagrid>
                        </ReferenceManyField>
                    </Labeled>
                </Grid>

                <Grid item xs={6}>
                    <ImageField source="image" />
                </Grid>
            </Grid>
        </SimpleShowLayout>
    </Show>
);

export default SoilTypeShow;
