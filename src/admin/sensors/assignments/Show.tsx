import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    ReferenceField,
    TextField,
    DateField,
    NumberField,
    Labeled,
} from 'react-admin';
import { Grid } from '@mui/material';
import SensorPlotWithOverlay from '../../plots/SensorPlotWithOverlay';

const ShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && (
                <>
                    <EditButton label="Modify assignment" />
                    <DeleteButton mutationMode="pessimistic" label="Remove assignment" />
                </>
            )}
        </TopToolbar>
    );
};

const SensorProfileAssignmentShow = (props) => (
    <Show {...props} actions={<ShowActions />}>
        <SimpleShowLayout>
            <Grid container spacing={2}>
                <Grid item xs={2}>
                    <Grid item xs={6}>
                        <Labeled label="Sensor">
                            <ReferenceField source="sensor_id" reference="sensors">
                                <TextField source="name" />
                            </ReferenceField>
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Sensor Profile">
                            <ReferenceField source="sensorprofile_id" reference="sensor_profiles">
                                <TextField source="name" />
                            </ReferenceField>
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="From">
                            <DateField source="date_from" showTime />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="To">
                            <DateField source="date_to" showTime />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Depth (cm) Sensor 1">
                            <NumberField source="depth_cm_sensor1" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Depth (cm) Sensor 2">
                            <NumberField source="depth_cm_sensor2" />
                        </Labeled>
                    </Grid>
                    <Grid item xs={6}>
                        <Labeled label="Depth (cm) Sensor 3">
                            <NumberField source="depth_cm_sensor3" />
                        </Labeled>
                    </Grid>
                </Grid>
                <Grid item xs={10}>
                    <SensorPlotWithOverlay interactive={false} />
                </Grid>
            </Grid>
        </SimpleShowLayout>
    </Show>
);

export default SensorProfileAssignmentShow;
