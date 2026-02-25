import {
    Edit,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';
import ColorInput from './ColorInput';

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
