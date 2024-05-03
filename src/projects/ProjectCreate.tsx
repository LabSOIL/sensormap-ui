import { Typography } from '@mui/material';
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';
import { ColorInput } from 'react-admin-color-picker';

const ProjectCreate = () => {


    return (
        <Create redirect="list">
            <SimpleForm >
                <Typography variant="h6" gutterBottom>
                    Create a new Project
                </Typography>
                <Typography gutterBottom>
                    A project establishes a study area.
                </Typography>
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
                <ColorInput source="color" />
            </SimpleForm>
        </Create>
    )
};

export default ProjectCreate;
