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
import CoordinateInput from '../maps/CoordinateEntry';

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
                <ImageFieldPreview source="image" />
                <ImageInput
                    source="image"
                    label="Related image"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
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
                <CoordinateInput />
                <TextInput source="description_horizon" label="Horizon description" multiline />
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />
            </SimpleForm>
        </Edit>
    )
};

export default PlotEdit;
