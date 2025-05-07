import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceField,
    useRecordContext,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    DateField,
    Labeled,
    ArrayField,
    Datagrid,
    useNotify,
    CreateButton,
    useRedirect,
    Button,
    useRefresh,
    useDataProvider,
    useCreatePath,
} from 'react-admin';
import { Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import plots from '../plots';
import { SensorPlot } from './Plots';

const SensorShowActions = () => {
    const { permissions } = usePermissions();
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const handleDeleteData = async () => {


        if (!record) return;
        try {
            await dataProvider.deleteData("sensors", { id: record.id }).then(() => {
                notify('Data deleted successfully', { type: 'success' });
                refresh();
            });
        } catch (error) {
            notify('Error deleting data', { type: 'error' });
        }
    };

    return (
        <TopToolbar>
            {permissions === 'admin' && (
                <>
                    <EditButton label="Edit or add new data" />
                    <Button
                        mutationMode="pessimistic"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to delete the sensor's data ? ")) {
                                handleDeleteData();
                            }
                        }}
                        label="Delete Sensor Data"
                        style={{ color: 'red' }}
                        startIcon={<DeleteIcon />}
                    />
                    <DeleteButton mutationMode="pessimistic" />
                </>
            )}
        </TopToolbar>
    );
};


export const CreatePlotRelationship = () => {
    const record = useRecordContext();
    if (!record) return null;

    // Only show button if plot as we can only create sensor:plot relationships
    if (record.type !== 'plot') return null;

    return <IconButton
        color="success"
        title="Create sensor"
    >
        <plots.plot.icon />
    </IconButton>;
};

const AssignSensorButton = () => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <Box mt={2}>
            <CreateButton
                label="Assign Sensor to Sensor Profile"
                resource="sensor_profile_assignments"
                state={{ record: { sensor_id: record.id } }}
            />
        </Box>
    );
};

const SensorShow = (record: any) => {
    const [highResolution, setHighResolution] = useState(false);
    const createPath = useCreatePath();
    // Rerender data when resolution state changes
    useEffect(() => { }, [highResolution]);

    return (
        <Show
            actions={<SensorShowActions />}
            queryOptions={{
                meta: {
                    high_resolution: highResolution
                }
            }}
        >
            <SimpleShowLayout>
                <Grid container spacing={2}>
                    <Grid item xs={2}>
                        <Grid item xs={6}>
                            <Labeled label="Name">
                                <TextField source="name" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Last Updated">
                                <DateField source="last_updated" showTime />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Description">
                                <TextField source="description" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Notes/Comments">
                                <TextField source="comment" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Serial Number">
                                <TextField source="serial_number" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6}>
                            <Labeled label="Data from">
                                <DateField showTime source="data_from" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6}>
                            <Labeled label="Data to">
                                <DateField showTime source="data_to" />
                            </Labeled>
                        </Grid>

                    </Grid>

                    <Grid item xs={10}>
                        <SensorPlot
                            source="temperature_plot"
                            highResolution={highResolution}
                            setHighResolution={setHighResolution}
                        />
                    </Grid>
                </Grid>
                <Typography variant="h6">Assignments</Typography>
                <ArrayField source="assignments">
                    <AssignSensorButton />
                    <Datagrid
                        bulkActionButtons={false}
                        rowClick={(id) => createPath(
                            { resource: 'sensor_profile_assignments', id, type: 'edit', fromPage: "sensors" }
                        )}
                    >
                        <ReferenceField
                            source='sensorprofile_id'
                            reference='sensor_profiles'
                            link="show"
                            label="Profile"
                        >
                            <TextField source='name' />
                        </ReferenceField>
                        <DateField showTime source="date_from" label="From" />
                        <DateField showTime source="date_to" label="To" />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    );
};

export default SensorShow;
