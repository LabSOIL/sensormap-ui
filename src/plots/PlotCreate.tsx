/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required,
    ImageField,
    ImageInput,
} from 'react-admin';

import 'leaflet/dist/leaflet.css';
import { CoordinateInput } from '../maps/CoordinateEntry';

const PlotCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm>
                <ImageInput
                    source="image"
                    label="Related image"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
                <TextInput source="name" label="Name" validate={[required()]} />
                <ReferenceInput source="area_id" reference="areas">
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
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
                <CoordinateInput />
            </SimpleForm>
        </Create>
    );
};

export default PlotCreate;
