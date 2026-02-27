import {
    Show,
    SimpleShowLayout,
    ReferenceField,
    TextField,
    DateField,
    Labeled,
    useRecordContext,
} from 'react-admin';
import { Typography, Box } from '@mui/material';
import ExclusionMap from '../maps/ExclusionMap';

const ExclusionSection = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <Box mt={3}>
            <Typography variant="h6" gutterBottom>Exclusion Management</Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Click a plot or sensor marker on the map to toggle its exclusion from this website. Green/blue markers are included; gray markers are excluded.
            </Typography>
            <ExclusionMap websiteId={String(record.website_id)} areaId={String(record.area_id)} />
        </Box>
    );
};

const AreaWebsiteShow = () => {
    return (
        <Show>
            <SimpleShowLayout>
                <Labeled label="Website">
                    <ReferenceField source="website_id" reference="websites" link="show">
                        <TextField source="name" />
                    </ReferenceField>
                </Labeled>
                <Labeled label="Area">
                    <ReferenceField source="area_id" reference="areas" link="show">
                        <TextField source="name" />
                    </ReferenceField>
                </Labeled>
                <DateField source="date_from" label="Date From" showTime />
                <DateField source="date_to" label="Date To" showTime />
                <ExclusionSection />
            </SimpleShowLayout>
        </Show>
    );
};

export default AreaWebsiteShow;
