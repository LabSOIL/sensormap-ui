import {
    Create,
    SimpleForm,
    TextInput,
    required,
    ReferenceInput,
    SelectInput,
    Toolbar,
    SaveButton,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { CoordinateInput, AreaCoordinateEntry } from '../../maps/CoordinateEntry';
import { useEffect } from 'react';


const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const SensorProfileCreate = () => {

    return (
        <Create redirect="list">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="name" validate={[required()]} />
                Define the area to which this sensor belongs:
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput
                        label="Area"
                        source="area_id"
                        optionText="name"
                        validate={required()}
                    />
                </ReferenceInput>
                <AreaCoordinateEntry source="area_id" />
                <TextInput source="description" />
                <TextInput source="comment" label="Notes/Comments" />
                <TextInput source="serial_number" />
            </SimpleForm>
        </Create>
    )
};

export default SensorProfileCreate;
