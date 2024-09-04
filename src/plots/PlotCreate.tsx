/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required,
    Button,
    ImageField,
    ImageInput,
} from 'react-admin';
import { useEffect, useState } from 'react';
import { Typography, Grid } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import proj4 from 'proj4';
import { BaseLayers } from '../maps/Layers';

// Fix leaflet's default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define the Swiss coordinate system EPSG 2056
proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs");

const ElevationInput = () => {
    const formContext = useFormContext();
    const [errorMessage, setErrorMessage] = useState(null);
    const [successResponse, setSuccessResponse] = useState(false);

    const updateElevation = () => {
        const x = formContext.getValues('coord_x');
        const y = formContext.getValues('coord_y');
        const url = `https://api3.geo.admin.ch/rest/services/height?easting=${x}&northing=${y}&sr=2056&format=json&geometryFormat=geojson`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success === false) {
                    setErrorMessage(`Error fetching elevation: ${data.error.message}`);
                } else {
                    setErrorMessage(null);
                    setSuccessResponse(true);
                    formContext.setValue('coord_z', data.height);
                }
            });
    };

    return (
        <>
            <Button
                label="Get elevation from SwissTopo"
                variant="outlined"
                color={errorMessage ? 'error' : successResponse ? 'success' : 'primary'}
                onClick={updateElevation}
            />
            <Typography variant="caption" color={'error'}>
                {errorMessage ? errorMessage : null}
            </Typography>
            <NumberInput source="coord_z" label="Elevation (m)" />
        </>
    );
};

const MapInput = () => {
    const { setValue, watch } = useFormContext();

    const coord_x = watch('coord_x');
    const coord_y = watch('coord_y');
    const latitude = watch('latitude');
    const longitude = watch('longitude');

    const defaultCoordinates = [46.224413762594594, 7.359968915183943];
    const [position, setPosition] = useState(defaultCoordinates);

    const isValidCoordinate = (value) => {
        return typeof value === 'number' && isFinite(value);
    };

    // Handle XY to LatLon conversion
    const updateLatLonFromXY = (x, y) => {
        if (isValidCoordinate(x) && isValidCoordinate(y)) {
            const [lng, lat] = proj4('EPSG:2056', 'EPSG:4326', [x, y]);
            setValue('latitude', lat, { shouldValidate: true });
            setValue('longitude', lng, { shouldValidate: true });
            setPosition([lat, lng]);
        }
    };

    // Handle LatLon to XY conversion
    const updateXYFromLatLon = (lat, lng) => {
        if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
            const [x, y] = proj4('EPSG:4326', 'EPSG:2056', [lng, lat]);
            setValue('coord_x', Math.round(x), { shouldValidate: true });
            setValue('coord_y', Math.round(y), { shouldValidate: true });
            setPosition([lat, lng]);
        }
    };

    // Update Lat/Lon when coord_x/coord_y change
    useEffect(() => {
        if (isValidCoordinate(coord_x) && isValidCoordinate(coord_y)) {
            updateLatLonFromXY(coord_x, coord_y);
        }
    }, [coord_x, coord_y]);

    // Update coord_x/coord_y when latitude/longitude change
    useEffect(() => {
        if (isValidCoordinate(latitude) && isValidCoordinate(longitude)) {
            updateXYFromLatLon(latitude, longitude);
        }
    }, [latitude, longitude]);

    const handleSetCoords = (lat, lng) => {
        updateXYFromLatLon(lat, lng); // Update XY and LatLon when dragging on map
    };

    return (
        <>
            <Grid container spacing={2} alignItems='center'>
                {/* Left side: X/Y and Latitude/Longitude in a 2x2 grid */}
                <Grid item xs={5}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <NumberInput source="coord_x" label="X Coordinate (m: SRID 2056)" validate={[required()]} />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberInput source="coord_y" label="Y Coordinate (m: SRID 2056)" validate={[required()]} />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberInput source="latitude" label="Latitude (°)" />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberInput source="longitude" label="Longitude (°)" />
                        </Grid>
                        <Grid item xs={12}>
                            <ElevationInput />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Right side: Map taking up the full column */}
                <Grid item xs={7}>
                    <MapContainer
                        center={position}
                        zoom={13}
                        style={{ height: '400px', width: '100%' }}
                    >
                        <BaseLayers />
                        <Marker
                            position={position}
                            draggable={true}
                            eventHandlers={{
                                dragend(e) {
                                    const { lat, lng } = e.target.getLatLng();
                                    handleSetCoords(lat, lng);
                                },
                            }}
                        />
                    </MapContainer>
                </Grid>
            </Grid>
        </>
    );
};

const PlotCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm>
                <ImageInput
                    source="image"
                    label="Related image"
                    accept="image/*"
                    multiple={false}
                >
                    <ImageField source="src" title="title" />
                </ImageInput>
                <TextInput source="name" label="Name" validate={[required()]} />
                <ReferenceInput source="area_id" reference="areas">
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
                <SelectInput
                    source="gradient"
                    choices={[
                        { id: 'flat', name: 'Flat' },
                        { id: 'slope', name: 'Slope' },
                    ]}
                    defaultValue={'flat'}
                    helperText="Flat or Slope"
                    validate={[required()]}
                />
                <DateInput source="created_on" label="Description Date" />
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />
                <MapInput />
            </SimpleForm>
        </Create>
    );
};

export default PlotCreate;
