import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    NumberField,
} from "react-admin";
import {
    CreatePlotButton,
    CreateSoilProfileButton,
    CreateSensorButton
} from "./Buttons";
import { Grid, Typography, Box } from "@mui/material";

export const PlotShow = () => (
    <Show>
        <SimpleShowLayout>
            <DateField source="time" label="Time (UTC)" showTime />
            <TextField source="name" />
            <NumberField source="latitude" />
            <NumberField source="longitude" />
            <TextField source="x" label="X (SRID: 2056)" />
            <TextField source="y" label="Y (SRID: 2056)" />
            <NumberField source="elevation_gps" />
            <TextField source="comment" />
            <TextField source="original_filename" />

            <Box mt={2}>
                <Typography variant="h6" gutterBottom>Actions</Typography>
                <Grid container spacing={2} alignItems="center">
                    {/* First Action - Create Plot */}
                    <Grid item xs={2}>
                        <Typography variant="body1">Create Plot</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        <CreatePlotButton />
                    </Grid>

                    {/* Second Action - Create Soil Profile */}
                    <Grid item xs={2}>
                        <Typography variant="body1">Create Soil Profile</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        <CreateSoilProfileButton />
                    </Grid>

                    {/* Third Action - Create Sensor */}
                    <Grid item xs={2}>
                        <Typography variant="body1">Create Sensor</Typography>
                    </Grid>
                    <Grid item xs={10}>
                        <CreateSensorButton />
                    </Grid>
                </Grid>
            </Box>
        </SimpleShowLayout>
    </Show>
);

export default PlotShow;
