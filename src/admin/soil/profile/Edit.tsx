/* eslint react/jsx-key: off */
import {
    ArrayInput,
    DateInput,
    Edit,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    SimpleFormIterator,
    Toolbar,
    SaveButton,
    TextInput,
    required,
    Button,
    minValue,
    ImageInput,
    ImageField,
    useRecordContext,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Typography } from '@mui/material';
import CoordinateInput, { AreaCoordinateEntry } from '../../maps/CoordinateEntry';

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
const SoilProfileEdit = () => {
    return (
        <Edit redirect="show" >
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <TextInput source="name" validate={[required()]} />
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
                <AreaCoordinateEntry />
                <SelectInput source="gradient" choices={[
                    { id: 'flat', name: 'Flat' },
                    { id: 'slope', name: 'Slope' },
                ]} defaultValue={'flat'} helperText="Flat or Slope" validate={[required()]} />
                <DateInput source="created_on" label="Description Date" />
                <ReferenceInput source="soil_type_id" reference="soil_types">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />
                <TextInput source="parent_material" label="Parent material" />
                <ArrayInput source="description_horizon" label="Horizon description" helperText="Add a new row for another title and description" >
                    <SimpleFormIterator inline>
                        <TextInput source="title" validate={[required()]} />
                        <TextInput source="description" validate={[required()]} multiline />
                    </SimpleFormIterator>
                </ArrayInput>
                <ImageFieldPreview source="soil_diagram" />
                <ImageInput
                    source="soil_diagram"
                    label="Soil diagram"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
                <ImageFieldPreview source="photo" />
                <ImageInput
                    source="photo"
                    label="Photo"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
            </SimpleForm>

        </Edit >

    )
};

export default SoilProfileEdit;
