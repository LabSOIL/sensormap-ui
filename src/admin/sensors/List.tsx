import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    DateField,
} from "react-admin";

const SensorListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const SensorList = () => {
    const { permissions } = usePermissions();

    return (
        <List storeKey={false}
            actions={<SensorListActions />}
            perPage={25}
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? true : false}
                rowClick="show"
            >
                <TextField source="name" />
                <DateField source='data_from' showTime />
                <DateField source='data_to' showTime />
                <DateField source='last_updated' showTime />
                <TextField source="description" />
                <TextField source="comment" />
            </Datagrid>
        </List >
    )
};

export default SensorList;
