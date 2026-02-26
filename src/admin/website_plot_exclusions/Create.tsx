import {
    Create,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';

const WebsitePlotExclusionCreate = () => {
    return (
        <Create redirect={false}>
            <SimpleForm>
                <ReferenceInput source="website_id" reference="websites">
                    <SelectInput
                        label="Website"
                        optionText="name"
                        validate={required()}
                    />
                </ReferenceInput>
                <ReferenceInput source="plot_id" reference="plots">
                    <SelectInput
                        label="Plot"
                        optionText="name"
                        validate={required()}
                    />
                </ReferenceInput>
            </SimpleForm>
        </Create>
    );
};

export default WebsitePlotExclusionCreate;
