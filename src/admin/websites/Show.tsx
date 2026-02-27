import {
    Show,
    SimpleShowLayout,
    TextField,
    UrlField,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    ReferenceManyField,
    Datagrid,
    ReferenceField,
    DateField,
    DeleteWithConfirmButton,
    CreateButton,
    ShowButton,
    useRecordContext,
    useGetOne,
    useGetList,
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

const ExclusionCounts = (_props: { label?: string }) => {
    const record = useRecordContext(); // area_website record
    const { data: area } = useGetOne('areas', { id: record?.area_id || '' });
    const { data: plotExclusions } = useGetList('website_plot_exclusions', {
        filter: { website_id: record?.website_id },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'id', order: 'ASC' },
    });
    const { data: sensorExclusions } = useGetList('website_sensor_exclusions', {
        filter: { website_id: record?.website_id },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'id', order: 'ASC' },
    });

    if (!record || !area || !plotExclusions || !sensorExclusions) return null;

    const areaPlotIds = new Set((area.plots || []).map((p: any) => p.id));
    const areaSensorIds = new Set((area.sensor_profiles || []).map((s: any) => s.id));

    const excludedPlots = plotExclusions.filter(ex => areaPlotIds.has(ex.plot_id)).length;
    const excludedSensors = sensorExclusions.filter(ex => areaSensorIds.has(ex.sensorprofile_id)).length;

    if (excludedPlots === 0 && excludedSensors === 0) return <span>None</span>;

    const parts = [];
    if (excludedPlots > 0) parts.push(`${excludedPlots} plot${excludedPlots !== 1 ? 's' : ''}`);
    if (excludedSensors > 0) parts.push(`${excludedSensors} sensor${excludedSensors !== 1 ? 's' : ''}`);
    return <span>{parts.join(', ')}</span>;
};

const WebsiteShow = () => {
    return (
        <Show actions={<WebsiteShowActions />}>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="slug" />
                <UrlField source="url" target="_blank" />
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
                            <ExclusionCounts label="Exclusions" />
                            <ShowButton />
                            <EditButton />
                            <DeleteWithConfirmButton redirect={false} />
                        </Datagrid>
                    </ReferenceManyField>
                    <AddAreaWebsiteButton />
                </Box>
            </SimpleShowLayout>
        </Show>
    );
};

export default WebsiteShow;
