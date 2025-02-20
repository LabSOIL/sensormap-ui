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
} from 'react-admin';

const SensorProfileAssignmentListActions = () => (
    <TopToolbar>
        <CreateButton />
    </TopToolbar>
);

const SensorProfileAssignmentList = (props) => (
    <List {...props} actions={<SensorProfileAssignmentListActions />}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <ReferenceField source="sensor_id" reference="sensors">
                <TextField source="id" />
            </ReferenceField>
            <ReferenceField source="sensorprofile_id" reference="sensorprofiles">
                <TextField source="id" />
            </ReferenceField>
            <DateField source="date_from" label="From" showTime />
            <DateField source="date_to" label="To" showTime />
            <DateField source="last_updated" label="Last Updated" showTime />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default SensorProfileAssignmentList;
