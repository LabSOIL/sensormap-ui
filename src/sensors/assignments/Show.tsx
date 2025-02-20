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
    CreateButton,
    useRecordContext,
} from 'react-admin';
import { Box } from '@mui/material';

const ShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' &&
                <>
                    <EditButton label='Modify assignment' />
                    <DeleteButton mutationMode="pessimistic" label='Remove assignment' />
                </>
            }
        </TopToolbar>
    );
}


const SensorProfileAssignmentShow = (props) => (
    <Show {...props} actions={<ShowActions />}
    >
        <SimpleShowLayout>
            <ReferenceField source="sensor_id" reference="sensors">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="sensorprofile_id" reference="sensor_profiles">
                <TextField source="name" />
            </ReferenceField>
            <DateField source="date_from" label="From" showTime />
            <DateField source="date_to" label="To" showTime />
        </SimpleShowLayout>
    </Show>
);

export default SensorProfileAssignmentShow;
