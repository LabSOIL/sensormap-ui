import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ReferenceField,
    ExportButton,
} from "react-admin";

const SensorProfileListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const SensorProfileList = () => {
    const { permissions } = usePermissions();

    return (
        <List storeKey={false}
            actions={<SensorProfileListActions />}
            perPage={25}
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? true : false}
                rowClick="show"
            >
                <TextField source="name" />
                <TextField source="description" />
                <TextField source="comment" />
                <ReferenceField source="area_id" reference="areas">
                    <TextField source="name" />
                </ReferenceField>
            </Datagrid>
        </List >
    )
};

export default SensorProfileList;
