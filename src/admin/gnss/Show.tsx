import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    NumberField,
    Labeled,
    FunctionField,
} from "react-admin";
import {
    CreatePlotButton,
    CreateSoilProfileButton,
    CreateSensorButton
} from "./Buttons";
import { Grid, Typography, Box } from "@mui/material";
import { GNSSMap } from '../maps/Points';

export const GNSSShow = () => (
    <Show>
        <SimpleShowLayout>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Grid container spacing={0}>
                        <Grid item xs={12}>
                            <Labeled label="Time (UTC)">
                                <DateField source="time" showTime />
                            </Labeled>
                        </Grid>
                        <Grid item xs={12}>
                            <Labeled label="Name">
                                <TextField source="name" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={12}>
                            <Labeled label="Coordinates Lat, Lon (°)">
                                <FunctionField render={record => `${record.latitude}, ${record.longitude}`} />
                            </Labeled>
                        </Grid>
                        <Grid item xs={12}>
                            <Labeled label="Coordinate X, Y (m)">
                                <FunctionField render={record => `${record.coord_x}, ${record.coord_y} (SRID: ${record.coord_srid})`} />
                            </Labeled>
                        </Grid>

                        <Grid item xs={12}>
                            <Labeled label="Elevation (GPS)">
                                <NumberField source="elevation_gps" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={12}>
                            <Labeled label="Comment">
                                <TextField source="comment" />
                            </Labeled>
                        </Grid>
                        <Grid item xs={12}>
                            <Labeled label="Original Filename">
                                <TextField source="original_filename" />
                            </Labeled>
                        </Grid>


                        <Grid item xs={12}>
                            <Box mt={2}>
                                <Typography variant="h6" gutterBottom>Actions</Typography>
                                <Grid container spacing={0} alignItems="center">
                                    <Grid item xs={5}>
                                        <Typography variant="body1">Create Plot</Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <CreatePlotButton />
                                    </Grid>

                                    <Grid item xs={5}>
                                        <Typography variant="body1">Create Soil Profile</Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <CreateSoilProfileButton />
                                    </Grid>

                                    <Grid item xs={5}>
                                        <Typography variant="body1">Create Sensor Profile</Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <CreateSensorButton />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>


                <Grid item xs={8}>
                    <Typography variant="h6" gutterBottom>GNSS Location</Typography>
                    <GNSSMap />
                </Grid>
            </Grid>
        </SimpleShowLayout>
    </Show >
);

export default GNSSShow;
