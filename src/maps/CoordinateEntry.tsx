import {
    required,
    NumberInput,
    Button,
    useGetOne,
} from 'react-admin';
import { MapContainer, Marker, Polygon, useMap } from 'react-leaflet';
import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Grid, Typography } from '@mui/material';
import proj4 from 'proj4';
import L from 'leaflet';
import { BaseLayers } from '../maps/Layers';

// Fix leaflet's default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define the Swiss coordinate system EPSG:2056
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
                    formContext.setValue('coord_z', parseFloat(data.height));
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
            <NumberInput source="coord_z" label="Elevation (m)" validate={[required()]}  />
        </>
    );
};

const MapUpdater = ({ polygonCoords }) => {
    const map = useMap();
    useEffect(() => {
        if (polygonCoords) {
            const bounds = L.latLngBounds(polygonCoords);
            map.fitBounds(bounds);
        }
    }, [polygonCoords, map]);
    return null;
};

export const CoordinateInput = (props) => {
    const { setValue, watch } = useFormContext();

    // Get area only when an area_id is provided
    const { data: area, isPending, error } = useGetOne(
        'areas',
        { id: props.area_id },
        { enabled: !!props.area_id }
    );

    useEffect(() => {
        if (props.area_id) {
            if (isPending || error) {
                console.log('No area data yet');
            } else {
                console.log('Area:', area);
            }
        }
    }, [props.area_id, area, isPending, error]);

    const coord_x = watch('coord_x');
    const coord_y = watch('coord_y');
    const latitude = watch('latitude');
    const longitude = watch('longitude');

    const defaultCoordinates = [46.224413762594594, 7.359968915183943];
    const [position, setPosition] = useState(latitude && longitude ? [latitude, longitude] : defaultCoordinates);
    const [polygonCoords, setPolygonCoords] = useState(null);
    const [additionalMarkers, setAdditionalMarkers] = useState([]);

    const isValidCoordinate = (value) => {
        return typeof value === 'number' && isFinite(value);
    };

    // Handle conversion from XY (EPSG:2056) to LatLon (EPSG:4326)
    const updateLatLonFromXY = (x, y) => {
        if (isValidCoordinate(x) && isValidCoordinate(y)) {
            const [lng, lat] = proj4('EPSG:2056', 'EPSG:4326', [x, y]);
            setValue('latitude', lat, { shouldValidate: true });
            setValue('longitude', lng, { shouldValidate: true });
            setPosition([lat, lng]);
        }
    };

    // Handle conversion from LatLon to XY
    const updateXYFromLatLon = (lat, lng) => {
        if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
            const [x, y] = proj4('EPSG:4326', 'EPSG:2056', [lng, lat]);
            setValue('coord_x', Math.round(x), { shouldValidate: true });
            setValue('coord_y', Math.round(y), { shouldValidate: true });
            setPosition([lat, lng]);
        }
    };

    useEffect(() => {
        if (isValidCoordinate(coord_x) && isValidCoordinate(coord_y)) {
            updateLatLonFromXY(coord_x, coord_y);
        }
    }, [coord_x, coord_y]);

    useEffect(() => {
        if (isValidCoordinate(latitude) && isValidCoordinate(longitude)) {
            updateXYFromLatLon(latitude, longitude);
        }
    }, [latitude, longitude]);

    const handleSetCoords = (lat, lng) => {
        updateXYFromLatLon(lat, lng);
    };

    // Process area polygon geometry
    useEffect(() => {
        if (area && area.geom && area.geom.coordinates) {
            const rawCoords = area.geom.coordinates[0];
            let convertedCoords;
            // Check if coordinates are already in degrees (EPSG:4326) by examining the first value
            if (rawCoords.length > 0 && Math.abs(rawCoords[0][0]) <= 180) {
                convertedCoords = rawCoords.map(coord => [coord[1], coord[0]]);
            } else {
                convertedCoords = rawCoords.map(coord => {
                    const [lng, lat] = proj4('EPSG:2056', 'EPSG:4326', coord);
                    return [lat, lng];
                });
            }
            // Calculate centroid (simple average)
            let sumLat = 0, sumLng = 0;
            convertedCoords.forEach(([lat, lng]) => {
                sumLat += lat;
                sumLng += lng;
            });
            const centroid = [sumLat / convertedCoords.length, sumLng / convertedCoords.length];
            setPosition(centroid);
            setValue('latitude', centroid[0], { shouldValidate: true });
            setValue('longitude', centroid[1], { shouldValidate: true });
            setPolygonCoords(convertedCoords);
        }
    }, [area]);

    // Helper function to convert a coordinate from EPSG:2056 to [lat, lng] in EPSG:4326
    const convertCoord = (x, y) => {
        const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", [x, y]);
        return [lat, lng];
    };

    // Define marker styles matching your legend
    const iconMapping = {
        "Plot": { icon: 'trowel', markerColor: 'green', iconColor: 'black' },
        "Sensor Profile": { icon: 'temperature-low', markerColor: 'blue', iconColor: 'yellow' },
        "Soil Profile": { icon: 'clipboard', markerColor: 'red', iconColor: 'yellow' },
        "Transect": { icon: 'road', markerColor: 'black', iconColor: 'white' }
    };

    // Extract additional markers from area features (plots, sensor_profiles, soil_profiles, transects)
    useEffect(() => {
        if (area) {
            const markers = [];
            if (area.plots && Array.isArray(area.plots)) {
                area.plots.forEach(plot => {
                    if (plot.coord_x && plot.coord_y) {
                        markers.push({
                            id: `plot-${plot.id}`,
                            type: 'Plot',
                            position: convertCoord(plot.coord_x, plot.coord_y)
                        });
                    }
                });
            }
            if (area.sensor_profiles && Array.isArray(area.sensor_profiles)) {
                area.sensor_profiles.forEach(sp => {
                    if (sp.coord_x && sp.coord_y) {
                        markers.push({
                            id: `sensor-${sp.id}`,
                            type: 'Sensor Profile',
                            position: convertCoord(sp.coord_x, sp.coord_y)
                        });
                    }
                });
            }
            if (area.soil_profiles && Array.isArray(area.soil_profiles)) {
                area.soil_profiles.forEach(sp => {
                    if (sp.coord_x && sp.coord_y) {
                        markers.push({
                            id: `soil-${sp.id}`,
                            type: 'Soil Profile',
                            position: convertCoord(sp.coord_x, sp.coord_y)
                        });
                    }
                });
            }
            if (area.transects && Array.isArray(area.transects)) {
                area.transects.forEach(transect => {
                    if (transect.nodes && transect.nodes.length >= 2) {
                        const first = transect.nodes[0];
                        const second = transect.nodes[1];
                        if (first.coord_x && first.coord_y && second.coord_x && second.coord_y) {
                            const pos1 = convertCoord(first.coord_x, first.coord_y);
                            const pos2 = convertCoord(second.coord_x, second.coord_y);
                            const midLat = (pos1[0] + pos2[0]) / 2;
                            const midLng = (pos1[1] + pos2[1]) / 2;
                            markers.push({
                                id: `transect-${transect.id}`,
                                type: 'Transect',
                                position: [midLat, midLng]
                            });
                        }
                    }
                });
            }
            setAdditionalMarkers(markers);
        }
    }, [area]);

    return (
        <>
            <Grid container spacing={2} alignItems='center'>
                {/* Left side: Input fields */}
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
                {/* Right side: Map */}
                <Grid item xs={7}>
                    <MapContainer
                        center={position}
                        zoom={13}
                        style={{ height: '400px', width: '100%' }}
                    >
                        <BaseLayers />
                        {polygonCoords && (
                            <Polygon positions={polygonCoords} pathOptions={{ color: 'blue' }} />
                        )}
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
                        <MapUpdater polygonCoords={polygonCoords} />
                        {/* Additional markers using awesome markers with low opacity */}
                        {additionalMarkers.map(marker => {
                            const mapping = iconMapping[marker.type] || { icon: 'map-marker', markerColor: 'blue', iconColor: 'white' };
                            return (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    icon={L.AwesomeMarkers.icon({
                                        icon: mapping.icon,
                                        prefix: 'fa',
                                        markerColor: mapping.markerColor,
                                        iconColor: mapping.iconColor,
                                        extraClasses: 'small-tooltip'
                                    })}
                                    opacity={0.5}
                                    interactive={false}
                                />
                            );
                        })}
                    </MapContainer>
                </Grid>
            </Grid>
        </>
    );
};

export default CoordinateInput;
