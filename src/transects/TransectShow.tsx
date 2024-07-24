import {
    Show,
    SimpleShowLayout,
    TextField,
    useRedirect,
    Button,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    DateField,
    ReferenceField,
    Labeled,
    NumberField,
    FunctionField,
    CreateButton,
    Datagrid,
    ReferenceManyField,
    Loading,
    ArrayField,
} from "react-admin";
import { Grid, Typography } from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { TransectShowMap } from "../maps/TransectCreate";
import { Box } from '@mui/system';

const PlotShowTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} SoilProfile</span>;
};

const PlotShowActions = () => {
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
const ColoredLine = ({ color, height }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: height
        }}
    />
);

export const TransectShow = () => {
    const redirect = useRedirect();

    const handleRowClick = (id, basePath, record) => {
        redirect('show', 'plots', id);
    }
    return (
        <Show title={<PlotShowTitle />} actions={<PlotShowActions />}>
            <SimpleShowLayout>
                <TextField source="id" label="Transect ID" />
                <DateField source="last_updated" label="Last updated" showTime />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Box>
                            <ArrayField source="nodes">
                                <Datagrid rowClick={handleRowClick} bulkActionButtons={false}>
                                    <TextField source="id" label="Plot ID" />
                                    <TextField source="name" label="Plot name" />
                                    <TextField label="X" source="coord_x" />
                                    <TextField label="Y" source="coord_y" />
                                    <TextField label="Elevation" source="coord_z" />
                                </Datagrid>
                            </ArrayField>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box>
                            <TransectShowMap />
                        </Box>
                    </Grid>
                </Grid>
            </SimpleShowLayout>
        </Show>
    )
};

export default TransectShow;
