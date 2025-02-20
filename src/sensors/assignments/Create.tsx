import React from 'react';
import {
    Create,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    required,
    useNotify,
    useRedirect,
} from 'react-admin';

const SensorProfileAssignmentCreate = (props) => {
    const notify = useNotify();
    const redirect = useRedirect();

    const onSuccess = () => {
        notify('Assignment created');
        redirect('/sensor_profile_assignments');
    };

    return (
        <Create mutationOptions={{ onSuccess }} {...props}>
            <SimpleForm>
                <ReferenceInput source="sensor_id" reference="sensors" >
                    <SelectInput optionText="name" validate={required()}/>
                </ReferenceInput>
                <ReferenceInput source="sensorprofile_id" reference="sensor_profiles" >
                    <SelectInput optionText="name" validate={required()}/>
                </ReferenceInput>
                <DateTimeInput source="date_from" label="Date From" parse={(date: Date) => (date ? date.toISOString().replace('Z', '') : null)}/>
                <DateTimeInput source="date_to" label="Date To" parse={(date: Date) => (date ? date.toISOString().replace('Z', '') : null)}/>
            </SimpleForm>
        </Create>
    );
};

export default SensorProfileAssignmentCreate;
