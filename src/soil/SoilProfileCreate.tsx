/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';


const SoilProfileCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <ReferenceInput source="soil_type_id" reference="soil_types">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <TextInput source="location" />
                <TextInput source="weather" />
                <TextInput source="topography" />
                <DateInput source="date_created" />
                <TextInput source="description" />
            </SimpleForm>
        </Create >

    )
};

export default SoilProfileCreate;
