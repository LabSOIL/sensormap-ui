/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    minValue,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    required,
    ArrayInput,
    SimpleFormIterator,
    TextInput,
    ChipField,
    FunctionField,
    useRecordContext,
} from 'react-admin';
import TransectCreateMap from '../maps/Transects';
import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const TransectCreate = () => {
    const [selectedArea, setSelectedArea] = useState(null);
    const record = useRecordContext();
    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput
                        optionText="name"
                        optionText={(record) => `${record.name} (${record.plots.length} plots)`}
                        validate={[required()]}
                        onChange={(record) => { setSelectedArea(record.target.value) }} />
                </ReferenceInput>
                {selectedArea ? <TransectCreateMap area_id={selectedArea} /> : null}
                <ArrayInput source="nodes" >
                    <SimpleFormIterator getItemLabel={index => `#${index + 1}`} inline >
                        <TextInput source="name" readOnly />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Create >
    )
};

export default TransectCreate;
