/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    Button,
    minValue,
    TextInput,
    required,
    ArrayInput,
    SimpleFormIterator,
    ImageField,
    ImageInput,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Typography } from '@mui/material';
import CoordinateInput, { AreaCoordinateEntry } from '../../maps/CoordinateEntry';


const SoilClassificationCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm >
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
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />
                <TextInput source="parent_material" label="Parent Material" />
                <ArrayInput source="description_horizon" label="Horizon description" helperText="Add a new row for another title and description" >
                    <SimpleFormIterator inline>
                        <TextInput source="title" validate={[required()]} />
                        <TextInput source="description" validate={[required()]} multiline />
                    </SimpleFormIterator>
                </ArrayInput>
                <ImageInput
                    source="soil_diagram"
                    label="Soil diagram"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
                <ImageInput
                    source="photo"
                    label="Photo"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
            </SimpleForm>
        </Create >

    )
};

export default SoilClassificationCreate;
