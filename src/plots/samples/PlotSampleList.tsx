import {
    List,
    Datagrid,
    TextField,
    useGetList,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    ReferenceField,
    Button,
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
        <List 
        actions={<PlotSampleListActions />} 
        storeKey={false} 
        empty={false}
        perPage={25}
        >
            <Datagrid rowClick="show">
                <ReferenceField
                    source="plot_id"
                    reference="plots"
                    sort={{ field: 'name', order: 'ASC' }}
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>
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
