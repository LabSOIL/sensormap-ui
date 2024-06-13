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
    Button,
    NumberField,
    useRedirect,
    useRecordContext,
    useCreatePath,
    Link,
} from "react-admin";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { stopPropagation } from "ol/events/Event";

const postFilters = [
    <TextInput label="Search" source="q" alwaysOn />,
];

const CreateManyButton = () => {
    const redirect = useRedirect();
    return (
        <Button
            label="Create Many"
            onClick={(event) => {
                redirect('/plot_samples/createMany');
            }}
            startIcon={<LibraryAddIcon fontSize='inherit' />}
        />

    )
}
const PlotSampleListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /><CreateManyButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}
const PlotNameField = () => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const path = createPath({
        resource: 'plots',
        type: 'show',
        id: record.plot.id,
    });

    return (
        <Link to={path} onClick={stopPropagation}>
            <TextField source="plot.name" label="Area" />
        </Link>
    );
}
export const PlotSampleList = () => {
    const FieldWrapper = ({ children, label }) => children;

    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading ...</p>;

    return (
        <List
            filters={postFilters}
            actions={<PlotSampleListActions />}
            storeKey={false}
            empty={false}
            perPage={25}
        >
            <Datagrid rowClick="show">
                <FieldWrapper label="Plot"><PlotNameField /></FieldWrapper>


                <TextField source="name" />
                <NumberField source="upper_depth_cm" label="Upper Depth (cm)" />
                <NumberField source="lower_depth_cm" label="Lower Depth (cm)" />
                <NumberField source="sample_weight" label="Sample Weight (g)" />
                <NumberField source="subsample_weight" label="Subsample Weight" />
                <NumberField source="subsample_replica_weight" label="Subsample Replica Weight" />
            </Datagrid>
        </List>
    );
};



export default PlotSampleList;
