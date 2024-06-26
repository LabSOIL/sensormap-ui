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
                <Grid item xs={6}>
                    <ImageField source="image" />
                </Grid>
            </Grid>
        </SimpleShowLayout>
    </Show>
);

export default SoilTypeShow;
