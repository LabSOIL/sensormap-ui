import {
    List,
    Datagrid,
    TextField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    ReferenceManyCount,
} from "react-admin";

const WebsiteListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <CreateButton />}
            <ExportButton />
        </TopToolbar>
    );
};

const WebsiteList = () => {
    return (
        <List actions={<WebsiteListActions />} storeKey={false}>
            <Datagrid rowClick="show">
                <TextField source="name" />
                <TextField source="slug" />
                <TextField source="url" />
                <ReferenceManyCount
                    label="Areas"
                    reference="area_websites"
                    target="website_id"
                />
            </Datagrid>
        </List>
    );
};

export default WebsiteList;
