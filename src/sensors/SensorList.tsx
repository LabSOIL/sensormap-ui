import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
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
                <TextField source="description" />
                <TextField source="comment" />
                <TextField source='area.name' />
            </Datagrid>
        </List >
    )
};

export default SensorList;
