import {
    Create,
    SimpleForm,
    TextInput,
    required,
    ReferenceInput,
    SelectInput,
    FileInput,
    FileField,
    useGetOne,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { CoordinateInput } from '../maps/CoordinateEntry';
import { useEffect } from 'react';


const AreaCoordinateEntry = () => {
    const { setValue, watch } = useFormContext();
    const selectedArea = watch("area_id");
    
    useEffect(() => {
        if (selectedArea) {
            console.log('Selected area:', selectedArea);
        }
    }, [selectedArea]);
        
    return <CoordinateInput area_id={selectedArea} />;
}
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
                <AreaCoordinateEntry/>
                
                <TextInput source="name" validate={[required()]}  />
                <TextInput source="description" />
                <TextInput source="comment" label="Notes/Comments" />
                <TextInput source="serial_number" />
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
