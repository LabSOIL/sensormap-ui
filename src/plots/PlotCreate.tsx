/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    NumberField,
    minValue,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    required,
    Button,
    ImageField,
    ImageInput,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { apiUrl } from '../App';

const ElevationInput = () => {
    const formContext = useFormContext();
    const [errorMessage, setErrorMessage] = useState(null);
    const [successResponse, setSuccessResponse] = useState(false);

    const updateElevation = () => {

        const x = formContext.getValues('coord_x');
        const y = formContext.getValues('coord_y');
        const url = `https://api3.geo.admin.ch/rest/services/height?easting=${x}&northing=${y}&sr=2056&format=json&geometryFormat=geojson`;
        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.success === false) {
                    setErrorMessage(`Error fetching elevation: ${data.error.message}`);
                } else {
                    setErrorMessage(null);
                    setSuccessResponse(true);
                    formContext.setValue('coord_z', data.height);
                }
            })
    }

    return (<>
        <Button
            label="Get from Digital Elevation Model"
            variant="outlined"
            color={errorMessage ? 'error' : successResponse ? 'success' : 'primary'}
            onClick={(event) => {
                updateElevation();
            }}
        />
        <Typography
            variant="caption"
            color={'error'}
        >
            {errorMessage ? errorMessage : null}
        </Typography>
        <NumberInput source="coord_z" label="Elevation (m)" />
    </>
    )
}

const PlotCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm >
                <ImageInput
                    source="image"
                    label="Related image"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
                <TextField source="id" />
                <NumberInput
                    source="plot_iterator"
                    label="ID"
                    validate={[required(), minValue(0)]}
                    helperText={<>A numeric ID given to the plot<br />that is unique within the area. <br />Example: 1 will become BF01 in Binntal Flat</>}
                />
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
                <SelectInput source="gradient" choices={[
                    { id: 'flat', name: 'Flat' },
                    { id: 'slope', name: 'Slope' },
                ]} defaultValue={'flat'} helperText="Flat or Slope" validate={[required()]} />
                <DateInput source="created_on" label="Description Date" />
                <NumberInput source="coord_x" label="X Coordinate" helperText="in metres; SRID 2056 (Swiss CH1903+ / LV95)" validate={[required()]} />
                <NumberInput source="coord_y" label="Y Coordinate" helperText="in metres; SRID 2056 (Swiss CH1903+ / LV95)" validate={[required()]} />
                <ElevationInput />
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />
            </SimpleForm>
        </Create >

    )
};

export default PlotCreate;
