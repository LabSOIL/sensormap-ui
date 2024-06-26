import {
    Create,
    SimpleForm,
    FileInput,
    FileField,
} from 'react-admin';


const GNSSCreate = () => {

    return (
        <Create redirect="list">
            <SimpleForm >
                <FileInput source="attachments">
                    <FileField source="src" title="title" />
                </FileInput>
            </SimpleForm>
        </Create >
    )
};

export default GNSSCreate;
