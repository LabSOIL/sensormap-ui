/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    Labeled,
    TextInput,
    required,
    DateField,
    FunctionField
} from 'react-admin';
import { Grid } from '@mui/material';



const SoilProfileCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <ReferenceInput source="soil_type_id" reference="soil_types">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <NumberInput source="coord_x" label="X Coordinate (m; SRID 2056)" validate={[required()]} />
                <NumberInput source="coord_y" label="Y Coordinate (m; SRID 2056)" validate={[required()]} />
                <NumberInput source="coord_z" label="Elevation (m)" validate={[required()]} />
                <DateInput source="date_created" label="Description Date" />
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <NumberInput source="aspect" label="Aspect (°)" />
                <NumberInput source="slope" label="Slope (°)" />
                <TextInput source="weather" />
                <TextInput source="lythology_surficial_deposit" label="Lythology/Surficial deposit" />
                <TextInput source="description_horizon" label="Horizon description" multiline />



            </SimpleForm>
        </Create >

    )
};

export default SoilProfileCreate;
