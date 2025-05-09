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
    FunctionField,
    ArrayField,
    SimpleList,
} from "react-admin";
import { LocationFieldPoints } from '../../maps/Points';
import { Grid, Typography } from '@mui/material';

const SoilClassificationShowTitle = () => {
    const record = useRecordContext();
    if (!record) return null;
    return <span>{record.place} Soil Profile: {record.name}</span>;
};

const SoilClassificationShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <>
                <EditButton />
                <DeleteButton />
            </>}
        </TopToolbar>
    );
};

const ColoredLine = ({ color, height }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: height
        }}
    />
);

export const SoilClassificationShow = () => {

    return (
        <Show title={<SoilClassificationShowTitle />} actions={<SoilClassificationShowActions />}>
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Labeled label="Name">
                            <TextField source="name" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Description">
                            <TextField source="description" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Area">
                            <ReferenceField source="area_id" reference="areas" link="show">
                                <TextField source="name" />
                            </ReferenceField>
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Soil Type">
                            <ReferenceField source="soil_type_id" reference="soil_types" link="show">
                                <TextField source="name" />
                            </ReferenceField>
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Depth Upper (cm)">
                            <TextField source="depth_upper_cm" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Depth Lower (cm)">
                            <TextField source="depth_lower_cm" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Sample Date">
                            <DateField source="sample_date" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Fe Abundance (g/cm³)">
                            <TextField source="fe_abundance_g_per_cm3" />
                        </Labeled>
                    </Grid>
                </Grid>

                <ColoredLine color="grey" height={2} />

                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant="h6" textAlign="center" gutterBottom>Coordinates</Typography>
                        <LocationFieldPoints />
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    );
};

export default SoilClassificationShow;
