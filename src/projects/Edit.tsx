import {
    Edit,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';
import { ColorInput } from 'react-admin-color-picker';

const ProjectEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
                <ColorInput source="color" />
            </SimpleForm>
        </Edit>
    )
};

export default ProjectEdit;
