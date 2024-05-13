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
    Button,
    NumberInput,
    Typography,
    NumberField,
    useRedirect,
} from "react-admin";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

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

export const PlotSampleList = () => {
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading ...</p>;

    return (
        <List actions={<PlotSampleListActions />} storeKey={false}>
            <Datagrid rowClick="show">
                <ReferenceField
                    source="plot_id"
                    reference="plots"
                    sort={{ field: 'name', order: 'ASC' }}
                >
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="name" />
                <NumberField source="upper_depth_cm" label="Upper Depth (cm)" />
                <NumberField source="lower_depth_cm" label="Lower Depth (cm)" />
                <NumberField source="sample_weight" label="Sample Weight (g)" />
                <TextField source="subsample_weight" label="Subsample Weight" />
            </Datagrid>
        </List>
    );
};



export default PlotSampleList;
