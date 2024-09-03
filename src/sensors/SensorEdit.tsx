import {
    Edit,
    SimpleForm,
    TextField,
    TextInput,
    required,
    FileInput,
    FileField,
    ReferenceInput,
    SelectInput,
} from 'react-admin';
import { CoordinateInput } from '../maps/CoordinateEntry';


const SensorEdit = () => {
    return (
        <Edit>
            <SimpleForm>
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
                <FileInput label="Instrument data" source="attachments">
                    <FileField
                        source="src"
                        title="title"
                    />
                </FileInput>
            </SimpleForm>
        </Edit>
    )
};

export default SensorEdit;
