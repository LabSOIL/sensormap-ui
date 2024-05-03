/* eslint react/jsx-key: off */
import * as React from 'react';
import { useParams } from 'react-router';
import {
    Edit,
    SimpleForm,
    TextField,
    TextInput,
    required,
    List,
    Datagrid,
    ResourceContextProvider,
    EditButton,
    TranslatableInputs,
    NumberInput,
    FileInput,
    FileField,
    ReferenceInput,
    SelectInput,
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
