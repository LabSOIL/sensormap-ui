import React from 'react';
import {
    Edit,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    required,
    useNotify,
    useRedirect,
} from 'react-admin';

const SensorProfileAssignmentEdit = (props) => {
    const notify = useNotify();
    const redirect = useRedirect();

    const onSuccess = () => {
        notify('Assignment updated');
        redirect('/sensor_profile_assignments');
    };

    return (
        <Edit mutationOptions={{ onSuccess }} {...props}>
            <SimpleForm>
                <ReferenceInput source="sensor_id" reference="sensors">
                    <SelectInput optionText="name"  validate={required()}/>
                </ReferenceInput>
                <ReferenceInput source="sensorprofile_id" reference="sensor_profiles" >
                    <SelectInput optionText="name"  validate={required()}/>
                </ReferenceInput>
                <DateTimeInput source="date_from" label="Date From" validate={required()} />
                <DateTimeInput source="date_to" label="Date To" validate={required()} />
            </SimpleForm>
        </Edit>
    );
};

export default SensorProfileAssignmentEdit;
