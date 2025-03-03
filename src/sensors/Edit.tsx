import {
    Edit,
    SimpleForm,
    TextInput,
    required,
    FileInput,
    FileField,
} from 'react-admin';


const SensorEdit = () => {
    return (
        <Edit mutationMode="pessimistic" redirect="show">
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
                <TextInput source="serial_number" />
                <TextInput source="comment" label="Notes/Comments" multiline />
                <FileInput label="Instrument data" source="attachments">
                    <FileField
                        source="src"
                        title="title"
                    />
                </FileInput>
            </SimpleForm>
        </Edit>
    )
};

export default SensorEdit;
