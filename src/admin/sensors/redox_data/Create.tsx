import {
    Create,
    SimpleForm,
    NumberInput,
    required,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    Toolbar,
    SaveButton,
} from 'react-admin';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const RedoxDataCreate = () => (
    <Create redirect="show">
        <SimpleForm toolbar={<MyToolbar />}>
            <ReferenceInput source="sensorprofile_id" reference="sensor_profiles" filter={{ profile_type: 'redox' }}>
                <SelectInput label="Redox Profile" optionText="name" validate={required()} />
            </ReferenceInput>
            <DateTimeInput source="measured_on" validate={required()} />
            <NumberInput source="ch1_5cm_mv" label="Ch1 5cm (mV)" />
            <NumberInput source="ch2_15cm_mv" label="Ch2 15cm (mV)" />
            <NumberInput source="ch3_25cm_mv" label="Ch3 25cm (mV)" />
            <NumberInput source="ch4_35cm_mv" label="Ch4 35cm (mV)" />
            <NumberInput source="temp_c" label="Temperature (C)" />
        </SimpleForm>
    </Create>
);

export default RedoxDataCreate;
