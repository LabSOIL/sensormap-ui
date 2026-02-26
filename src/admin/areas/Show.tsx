import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceManyCount,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    ReferenceField,
    DateField,
    Labeled,
    ReferenceManyField,
    SingleFieldList,
    ChipField,
} from "react-admin";
import { LocationFieldPoints } from '../maps/Points';
import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';



const AreaShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && (
                <>
                    <EditButton />
                    <DeleteButton />
                </>
            )}
        </TopToolbar>
    );
}

export const AreaShow = () => {
    return (
        <Show actions={<AreaShowActions />} >
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Grid item xs={6}>
                            <Labeled label="Name">
                                <TextField source="name" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Description">
                                <TextField source="description" />
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
                            <Labeled label="Project">
                                <ReferenceField
                                    label="Project"
                                    source="project_id"
                                    reference="projects" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Sensor Profiles">
                                <ReferenceManyCount
                                    label="Sensor Profiles"
                                    reference="sensor_profiles"
                                    target="area_id"
                                    link
                                />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Plots">
                                <ReferenceManyCount
                                    label="Plots"
                                    reference="plots"
                                    target="area_id"
                                    link
                                />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Soil Profiles">
                                <ReferenceManyCount
                                    label="Soil Profiles"
                                    reference="soil_profiles"
                                    target="area_id"
                                    link
                                />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Transects">
                                <ReferenceManyCount
                                    label="Transects"
                                    reference="transects"
                                    target="area_id"
                                    link
                                />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6}>
                            <Labeled label="Visible on Websites">
                                <ReferenceManyField reference="area_websites" target="area_id">
                                    <SingleFieldList linkType={false}>
                                        <ReferenceField source="website_id" reference="websites" link="show">
                                            <ChipField source="name" />
                                        </ReferenceField>
                                    </SingleFieldList>
                                </ReferenceManyField>
                            </Labeled>
                            <Typography variant="body2" color="textSecondary">
                                To manage website visibility, go to the website's page (Websites menu) and use Area Assignments.
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid item xs={9}>
                        <LocationFieldPoints />
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    );
};

export default AreaShow;
