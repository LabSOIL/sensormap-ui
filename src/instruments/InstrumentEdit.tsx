/* eslint react/jsx-key: off */
import {
    Edit,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    Toolbar,
    SaveButton,
} from 'react-admin';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const InstrumentEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
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
            </SimpleForm>
        </Edit>
    )
};

export default InstrumentEdit;
