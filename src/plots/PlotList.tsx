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
    useRedirect,
    ReferenceField,
    DateField,
    FunctionField,
    Button,
    Count,
    Link,
    useRecordContext,
} from "react-admin";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';


const CreateManyButton = () => {
    const redirect = useRedirect();
    return (
        <Button
            label="Create Many"
            onClick={(event) => {
                redirect('/plots/createMany');
            }}
            startIcon={<LibraryAddIcon fontSize='inherit' />}
        />

    )
}
const PlotListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /><CreateManyButton /></>}
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
        <List actions={<PlotListActions />} storeKey={false} empty={false} perPage={25}>
            <Datagrid rowClick="show">
                <TextField source="name" />
                <TextField source="area.name" label="Area"/>
                <FunctionField render={record => `${toTitleCase(record.gradient)}`} label="Gradient" />
                <TextField source="coord_x" label="X (m)" />
                <TextField source="coord_y" label="Y (m)" />
                <TextField source="coord_z" label="Elevation (m)" />
                <TextField source="slope" label="Slope (°)" />
                <DateField source="created_on" />
                <FunctionField render={record => `${record.samples.length}`} label="Samples" />
            </Datagrid>
        </List>
    );
};



export default PlotList;
