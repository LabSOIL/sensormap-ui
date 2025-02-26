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
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { Grid } from '@mui/material';
import { useState, useEffect } from 'react';
import { SensorProfilePlot } from './Plots';


const SensorProfileShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><EditButton /><DeleteButton /></>}
        </TopToolbar>
    );
}


const SensorProfileShow = () => {
    const createPath = useCreatePath();
    const [highResolution, setHighResolution] = useState(false);

    // Rerender data when lowResolution state changes
    useEffect(() => { }, [highResolution]);

    return (
        <Show
            actions={<SensorProfileShowActions />}
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
                        <Grid item xs={6}>
                            <Labeled label="Area">
                                <ReferenceField
                                    source='area_id'
                                    reference='areas'
                                    link="show"
                                >
                                    <TextField source='name' />
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
                                <FunctionField render={record =>
                                    `${record.coord_x}, ${record.coord_y}`}
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
                        <Grid container justifyContent="flex-start">
                        </Grid>
                    </Grid>
                </Grid>
                {/* <ArrayField source="assignments">
                    <Datagrid
                        bulkActionButtons={false}
                        rowClick={false}
                    >
                        <ReferenceField source="sensor_id" reference="sensors" link="show" >
                            <TextField source="name" />
                        </ReferenceField>
                        <FunctionField source="type" render={record => record.type === 'soil_profile' ? "Soil Profile" : "Plot"} />
                        <TextField source="name" label="Name" />
                        <DateField source="date_from" label="From" showTime />
                        <DateField source="date_to" label="To" showTime />
                    </Datagrid>
                </ArrayField> */}
            </SimpleShowLayout>
        </Show>
    );
};

export default SensorProfileShow;
