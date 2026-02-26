import {
    Edit,
    SimpleForm,
    TextInput,
    required,
} from 'react-admin';

const WebsiteEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput disabled label="Id" source="id" />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="slug" validate={[required()]} helperText="URL-friendly identifier (e.g. 'alpinesoc', 'rewetflux')" />
                <TextInput source="url" />
                <TextInput source="description" multiline />
            </SimpleForm>
        </Edit>
    );
};

export default WebsiteEdit;
