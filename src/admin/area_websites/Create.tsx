import {
    Create,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    required,
    useRedirect,
} from 'react-admin';

const AreaWebsiteCreate = () => {
    const redirect = useRedirect();
    const onSuccess = (data: { website_id: number }) => {
        redirect('show', 'websites', data.website_id);
    };
    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm>
                <ReferenceInput source="website_id" reference="websites">
                    <SelectInput
                        label="Website"
                        optionText="name"
                        validate={required()}
                    />
                </ReferenceInput>
                <ReferenceInput source="area_id" reference="areas">
                    <SelectInput
                        label="Area"
                        optionText="name"
                        validate={required()}
                    />
                </ReferenceInput>
                <DateTimeInput source="date_from" label="Date From" helperText="Leave empty for no restriction. Only data recorded after this date will be shown." />
                <DateTimeInput source="date_to" label="Date To" helperText="Leave empty for no restriction. Only data recorded before this date will be shown." />
            </SimpleForm>
        </Create>
    );
};

export default AreaWebsiteCreate;
