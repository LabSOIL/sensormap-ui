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
import { useDataProvider } from 'react-admin';

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


export const SoilTypeOutput = ({ soilTypeId }) => {
    const dataProvider = useDataProvider();
    const [soilTypeName, setSoilTypeName] = useState('');

    useEffect(() => {
        const fetchSoilType = async () => {
            if (!soilTypeId) {
                setSoilTypeName('');
                return;
            }
            try {
                const response = await dataProvider.getSensorSoilTypes();
                const found = response.data.find(type => type.id === soilTypeId);
                setSoilTypeName(found ? found.name : '');
            } catch (error) {
                setSoilTypeName('');
            }
        };
        fetchSoilType();
    }, [dataProvider, soilTypeId]);

    return <span>{soilTypeName}</span>;
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

    if (!record) {
        return null; // Return null if no record is available
    }
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

    // Calculate data summary for the new format
    const dataSummary = (() => {
        const hasTemperatureData = record.temperature_by_depth_cm && Object.keys(record.temperature_by_depth_cm).length > 0;
        const hasMoistureData = record.moisture_vwc_by_depth_cm && Object.keys(record.moisture_vwc_by_depth_cm).length > 0;
        const hasLegacyData = record.data_by_depth_cm && Object.keys(record.data_by_depth_cm).length > 0;
        
        if (hasTemperatureData || hasMoistureData) {
            const tempDepths = hasTemperatureData ? Object.keys(record.temperature_by_depth_cm).map(d => parseInt(d)) : [];
            const moistureDepths = hasMoistureData ? Object.keys(record.moisture_vwc_by_depth_cm).map(d => parseInt(d)) : [];
            const allDepths = [...new Set([...tempDepths, ...moistureDepths])].sort((a, b) => a - b);
            
            const tempDataPoints = hasTemperatureData ? 
                Object.values(record.temperature_by_depth_cm).reduce((sum, points) => sum + points.length, 0) : 0;
            const moistureDataPoints = hasMoistureData ? 
                Object.values(record.moisture_vwc_by_depth_cm).reduce((sum, points) => sum + points.length, 0) : 0;
            
            return {
                hasNewFormat: true,
                hasTemperatureData,
                hasMoistureData,
                depths: allDepths,
                totalDataPoints: tempDataPoints + moistureDataPoints
            };
        } else if (hasLegacyData) {
            return {
                hasNewFormat: false,
                isLegacyDepthGrouped: true,
                depths: Object.keys(record.data_by_depth_cm).map(d => parseInt(d)).sort((a, b) => a - b),
                totalDataPoints: Object.values(record.data_by_depth_cm).reduce((sum, points) => sum + points.length, 0)
            };
        } else {
            return {
                hasNewFormat: false,
                isLegacyDepthGrouped: false,
                legacyDataCount: record.assignments?.reduce((sum, assignment) => sum + (assignment.data?.length || 0), 0) || 0
            };
        }
    })();

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
                    <Grid item xs={6}>
                        <Labeled label="Soil Type">
                            <SoilTypeOutput soilTypeId={record.soil_type_vwc} />
                        </Labeled>
                    </Grid>
                    
                    {/* Data format summary */}
                    <Grid item xs={12}>
                        <Typography variant="h6" style={{ marginTop: '16px', marginBottom: '8px' }}>
                            Data Summary
                        </Typography>
                        {dataSummary.hasNewFormat ? (
                            <>
                                <Typography variant="body2">
                                    Depths monitored: {dataSummary.depths.join(', ')}cm
                                </Typography>
                                <Typography variant="body2">
                                    {dataSummary.hasTemperatureData && dataSummary.hasMoistureData && 
                                        `Temperature & VWC data: ${dataSummary.totalDataPoints.toLocaleString()} points`}
                                    {dataSummary.hasTemperatureData && !dataSummary.hasMoistureData && 
                                        `Temperature data: ${dataSummary.totalDataPoints.toLocaleString()} points`}
                                    {!dataSummary.hasTemperatureData && dataSummary.hasMoistureData && 
                                        `VWC data: ${dataSummary.totalDataPoints.toLocaleString()} points`}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {dataSummary.hasMoistureData ? 
                                        'VWC calculations applied to moisture data.' : 
                                        'Temperature data grouped by depth.'}
                                </Typography>
                            </>
                        ) : dataSummary.isLegacyDepthGrouped ? (
                            <>
                                <Typography variant="body2" color="info.main">
                                    Using legacy depth-grouped format
                                </Typography>
                                <Typography variant="body2">
                                    Depths: {dataSummary.depths.join(', ')}cm
                                </Typography>
                                <Typography variant="body2">
                                    Data points: {dataSummary.totalDataPoints.toLocaleString()}
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="body2" color="warning.main">
                                    ⚠ Using raw sensor data format
                                </Typography>
                                <Typography variant="body2">
                                    Raw data points: {dataSummary.legacyDataCount.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Individual sensor readings. Consider updating to depth-grouped format.
                                </Typography>
                            </>
                        )}
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
