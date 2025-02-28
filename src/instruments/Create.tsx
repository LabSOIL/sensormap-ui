import {
    Create,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    FileInput,
    FileField,
    useNotify,
} from 'react-admin';


const InstrumentCreate = () => {
    const notify = useNotify();
    const onError = (error) => {
        if (error.status === 415) {
            notify(`The file uploaded is unsupported`);
            return;
        }
        notify(`Error: ${error}`);
    };

    return (
        <Create
            mutationOptions={{ onError }}
            redirect="show"
        >
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
