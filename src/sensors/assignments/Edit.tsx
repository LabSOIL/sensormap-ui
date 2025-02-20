import {
    Edit,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    required,
} from 'react-admin';

const SensorProfileAssignmentEdit = (props) => {
    return (
        <Edit mutationMode="pessimistic" {...props}>
            <SimpleForm>
                <ReferenceInput source="sensor_id" reference="sensors">
                    <SelectInput optionText="name" validate={required()} />
                </ReferenceInput>
                <ReferenceInput source="sensorprofile_id" reference="sensor_profiles" >
                    <SelectInput optionText="name" validate={required()} />
                </ReferenceInput>
                <DateTimeInput source="date_from" label="Date From" validate={required()} parse={(date: Date) => (date ? date.toISOString().replace('Z', '') : null)} />
                <DateTimeInput source="date_to" label="Date To" validate={required()} parse={(date: Date) => (date ? date.toISOString().replace('Z', '') : null)} />
            </SimpleForm>
        </Edit>
    );
};

export default SensorProfileAssignmentEdit;
