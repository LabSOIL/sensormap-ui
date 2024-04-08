/* eslint react/jsx-key: off */
import {
    DateInput,
    Edit,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required
} from 'react-admin';

const SoilProfileEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" disabled />
                <TextInput source="name" validate={[required()]} />
                <ReferenceInput source="soil_type_id" reference="soil_types">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <TextInput source="description" label="Horizon description" multiline />
                <TextInput source="location" />
                <TextInput source="weather" />
                <TextInput source="topography" />
                <DateInput source="date_created" />
            </SimpleForm>
        </Edit>
    )
};

export default SoilProfileEdit;
