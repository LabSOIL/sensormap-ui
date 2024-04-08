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
                <TextField source="description" />
                <ReferenceField source="soil_type_id" reference="soil_types" link="show">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="location" />
                <TextField source="weather" />
                <TextField source="topography" />
                <DateField source="date_created" />
            </Datagrid>
        </List>
    );
};



export default SoilProfileList;
