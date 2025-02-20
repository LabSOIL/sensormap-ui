import {
    Create,
    SimpleForm,
    TextInput,
    required,
    ReferenceInput,
    SelectInput,
    FileInput,
    FileField,
} from 'react-admin';
import { CoordinateInput } from '../maps/CoordinateEntry';


const SensorProfileCreate = () => {
    return (
        <Create redirect="list">
            <SimpleForm >

                Define the area to which this sensor belongs:
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput
                        label="Area"
                        source="area_id"
                        optionText="name"
                        validate={required()}
                    />
                </ReferenceInput>
                <TextInput source="name" validate={[required()]}  />
                <TextInput source="description" />
                <TextInput source="comment" label="Notes/Comments" />
                <TextInput source="serial_number" />
                <CoordinateInput />
                <FileInput label="Instrument data" source="attachments">
                    <FileField
                        source="src"
                        title="title"
                    />
                </FileInput>
            </SimpleForm>
        </Create>
    )
};

export default SensorProfileCreate;
