import {
    List,
    Datagrid,
    TextField,
    ReferenceManyCount,
    useGetList,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    TextInput,
} from "react-admin";
const postFilters = [
    <TextInput label="Search" source="q" alwaysOn />,
];

const SoilTypeListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

export const SoilTypeList = () => {
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading areas...</p>;

    return (
        <List
            filters={postFilters}
            actions={<SoilTypeListActions />}
            storeKey={false}
        >

            <Datagrid rowClick="show">
                <TextField source="name" />
                <TextField source="description" />
                <ReferenceManyCount
                    label="Soil Profiles"
                    reference="soil_profiles"
                    target="soil_type_id"
                    link
                />
            </Datagrid>
        </List>
    );
};



export default SoilTypeList;
