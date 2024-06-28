import {
    List,
    Datagrid,
    TextField,
    useGetList,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    TextInput,
    DateField,
} from "react-admin";

const postFilters = [
    <TextInput label="Search" source="q" alwaysOn />,
];

const SoilProfileListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

export const SoilProfileList = () => {
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading areas...</p>;

    return (
        <List
            filters={postFilters}
            actions={<SoilProfileListActions />}
            storeKey={false}
        >
            <Datagrid rowClick="show">
                <TextField source="name" />
                <TextField source="area.name" label="Area" />
                <TextField source="soil_type.name" label="Soil Type" />
                <TextField source="coord_x" label="X (m)" />
                <TextField source="coord_y" label="Y (m)" />
                <TextField source="coord_z" label="Elevation (m)" />
                <TextField source="aspect" label="Aspect (°)" />
                <TextField source="parent_material" label="Parent Material" />
                <DateField source="date_created" />
            </Datagrid>
        </List>
    );
};



export default SoilProfileList;
