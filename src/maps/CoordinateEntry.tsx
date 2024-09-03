import {
    required,
    NumberInput,
    Button,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Grid, Typography } from '@mui/material';
import proj4 from 'proj4';
import { set } from 'ol/transform';


proj4.defs(
    "EPSG:2056",
    "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs"
);

const isValidXY = ({ x, y }) => {
    // Are valid swiss coordinates
    if (
        x < 2485071.58
        || x > 2837119.8
        || y < 1074261.72
        || y > 1299941.79
    ) {
        return false;
    }

    return true
};

const isValidLatLon = ({ latitude, longitude }) => {
    // Are valid swiss coordinates
    if (latitude < 45.817
        || latitude > 47.808
        || longitude < 6.736
        || longitude > 10.491
    ) {
        return false;
    }

    return true;
}

export const CoordinateInput = ({ editMode }) => {
    const { setValue, watch, getValues } = useFormContext();
    const [errorMessage, setErrorMessage] = useState(null);
    const [successResponse, setSuccessResponse] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const x = watch('coord_x');
    const y = watch('coord_y');
    const latitude = watch('latitude');
    const longitude = watch('longitude');

    const updateCoordinates = (source) => {
        if (source === 'xy') {
            const [lon, lat] = proj4('EPSG:2056', 'EPSG:4326', [x, y]);
            setValue('latitude', lat);
            setValue('longitude', lon);
        } else if (source === 'latlon') {
            if (latitude && longitude) {
                const [easting, northing] = proj4('EPSG:4326', 'EPSG:2056', [longitude, latitude]);
                setValue('coord_x', Math.round(easting));
                setValue('coord_y', Math.round(northing));
            }
        }
    };

    useEffect(() => {
        if (x && y && isValidXY({ x, y })) {
            updateCoordinates('xy');
        }
    }, [x, y]);

    useEffect(() => {
        if (latitude && longitude && isValidLatLon({ latitude, longitude })) {
            updateCoordinates('latlon');
        }
    }, [latitude, longitude]);

    const updateElevation = () => {
        const url = `https://api3.geo.admin.ch/rest/services/height?easting=${x}&northing=${y}&sr=2056&format=json&geometryFormat=geojson`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success === false) {
                    setSuccessResponse(false);
                    setSuccessMessage(null);
                    setErrorMessage(`Error fetching elevation: ${data.error.message}`);
                } else {
                    setErrorMessage(null);
                    setSuccessResponse(true);
                    setSuccessMessage('Elevation fetched successfully from Swiss Topo');
                    setValue('coord_z', data.height);
                }
            })
            .catch(error => {
                setErrorMessage(`Error fetching elevation: ${error.message}`);
            });
    };

    useEffect(() => {
        if (x && y && isValidXY({ x, y })) {
            console.log("Updating elevation");
            updateElevation();
            updateCoordinates('xy');
        }
    }, [x, y]);

    return (
        <>
            <Grid container spacing={1}>
                <Grid item xs={6}>
                    <NumberInput source="coord_x" label="X Coordinate" validate={required()} />
                </Grid>
                <Grid item xs={6}>
                    <NumberInput source="coord_y" label="Y Coordinate" validate={required()} />
                </Grid>
                <Grid item xs={6}>
                    <NumberInput source="latitude" label="Latitude" />
                </Grid>
                <Grid item xs={6}>
                    <NumberInput source="longitude" label="Longitude" />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        label="Manually get from Digital Elevation Model"
                        variant="outlined"
                        color={errorMessage ? 'error' : successResponse ? 'success' : 'primary'}
                        onClick={() => updateElevation()}
                    />
                    <br />
                    <Typography variant="caption" color={'error'}>
                        {errorMessage ? errorMessage : null}
                    </Typography>
                    <Typography variant="caption" color={'green'}>
                        {successMessage ? successMessage : null}
                    </Typography>
                    <NumberInput source="coord_z" label="Elevation (m)" />
                </Grid>

                <Grid item xs={12}>
                </Grid>
            </Grid>
        </>
    );
};
