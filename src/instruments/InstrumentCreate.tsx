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
    FileInput,
    FileField,
    FunctionField,
    useRecordContext,
} from 'react-admin';
import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';

const InstrumentCreate = () => {
    const [selectedArea, setSelectedArea] = useState(null);
    const record = useRecordContext();
    return (
        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <TextInput source="name" />
                <TextInput source="description" multiline />
                <ReferenceInput
                    source="project_id"
                    reference="projects"
                    sort={{ field: 'name', order: 'ASC' }}
                >
                    <SelectInput
                        label="Associated project (if any)"
                        source="projects_id"
                        optionText={(record) => `${record.name}`}
                    />
                </ReferenceInput>
                <FileInput source="attachments">
                    <FileField source="src" title="title" />
                </FileInput>
            </SimpleForm>
        </Create >
    )
};

export default InstrumentCreate;
