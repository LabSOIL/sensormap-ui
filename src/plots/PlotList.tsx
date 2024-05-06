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


const PlotListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

export const PlotList = () => {
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading ...</p>;

    return (
        <List actions={<PlotListActions />} storeKey={false}>
            <Datagrid rowClick="show">
                <TextField source="name" />
                <ReferenceField source="soil_type_id" reference="soil_types" link="show">
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="coord_x" label="X (m)" />
                <TextField source="coord_y" label="Y (m)" />
                <TextField source="slope" label="Slope (°)" />
                <DateField source="created_on" />
            </Datagrid>
        </List>
    );
};



export default PlotList;