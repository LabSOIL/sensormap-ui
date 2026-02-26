import {
    Create,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';

const WebsiteSensorExclusionCreate = () => {
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
                <ReferenceInput source="sensorprofile_id" reference="sensor_profiles">
                    <SelectInput
                        label="Sensor Profile"
                        optionText="name"
                        validate={required()}
                    />
                </ReferenceInput>
            </SimpleForm>
        </Create>
    );
};

export default WebsiteSensorExclusionCreate;
