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
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { Typography } from '@mui/material';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const ElevationInput = () => {
    const formContext = useFormContext();
    const [errorMessage, setErrorMessage] = useState(null);
    const [successResponse, setSuccessResponse] = useState(false);

    const updateElevation = () => {
        console.log('Update elevation');
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

const PlotEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <TextInput
                    source="plot_iterator"
                    label="ID"
                    validate={[required()]}
                    helperText={<>The ID given to the plot that is unique within the area. <br />Example: 1 will become BF01 in Binntal Flat</>}
                />
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
                <SelectInput source="gradient" choices={[
                    { id: 'flat', name: 'Flat' },
                    { id: 'slope', name: 'Slope' },
                ]} defaultValue={'flat'} helperText="Flat or Slope" validate={[required()]} />
                <DateInput source="created_on" label="Description Date" />
                <NumberInput source="coord_x" label="X Coordinate (m; SRID 2056)" validate={[required()]} />
                <NumberInput source="coord_y" label="Y Coordinate (m; SRID 2056)" validate={[required()]} />
                <ElevationInput />
                <ReferenceInput source="soil_type_id" reference="soil_types">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <TextInput source="description_horizon" label="Horizon description" multiline />
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />
                <NumberInput source="slope" label="Slope (°)" />
            </SimpleForm>
        </Edit>
    )
};

export default PlotEdit;
