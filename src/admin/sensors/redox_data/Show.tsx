import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    DateField,
    ReferenceField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
} from 'react-admin';

const RedoxDataShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && (
                <>
                    <EditButton />
                    <DeleteButton />
                </>
            )}
        </TopToolbar>
    );
};

const RedoxDataShow = () => (
    <Show actions={<RedoxDataShowActions />}>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="sensorprofile_id" reference="sensor_profiles" link="show">
                <TextField source="name" />
            </ReferenceField>
            <DateField source="measured_on" showTime />
            <NumberField source="ch1_5cm_mv" label="Ch1 5cm (mV)" />
            <NumberField source="ch2_15cm_mv" label="Ch2 15cm (mV)" />
            <NumberField source="ch3_25cm_mv" label="Ch3 25cm (mV)" />
            <NumberField source="ch4_35cm_mv" label="Ch4 35cm (mV)" />
            <NumberField source="temp_c" label="Temperature (C)" />
        </SimpleShowLayout>
    </Show>
);

export default RedoxDataShow;
