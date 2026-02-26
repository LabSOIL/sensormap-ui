import {
    Show,
    SimpleShowLayout,
    TextField,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    Labeled,
    ReferenceManyField,
    Datagrid,
    ReferenceField,
    DateField,
    DeleteWithConfirmButton,
    CreateButton,
    useRecordContext,
} from "react-admin";
import { Typography, Box } from '@mui/material';

const WebsiteShowActions = () => {
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
};

const AddAreaWebsiteButton = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <CreateButton
            resource="area_websites"
            label="Add Area"
            state={{ record: { website_id: record.id } }}
        />
    );
};

const AddPlotExclusionButton = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <CreateButton
            resource="website_plot_exclusions"
            label="Add Exclusion"
            state={{ record: { website_id: record.id } }}
        />
    );
};

const AddSensorExclusionButton = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <CreateButton
            resource="website_sensor_exclusions"
            label="Add Exclusion"
            state={{ record: { website_id: record.id } }}
        />
    );
};

const WebsiteShow = () => {
    return (
        <Show actions={<WebsiteShowActions />}>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="slug" />
                <TextField source="url" />
                <TextField source="description" />

                <Box mt={3}>
                    <Typography variant="h6" gutterBottom>Area Assignments</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Areas assigned to this website will be visible on the public map. Set optional date restrictions to limit which time period of data is shown.
                    </Typography>
                    <ReferenceManyField
                        reference="area_websites"
                        target="website_id"
                        label={false}
                    >
                        <Datagrid bulkActionButtons={false}>
                            <ReferenceField source="area_id" reference="areas" link="show">
                                <TextField source="name" />
                            </ReferenceField>
                            <DateField source="date_from" label="Date From" showTime />
                            <DateField source="date_to" label="Date To" showTime />
                            <EditButton />
                            <DeleteWithConfirmButton redirect={false} />
                        </Datagrid>
                    </ReferenceManyField>
                    <AddAreaWebsiteButton />
                </Box>

                <Box mt={3}>
                    <Typography variant="h6" gutterBottom>Plot Exclusions</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        By default, all plots within assigned areas are visible. To hide a specific plot from this website, add an exclusion. To make a hidden plot visible again, delete its exclusion.
                    </Typography>
                    <ReferenceManyField
                        reference="website_plot_exclusions"
                        target="website_id"
                        label={false}
                    >
                        <Datagrid bulkActionButtons={false}>
                            <ReferenceField source="plot_id" reference="plots" link="show">
                                <TextField source="name" />
                            </ReferenceField>
                            <DeleteWithConfirmButton redirect={false} />
                        </Datagrid>
                    </ReferenceManyField>
                    <AddPlotExclusionButton />
                </Box>

                <Box mt={3}>
                    <Typography variant="h6" gutterBottom>Sensor Exclusions</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        By default, all sensor profiles within assigned areas are visible. To hide a specific sensor from this website, add an exclusion. To make a hidden sensor visible again, delete its exclusion.
                    </Typography>
                    <ReferenceManyField
                        reference="website_sensor_exclusions"
                        target="website_id"
                        label={false}
                    >
                        <Datagrid bulkActionButtons={false}>
                            <ReferenceField source="sensorprofile_id" reference="sensor_profiles" link="show">
                                <TextField source="name" />
                            </ReferenceField>
                            <DeleteWithConfirmButton redirect={false} />
                        </Datagrid>
                    </ReferenceManyField>
                    <AddSensorExclusionButton />
                </Box>
            </SimpleShowLayout>
        </Show>
    );
};

export default WebsiteShow;
