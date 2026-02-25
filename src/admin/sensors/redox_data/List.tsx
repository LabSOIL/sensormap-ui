import {
    List,
    Datagrid,
    NumberField,
    DateField,
    TextField,
    ReferenceField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
} from "react-admin";

const RedoxDataListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <CreateButton />}
            <ExportButton />
        </TopToolbar>
    );
};

const RedoxDataList = () => {
    const { permissions } = usePermissions();

    return (
        <List
            storeKey={false}
            actions={<RedoxDataListActions />}
            perPage={25}
            sort={{ field: 'measured_on', order: 'DESC' }}
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? undefined : false}
                rowClick="show"
            >
                <ReferenceField source="sensorprofile_id" reference="sensor_profiles" link="show" label="Profile">
                    <TextField source="name" />
                </ReferenceField>
                <DateField source="measured_on" showTime label="Measured On" />
                <NumberField source="ch1_5cm_mv" label="Ch1 5cm (mV)" />
                <NumberField source="ch2_15cm_mv" label="Ch2 15cm (mV)" />
                <NumberField source="ch3_25cm_mv" label="Ch3 25cm (mV)" />
                <NumberField source="ch4_35cm_mv" label="Ch4 35cm (mV)" />
                <NumberField source="temp_c" label="Temp (C)" />
            </Datagrid>
        </List>
    );
};

export default RedoxDataList;
