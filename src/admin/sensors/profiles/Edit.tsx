import {
    Edit,
    SimpleForm,
    TextInput,
    required,
    ReferenceInput,
    SelectInput,
    Toolbar,
    SaveButton,
    NumberInput,
} from 'react-admin';
import { CoordinateInput } from '../../maps/CoordinateEntry';


const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const SensorProfileEdit = () => {
    return (
        <Edit>
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput
                        label="Area"
                        source="area_id"
                        optionText="name" />
                </ReferenceInput>
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
                <TextInput source="serial_number" />
                <TextInput source="comment" label="Notes/Comments" multiline />
                <CoordinateInput updateElevationOnMount={false} />
            </SimpleForm>
        </Edit>
    )
};

export default SensorProfileEdit;
