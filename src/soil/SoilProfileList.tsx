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
    ArrayField,
    Count,
    ReferenceField,
    DateField,
} from "react-admin";


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
        <List actions={<SoilProfileListActions />} disableSyncWithLocation>
            <Datagrid rowClick="show">
                <TextField source="name" />
                <ReferenceField source="soil_type_id" reference="soil_types" link="show">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="coord_x" label="X (m)" />
                <TextField source="coord_y" label="Y (m)" />
                <TextField source="coord_z" label="Elevation (m)" />
                <TextField source="aspect" label="Aspect (°)" />
                <TextField source="slope" label="Slope (°)" />
                <DateField source="date_created" />
            </Datagrid>
        </List>
    );
};



export default SoilProfileList;