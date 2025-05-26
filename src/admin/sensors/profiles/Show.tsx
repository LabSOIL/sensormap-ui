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
import { Grid, Typography, Checkbox } from '@mui/material';
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

// This component uses useRecordContext so it can initialize and render profile details.
const SensorProfileShowContent = ({
    createPath,
    highResolution,
    setHighResolution,
    visibleAssignments,
    setVisibleAssignments,
}) => {
    const record = useRecordContext();

    // On first render, initialize visibleAssignments for each assignment to true.
    useEffect(() => {
        if (record && record.assignments && Object.keys(visibleAssignments).length === 0) {
            const initial = {};
            record.assignments.forEach(a => {
                initial[a.id] = true;
            });
            setVisibleAssignments(initial);
        }
    }, [record, setVisibleAssignments, visibleAssignments]);

    return (
        <>
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
                                render={record => `${record.coord_x}, ${record.coord_y}`}
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
                        highResolution={highResolution}
                        setHighResolution={setHighResolution}
                        visibleAssignments={visibleAssignments}
                    />
                </Grid>
            </Grid>
            <Typography variant="h6" style={{ marginTop: '16px' }}>
                Assignments
            </Typography>
            <ArrayField source="assignments">
                <CreateButton
                    label="Assign Sensor to Sensor Profile"
                    resource="sensor_profile_assignments"
                    state={{ record: { sensorprofile_id: record.id } }}
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
                    {/* Checkbox column with click propagation stopped */}
                    <FunctionField
                        render={assignmentRecord => (
                            <span onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                    checked={visibleAssignments[assignmentRecord.id] || false}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setVisibleAssignments(prev => ({
                                            ...prev,
                                            [assignmentRecord.id]: !prev[assignmentRecord.id],
                                        }));
                                    }}
                                    size="small"
                                    sx={{ padding: 0 }}
                                />
                            </span>
                        )}
                    />
                    <ReferenceField source="sensor_id" reference="sensors" link="show" label="Sensor">
                        <TextField source="name" />
                    </ReferenceField>
                    <DateField source="date_from" label="From" showTime />
                    <DateField source="date_to" label="To" showTime />
                    <TextField source="depth_cm_sensor1" label="Depth Temperature 1 (cm)" />
                    <TextField source="depth_cm_sensor2" label="Depth Temperature 2 (cm)" />
                    <TextField source="depth_cm_sensor3" label="Depth Temperature 3 (cm)" />
                    <TextField source="depth_cm_moisture" label="Depth Moisture 1 (cm)" />

                </Datagrid>
            </ArrayField>
        </>
    );
};

const SensorProfileShow = () => {
    const createPath = useCreatePath();
    const [highResolution, setHighResolution] = useState(false);
    const [visibleAssignments, setVisibleAssignments] = useState({});

    return (
        <Show
            actions={<SensorProfileShowActions />}
            queryOptions={{
                meta: { high_resolution: highResolution },
            }}
        >
            <SimpleShowLayout>
                <SensorProfileShowContent
                    createPath={createPath}
                    highResolution={highResolution}
                    setHighResolution={setHighResolution}
                    visibleAssignments={visibleAssignments}
                    setVisibleAssignments={setVisibleAssignments}
                />
            </SimpleShowLayout>
        </Show>
    );
};

export default SensorProfileShow;
