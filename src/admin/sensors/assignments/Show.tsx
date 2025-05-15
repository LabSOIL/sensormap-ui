import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    ReferenceField,
    TextField,
    DateField,
    NumberField,
} from 'react-admin';
import { Box } from '@mui/material';
import SensorPlotWithOverlay from '../../plots/SensorPlotWithOverlay';

const ShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && (
                <>
                    <EditButton label="Modify assignment" />
                    <DeleteButton mutationMode="pessimistic" label="Remove assignment" />
                </>
            )}
        </TopToolbar>
    );
};

const SensorProfileAssignmentShow = (props) => (
    <Show {...props} actions={<ShowActions />}>
        <SimpleShowLayout>
            <ReferenceField source="sensor_id" reference="sensors">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="sensorprofile_id" reference="sensor_profiles">
                <TextField source="name" />
            </ReferenceField>
            <DateField source="date_from" label="From" showTime />
            <DateField source="date_to" label="To" showTime />
            <NumberField source="depth_cm_sensor1" label="Depth (cm) Sensor 1" />
            <NumberField source="depth_cm_sensor2" label="Depth (cm) Sensor 2" />
            <NumberField source="depth_cm_sensor3" label="Depth (cm) Sensor 3" />
            <Box mt={2}>
                <SensorPlotWithOverlay interactive={false} />
            </Box>

        </SimpleShowLayout>
    </Show>
);

export default SensorProfileAssignmentShow;
