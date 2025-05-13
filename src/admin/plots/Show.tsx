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
    useCreatePath,
    TabbedShowLayout,
} from "react-admin";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Box,
    Grid,
} from '@mui/material';

const AggregatedSamplesTable = () => {
    const record = useRecordContext();
    if (!record?.aggregated_samples) return null;

    const rows = Object.entries(record.aggregated_samples).map(
        ([group, values]) => ({ group, ...values })
    );

    return (
        <Box mt={2}>
            <Typography variant="h6" gutterBottom>
                Sample summary
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Replicate set</TableCell>
                        <TableCell align="right">Samples</TableCell>
                        <TableCell align="right">Mean C</TableCell>
                        <TableCell align="right">Total Depth (cm)</TableCell>
                        <TableCell align="right">SOC g/cm³</TableCell>
                        <TableCell align="right">SOC Mg/ha</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.group}>
                            <TableCell component="th" scope="row">
                                {row.group}
                            </TableCell>
                            <TableCell align="right">{row.sample_count}</TableCell>
                            <TableCell align="right">{row.mean_c.toFixed(3)}</TableCell>
                            <TableCell align="right">{row.total_depth}</TableCell>
                            <TableCell align="right">
                                {row.soc_stock_to_total_depth_g_per_cm3.toFixed(3)}
                            </TableCell>
                            <TableCell align="right">
                                {row.soc_stock_megag_per_hectare.toFixed(3)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};


const PlotShowTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>Plot: {record.name} ({record.area.name} {record.gradient})</span>;
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


const CreateSampleButton = () => {
    const record = useRecordContext();

    return (
        <CreateButton
            label="Add"
            resource="plot_samples"
            state={{
                record: {
                    plot_id: record.id,
                }
            }}
        />
    );

}

const ImageField = ({ source }) => {
    const record = useRecordContext();
    if (!record) {
        return <Loading />;
    }

    if (!record[source]) {

        return <>
            <br />
            <Typography align="center">No image available</Typography>
        </>;
    }
    const base64Image = record[source];
    return (
        <div style={{ textAlign: 'center', margin: '0 10px' }}>
            <img src={`${base64Image}`} style={{ maxWidth: '80%', height: 'auto' }} />
        </div>
    );
};

export const PlotShow = () => {
    const redirect = useRedirect();
    const createPath = useCreatePath();

    const handleRowClick = (id, basePath, record) => {
        return createPath({ type: 'show', resource: 'transects', id: id });
    }
    const handleRowClickSensor = (id, basePath, record) => {
        return createPath({ type: 'show', resource: 'sensor_profiles', id: id });
    }
    return (
        <Show title={<PlotShowTitle />} actions={<PlotShowActions />}>
            <SimpleShowLayout >
                <Grid container>
                    <Grid item xs={8} textAlign="left">
                        <FunctionField
                            render={record => `${record.name}: `}
                            variant="h5"
                            gutterBottom
                            label={null}
                        />
                        <ReferenceField source="area_id" reference="areas" link="show">
                            <TextField source="name" variant="h5" />
                        </ReferenceField>{" "}
                        <TextField source="gradient" variant="h5" />
                    </Grid>

                    <Grid item xs={4} textAlign="right">
                        <DateField
                            source="created_on"
                            variant="h5"
                            gutterBottom
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <Labeled>
                            <TextField source="coord_x" label="X (m)" />
                        </Labeled >
                    </Grid>
                    <Grid item xs={4}>
                        <Labeled><TextField source="coord_y" label="Y (m)" /></Labeled >
                    </Grid>
                    <Grid item xs={4}>
                        <Labeled><TextField source="coord_z" label="Elevation (m)" /></Labeled >
                    </Grid>
                    <Grid item xs={4}>
                        <Labeled><TextField source="aspect" /></Labeled >
                    </Grid>
                    <Grid item xs={4}>
                        <Labeled><TextField source="topography" /></Labeled >
                    </Grid>
                    <Grid item xs={4}>
                        <Labeled><TextField source="vegetation_type" /></Labeled >
                    </Grid>

                    <Grid item xs={4}>
                        <Labeled><DateField source="created_on" showTime /></Labeled>
                    </Grid>
                    <Grid item xs={4}>
                        <Labeled><DateField source="last_updated" showTime /></Labeled>
                    </Grid>
                </Grid>

                <ColoredLine color="grey" height={2} />
                <Grid container>
                    <Grid item xs={6}>
                        <Typography variant="h6" textAlign="center" gutterBottom>Samples</Typography>
                        <TopToolbar><CreateSampleButton /></TopToolbar>
                        <ReferenceManyField
                            reference="plot_samples"
                            target="plot_id"
                            label="Samples"
                            sort={{ field: 'name', order: 'ASC' }}
                        >
                            <Datagrid rowClick="show" bulkActionButtons={false}>
                                <TextField source="name" />
                                <FunctionField
                                    label="Depth (cm)"
                                    render={record => `${record.upper_depth_cm} - ${record.lower_depth_cm}`}
                                />
                                <NumberField source="replicate" label="Replicate" />
                                <DateField source="last_updated" showTime />
                            </Datagrid>
                        </ReferenceManyField>
                        <AggregatedSamplesTable />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6" textAlign="center" gutterBottom>Plot illustration</Typography>
                        <ImageField source="image" />
                    </Grid>
                </Grid>

                <ArrayField source="transects">
                    <Datagrid rowClick={handleRowClick} bulkActionButtons={false}>
                        <TextField source="name" />
                        <TextField source="description" />
                    </Datagrid>
                </ArrayField>
                <ArrayField source="nearest_sensor_profiles" label="Nearest sensor profiles">
                    <Datagrid rowClick={handleRowClickSensor} bulkActionButtons={false}>
                        <ReferenceField source="id" label="Name" reference="sensor_profiles">
                            <TextField source="name" label="Name" />
                        </ReferenceField>
                        <NumberField source="distance" label="Distance (m)" />
                        <NumberField source="elevation_difference" label="Elevation difference (m)" />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show >
    )
};

export default PlotShow;
