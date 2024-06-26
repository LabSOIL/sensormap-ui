/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
    ImageField,
    ImageInput,
} from 'react-admin';

const SoilTypeCreate = () => {

    return (
        <Create redirect="show">
            <SimpleForm>
                <TextField source="id" />
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" validate={[required()]} />
                <ImageInput
                    source="image"
                    label="Related image"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
            </SimpleForm>
        </Create >

    )
};

export default SoilTypeCreate;
