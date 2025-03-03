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
    FunctionField,
    ArrayField,
    Datagrid,
    useCreatePath,
    CreateButton,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { Grid, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { SensorProfilePlot } from '../Plots';

const SensorProfileShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && (
                <>
                    <EditButton />
                    <DeleteButton />
                </>
            )}
        </TopToolbar>
    );
};

const SensorProfileShow = () => {
    const createPath = useCreatePath();
    const [highResolution, setHighResolution] = useState(false);
    const record = useRecordContext();

    useEffect(() => { }, [highResolution]);

    return (
        <Show
            actions={<SensorProfileShowActions />}
            queryOptions={{
                meta: { high_resolution: highResolution },
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
                        <Grid item xs={6}>
                            <Labeled label="Area">
                                <ReferenceField source="area_id" reference="areas" link="show">
                                    <TextField source="name" />
                                </ReferenceField>
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
                            <Labeled label="XY Coordinates (m)">
                                <FunctionField
                                    render={(record) => `${record.coord_x}, ${record.coord_y}`}
                                    label="Coordinates"
                                />
                            </Labeled>
                        </Grid>
                        <Grid item xs={6} />
                        <Grid item xs={6}>
                            <Labeled label="Elevation (m)">
                                <TextField source="coord_z" />
                            </Labeled>
                        </Grid>
                    </Grid>

                    <Grid item xs={10}>
                        <SensorProfilePlot
                            source="temperature_plot"
                            highResolution={highResolution}
                            setHighResolution={setHighResolution}
                        />
                    </Grid>
                    <Grid item xs={10}>
                        <Grid container justifyContent="flex-start" />
                    </Grid>
                </Grid>
                <Typography variant="h6" style={{ marginTop: '16px' }}>
                    Assignments
                </Typography>
                <ArrayField source="assignments">
                    <CreateButton
                        label="Assign Sensor to Sensor Profile"
                        resource="sensor_profile_assignments"
                        state={{ record: { sensorprofile_id: record?.id } }}
                    />
                    <Datagrid
                        bulkActionButtons={false}
                        rowClick={(id) =>
                            createPath({
                                resource: 'sensor_profile_assignments',
                                id,
                                type: 'edit',
                                fromPage: 'sensor_profiles',
                            })
                        }
                    >
                        <ReferenceField
                            source="sensor_id"
                            reference="sensors"
                            link="show"
                            label="Sensor"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                        <DateField source="date_from" label="From" showTime />
                        <DateField source="date_to" label="To" showTime />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    );
};

export default SensorProfileShow;
