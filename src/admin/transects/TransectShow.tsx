import {
    Show,
    SimpleShowLayout,
    TextField,
    useRedirect,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    DateField,
    Datagrid,
    ArrayField,
    useCreatePath,
    ReferenceField,
} from "react-admin";
import { Grid, } from '@mui/material';
import { TransectShowMap } from "../maps/Transects";

const TransectTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} SoilProfile</span>;
};

const TransectActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <>
                <EditButton />
                <DeleteButton />
            </>}
        </TopToolbar>
    );
}

export const TransectShow = () => {
    const redirect = useRedirect();
    const createPath = useCreatePath();

    const handleRowClick = (id, basePath, record) => {
        return createPath({ type: 'show', resource: 'plots', id: record.plot_id });
    }
    return (
        <Show title={<TransectTitle />} actions={<TransectActions />}>
            <SimpleShowLayout>
                <TextField source="name" />
                <ReferenceField source="area_id" reference="areas">
                    <TextField source="name" />
                </ReferenceField>
                <DateField source="last_updated" label="Last updated" showTime />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <ArrayField source="nodes">
                            <Datagrid rowClick={handleRowClick} bulkActionButtons={false}>
                                <TextField source="plot.name" label="Plot name" />
                                <TextField label="X (m)" source="plot.coord_x" />
                                <TextField label="Y (m)" source="plot.coord_y" />
                                <TextField label="Elevation (m)" source="plot.coord_z" />
                                <TextField label="Order" source="order" />
                            </Datagrid>
                        </ArrayField>
                    </Grid>
                    <Grid item xs={6}>
                        <TransectShowMap />
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    )
};

export default TransectShow;
