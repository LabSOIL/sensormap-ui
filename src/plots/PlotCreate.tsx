/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';


const PlotCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
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
                <NumberInput source="coord_z" label="Elevation (m)" />
                <NumberInput source="coord_x" label="X Coordinate (m; SRID 2056)" validate={[required()]} />
                <NumberInput source="coord_y" label="Y Coordinate (m; SRID 2056)" validate={[required()]} />
                <ReferenceInput source="soil_type_id" reference="soil_types">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <TextInput source="description_horizon" label="Horizon description" multiline />
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />
                <NumberInput source="slope" label="Slope (°)" />

            </SimpleForm>
        </Create >

    )
};

export default PlotCreate;
