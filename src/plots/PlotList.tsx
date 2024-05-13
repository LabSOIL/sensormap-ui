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
    FunctionField,
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
    function toTitleCase(text) {
        return text.toLowerCase().replace(
            /(?<![^\s\p{Pd}])[^\s\p{Pd}]/ug, match => match.toUpperCase()
        );
    }
    if (isLoading) return <p>Loading ...</p>;

    return (
        <List actions={<PlotListActions />} storeKey={false}>
            <Datagrid rowClick="show">
                <TextField source="name" />
                <ReferenceField source="area_id" reference="areas" link="show">
                    <TextField source="name" />
                </ReferenceField>
                <FunctionField render={record => `${toTitleCase(record.gradient)}`} label="Gradient" />
                <TextField source="coord_x" label="X (m)" />
                <TextField source="coord_y" label="Y (m)" />
                <TextField source="coord_z" label="Elevation (m)" />
                <TextField source="slope" label="Slope (°)" />
                <DateField source="created_on" />
                <ReferenceManyCount reference="plot_samples" target="plot_id" label="Samples" link />
            </Datagrid>
        </List>
    );
};



export default PlotList;
