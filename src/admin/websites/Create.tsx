import {
    Create,
    SimpleForm,
    TextInput,
    required,
} from 'react-admin';

const WebsiteCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm>
                <TextInput source="name" validate={[required()]} />
                <TextInput source="slug" validate={[required()]} helperText="URL-friendly identifier (e.g. 'alpinesoc', 'rewetflux')" />
                <TextInput source="url" helperText="Website URL (optional)" />
                <TextInput source="description" multiline />
            </SimpleForm>
        </Create>
    );
};

export default WebsiteCreate;
