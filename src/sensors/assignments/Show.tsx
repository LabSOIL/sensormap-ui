import React from 'react';
import {
    Show,
    SimpleShowLayout,
    ArrayField,
    Datagrid,
    ReferenceField,
    TextField,
    DateField,
    CreateButton,
    useRecordContext,
} from 'react-admin';
import { Box } from '@mui/material';

const AssignSensorButton = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <Box mt={2}>
            <CreateButton
                label="Assign Sensor"
                resource="sensor_profile_assignments"
                state={{ record: { sensorprofile_id: record.id } }}
            />
        </Box>
    );
};

const SensorProfileAssignmentShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
                    <ReferenceField source="sensor_id" reference="sensors">
                        <TextField source="name" />
                    </ReferenceField>
                    <ReferenceField source="sensorprofile_id" reference="sensor_profiles">
                        <TextField source="name" />
                    </ReferenceField>
                    <DateField source="date_from" label="From" showTime />
                    <DateField source="date_to" label="To" showTime />
            <AssignSensorButton />
        </SimpleShowLayout>
    </Show>
);

export default SensorProfileAssignmentShow;
