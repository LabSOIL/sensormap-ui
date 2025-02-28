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
import CoordinateInput, { AreaCoordinateEntry } from '../maps/CoordinateEntry';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);



const ImageFieldPreview = ({ source }) => {
    const record = useRecordContext();
    if (!record || !record[source]) {
        return null;
    }
    const base64Image = record[source];
    return (
        <div style={{ textAlign: 'left', margin: '0 10px' }}>
            <img src={`${base64Image}`} style={{ maxWidth: '30%', height: 'auto' }} />
        </div>
    );

};
const PlotEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <TextInput source="name" label="Name" validate={[required()]} />
                <ReferenceInput source="area_id" reference="areas">
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
                <AreaCoordinateEntry />
                <SelectInput
                    source="gradient"
                    choices={[
                        { id: 'flat', name: 'Flat' },
                        { id: 'slope', name: 'Slope' },
                    ]}
                    defaultValue={'flat'}
                    helperText="Flat or Slope"
                    validate={[required()]}
                />
                <DateInput source="created_on" label="Description Date" />
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />


                <ImageFieldPreview source="image" />
                <ImageInput
                    source="image"
                    label="Related image"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
            </SimpleForm>
        </Edit>
    )
};

export default PlotEdit;
