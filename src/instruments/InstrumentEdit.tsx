/* eslint react/jsx-key: off */
import {
    DateInput,
    Edit,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required,
    Button,
    Toolbar,
    SaveButton,
    ImageInput,
    ImageField,
    useRecordContext,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Typography } from '@mui/material';
import { apiUrl } from '../App';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const InstrumentEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <TextInput source="name" />
                <TextInput source="description" multiline />
            </SimpleForm>
        </Edit>
    )
};

export default InstrumentEdit;
