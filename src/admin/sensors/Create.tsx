import {
    Create,
    SimpleForm,
    TextInput,
    FileInput,
    FileField,
} from 'react-admin';


const SensorCreate = () => {
    return (
        <Create redirect="list">
            <SimpleForm >
                <TextInput source="name" />
                <TextInput source="description" />
                <TextInput source="comment" label="Notes/Comments" />
                <TextInput source="serial_number" />
                <FileInput label="Instrument data" source="attachments">
                    <FileField
                        source="src"
                        title="title"
                    />
                </FileInput>
            </SimpleForm>
        </Create>
    )
};

export default SensorCreate;
