import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    ReferenceField,
    DateField,
    TopToolbar,
    CreateButton,
    EditButton,
    DeleteButton,
    NumberField,
} from 'react-admin';


const SensorProfileAssignmentListActions = () => (
    <TopToolbar>
        <CreateButton />
    </TopToolbar>
);

const SensorProfileAssignmentList = (props) => (
    <List {...props} actions={<SensorProfileAssignmentListActions />}>
        <Datagrid rowClick="show">
            <ReferenceField source="sensor_id" reference="sensors">
                <TextField source="name" />
            </ReferenceField>
            <ReferenceField source="sensorprofile_id" reference="sensor_profiles">
                <TextField source="name" />
            </ReferenceField>
            <DateField source="date_from" label="From" showTime />
            <DateField source="date_to" label="To" showTime />
            <DateField source="last_updated" label="Last Updated" showTime />
            <NumberField source="depth_cm_sensor1" label="Depth (cm) Sensor 1" />
            <NumberField source="depth_cm_sensor2" label="Depth (cm) Sensor 2" />
            <NumberField source="depth_cm_sensor3" label="Depth (cm) Sensor 3" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default SensorProfileAssignmentList;
