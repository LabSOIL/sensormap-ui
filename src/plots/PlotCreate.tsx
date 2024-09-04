/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    NumberField,
    minValue,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    required,
    Button,
    ImageField,
    ImageInput,
    Labeled,
} from 'react-admin';
import { BaseLayers } from '../maps/Layers';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import proj4 from 'proj4';
import { Grid } from '@mui/material';

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
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.success === false) {
                    setErrorMessage(`Error fetching elevation: ${data.error.message}`);
                } else {
                    setErrorMessage(null);
                    setSuccessResponse(true);
                    formContext.setValue('coord_z', data.height);
                }
            })
    }

    return (<>
        <Button
            label="Get from Digital Elevation Model"
            variant="outlined"
            color={errorMessage ? 'error' : successResponse ? 'success' : 'primary'}
            onClick={(event) => {
                updateElevation();
            }}
        />
        <Typography
            variant="caption"
            color={'error'}
        >
            {errorMessage ? errorMessage : null}
        </Typography>
        <NumberInput source="coord_z" label="Elevation (m)" />
    </>
    )
}


const LocationMarker = ({ setCoords }) => {
    useMapEvents({
        click(e) {
            setCoords(e.latlng);
        },
    });
    return null;
};

const MapInput = () => {
    const { setValue, watch, getValues } = useFormContext();
    const coord_x = watch('coord_x');
    const coord_y = watch('coord_y');

    // Default coordinates for Sion, Switzerland
    const defaultCoordinates = [46.224413762594594, 7.359968915183943];
    const [position, setPosition] = useState(defaultCoordinates);

    const isValidCoordinate = (value) => {
        return typeof value === 'number' && isFinite(value);
    };

    useEffect(() => {
        // Only set the position when the coordinates are valid
        if (isValidCoordinate(coord_x) && isValidCoordinate(coord_y)) {
            const [lng, lat] = proj4('EPSG:2056', 'EPSG:4326', [coord_x, coord_y]);
            setPosition([lat, lng]);
        } else {
            // Set the default coordinates if the values are invalid
            setPosition(defaultCoordinates);
        }
    }, [coord_x, coord_y]);

    const handleSetCoords = ({ lat, lng }) => {
        const [x, y] = proj4('EPSG:4326', 'EPSG:2056', [lng, lat]);

        // Update form values only if the new coordinates are valid numbers
        if (isValidCoordinate(x) && isValidCoordinate(y)) {
            setValue('coord_x', x, { shouldValidate: true });
            setValue('coord_y', y, { shouldValidate: true });
            setPosition([lat, lng]);
        }
    };

    return (
        <>
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
                            const latlng = e.target.getLatLng();
                            handleSetCoords(latlng);
                        },
                    }}
                />
                <LocationMarker setCoords={handleSetCoords} />
            </MapContainer>
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
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Grid item xs={12}>
                            <NumberInput source="coord_x" label="X Coordinate" helperText="in metres; SRID 2056 (Swiss CH1903+ / LV95)" validate={[required()]} />
                        </Grid>
                        <Grid item xs={12}>
                            <NumberInput source="coord_y" label="Y Coordinate" helperText="in metres; SRID 2056 (Swiss CH1903+ / LV95)" validate={[required()]} />
                        </Grid>
                        <Grid item xs={12}>
                            <ElevationInput />
                        </Grid>
                    </Grid>
                    <Grid item xs={8}>
                        <MapInput />
                    </Grid>
                </Grid>
                <TextInput source="vegetation_type" label="Vegetation Type" />
                <TextInput source="topography" />
                <TextInput source="aspect" label="Aspect" />
            </SimpleForm>
        </Create>
    );
};


export default PlotCreate;
