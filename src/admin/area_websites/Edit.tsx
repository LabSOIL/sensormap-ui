import {
    Edit,
    SimpleForm,
    TextInput,
    ReferenceField,
    TextField,
    DateTimeInput,
    Labeled,
} from 'react-admin';

const AreaWebsiteEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput disabled label="Id" source="id" />
                <Labeled label="Website">
                    <ReferenceField source="website_id" reference="websites">
                        <TextField source="name" />
                    </ReferenceField>
                </Labeled>
                <Labeled label="Area">
                    <ReferenceField source="area_id" reference="areas">
                        <TextField source="name" />
                    </ReferenceField>
                </Labeled>
                <DateTimeInput source="date_from" label="Date From" helperText="Leave empty for no restriction. Only data recorded after this date will be shown." />
                <DateTimeInput source="date_to" label="Date To" helperText="Leave empty for no restriction. Only data recorded before this date will be shown." />
            </SimpleForm>
        </Edit>
    );
};

export default AreaWebsiteEdit;
