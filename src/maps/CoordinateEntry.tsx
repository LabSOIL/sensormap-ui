import {
    required,
    NumberInput,
    Button,
    useDataProvider,
    useGetList,
} from 'react-admin';
import { MapContainer, Marker, Polygon, useMap } from 'react-leaflet';
import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { Grid, Typography } from '@mui/material';
import proj4 from 'proj4';
import L from 'leaflet';
import { BaseLayers } from '../maps/Layers';

import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';

// Fix leaflet's default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define the Swiss coordinate system EPSG:2056
proj4.defs(
    "EPSG:2056",
    "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs"
);

const ElevationInput = ({ disabled }: { disabled: boolean }) => {
    const formContext = useFormContext();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successResponse, setSuccessResponse] = useState(false);

    const updateElevation = () => {
        const x = formContext.getValues("coord_x");
        const y = formContext.getValues("coord_y");
        const url = `https://api3.geo.admin.ch/rest/services/height?easting=${x}&northing=${y}&sr=2056&format=json&geometryFormat=geojson`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.success === false) {
                    setErrorMessage(`Error fetching elevation: ${data.error.message}`);
                } else {
                    setErrorMessage(null);
                    setSuccessResponse(true);
                    formContext.setValue("coord_z", parseFloat(data.height));
                }
            });
    };

    return (
        <>
            <Button
                label="Get elevation from SwissTopo"
                variant="outlined"
                disabled={disabled}
                color={
                    errorMessage
                        ? "error"
                        : successResponse
                            ? "success"
                            : "primary"
                }
                onClick={updateElevation}
            />
            <Typography variant="caption" color={"error"}>
                {errorMessage ? errorMessage : null}
            </Typography>
            <NumberInput
                source="coord_z"
                label="Elevation (m)"
                disabled={disabled}
                validate={[required()]}
            />
        </>
    );
};

const MapUpdater = ({ areaId, polygonCoords }: { areaId: string | undefined; polygonCoords: L.LatLngExpression[] | null }) => {
    const map = useMap();
    const prevAreaIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (areaId && polygonCoords && areaId !== prevAreaIdRef.current) {
            const bounds = L.latLngBounds(polygonCoords);
            map.fitBounds(bounds);
            prevAreaIdRef.current = areaId;
        }
    }, [areaId, polygonCoords, map]);
    return null;
};

const RecenterButton = ({ updateXY }: { updateXY: (lat: number, lng: number) => void }) => {
    const map = useMap();
    const handleRecenterMarker = () => {
        const center = map.getCenter();
        updateXY(center.lat, center.lng);
    };
    return (
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}>
            <Button variant="contained" onClick={handleRecenterMarker}>
                Reposition Marker to Center of Map
            </Button>
        </div>
    );
};

export const CoordinateInput = ({ disabled = false, ...props }: { disabled?: boolean;[key: string]: any }) => {
    const { setValue, watch } = useFormContext();
    const dataProvider = useDataProvider();

    // Read coordinate fields.
    const coord_x = watch("coord_x");
    const coord_y = watch("coord_y");
    const latitude = watch("latitude");
    const longitude = watch("longitude");

    // Default position if nothing is provided.
    const defaultCoordinates: L.LatLngExpression = [46.224413762594594, 7.359968915183943];
    const [position, setPosition] = useState<L.LatLngExpression>(() => {
        if (isFinite(latitude) && isFinite(longitude)) {
            return [latitude, longitude];
        } else if (isFinite(coord_x) && isFinite(coord_y)) {
            const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", [coord_x, coord_y]);
            return [lat, lng];
        }
        return defaultCoordinates;
    });
    const [polygonCoords, setPolygonCoords] = useState<L.LatLngExpression[] | null>(null);
    const [additionalMarkers, setAdditionalMarkers] = useState<{ id: string; type: string; position: L.LatLngExpression }[]>([]);

    // Helper: valid coordinate check.
    const isValidCoordinate = (value: any): boolean =>
        typeof value === "number" && isFinite(value);

    // --- TWO-WAY UPDATING CONTROL VIA REFS ---
    // Use refs to track which field group (XY or LatLon) was updated last.
    const lastUpdatedRef = useRef<"xy" | "latlon" | null>(null);
    const prevXYRef = useRef([coord_x, coord_y]);
    const prevLatLonRef = useRef([latitude, longitude]);

    useEffect(() => {
        if (prevXYRef.current[0] !== coord_x || prevXYRef.current[1] !== coord_y) {
            lastUpdatedRef.current = "xy";
            prevXYRef.current = [coord_x, coord_y];
        }
    }, [coord_x, coord_y]);

    useEffect(() => {
        if (prevLatLonRef.current[0] !== latitude || prevLatLonRef.current[1] !== longitude) {
            lastUpdatedRef.current = "latlon";
            prevLatLonRef.current = [latitude, longitude];
        }
    }, [latitude, longitude]);

    // Update from X/Y fields if they were updated last.
    useEffect(() => {
        if (lastUpdatedRef.current === "xy" && isValidCoordinate(coord_x) && isValidCoordinate(coord_y)) {
            const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", [coord_x, coord_y]);
            // Use a small epsilon to avoid loops.
            if (Math.abs(lat - (position as number[])[0]) > 0.000001 ||
                Math.abs(lng - (position as number[])[1]) > 0.000001) {
                setPosition([lat, lng]);
                setValue("latitude", lat, { shouldValidate: true });
                setValue("longitude", lng, { shouldValidate: true });
            }
        }
    }, [coord_x, coord_y, setValue]);

    // Update from LatLon fields if they were updated last.
    useEffect(() => {
        if (lastUpdatedRef.current === "latlon" && isValidCoordinate(latitude) && isValidCoordinate(longitude)) {
            if (Math.abs(latitude - (position as number[])[0]) > 0.000001 ||
                Math.abs(longitude - (position as number[])[1]) > 0.000001) {
                const [x, y] = proj4("EPSG:4326", "EPSG:2056", [longitude, latitude]);
                setPosition([latitude, longitude]);
                setValue("coord_x", Math.round(x), { shouldValidate: true });
                setValue("coord_y", Math.round(y), { shouldValidate: true });
            }
        }
    }, [latitude, longitude, setValue]);

    // When the marker is dragged, update fields and mark last update as "latlon".
    const updateXYFromLatLon = (lat: number, lng: number) => {
        if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
            const [x, y] = proj4("EPSG:4326", "EPSG:2056", [lng, lat]);
            setValue("coord_x", Math.round(x), { shouldValidate: true });
            setValue("coord_y", Math.round(y), { shouldValidate: true });
            setValue("latitude", lat, { shouldValidate: true });
            setValue("longitude", lng, { shouldValidate: true });
            setPosition([lat, lng]);
            lastUpdatedRef.current = "latlon";
        }
    };

    const handleSetCoords = (lat: number, lng: number) => {
        updateXYFromLatLon(lat, lng);
    };

    // --- AREA PROCESSING ---
    // Use useGetList to load all areas.
    const { data: areas, isLoading, error } = useGetList("areas", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "id", order: "ASC" },
        filter: {},
    });

    useEffect(() => {
        if (areas && props.area_id) {
            const selectedArea = areas.find((a: any) => String(a.id) === String(props.area_id));
            if (selectedArea && selectedArea.geom && selectedArea.geom.coordinates) {
                const rawCoords = selectedArea.geom.coordinates[0];
                const convertedCoords = rawCoords.map((coord: any) => {
                    if (Math.abs(coord[0]) <= 180) {
                        return [coord[1], coord[0]];
                    } else {
                        const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", coord);
                        return [lat, lng];
                    }
                });
                setPolygonCoords(convertedCoords);
            }
        }
    }, [areas, props.area_id]);

    // --- ADDITIONAL MARKERS ---
    const convertCoord = (x: number, y: number): L.LatLngExpression => {
        const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", [x, y]);
        return [lat, lng];
    };

    const iconMapping = {
        Plot: { icon: "trowel", markerColor: "green", iconColor: "black" },
        "Sensor Profile": { icon: "temperature-low", markerColor: "blue", iconColor: "yellow" },
        "Soil Profile": { icon: "clipboard", markerColor: "red", iconColor: "yellow" },
        Transect: { icon: "road", markerColor: "black", iconColor: "white" },
    };

    useEffect(() => {
        if (areas) {
            const tempMarkers: { id: string; type: string; position: L.LatLngExpression }[] = [];
            areas.forEach((area: any) => {
                if (area.plots && Array.isArray(area.plots)) {
                    area.plots.forEach((plot: any) => {
                        if (plot.coord_x && plot.coord_y) {
                            tempMarkers.push({
                                id: `plot-${plot.id}`,
                                type: "Plot",
                                position: convertCoord(plot.coord_x, plot.coord_y)
                            });
                        }
                    });
                }
                if (area.sensor_profiles && Array.isArray(area.sensor_profiles)) {
                    area.sensor_profiles.forEach((sp: any) => {
                        if (sp.coord_x && sp.coord_y) {
                            tempMarkers.push({
                                id: `sensor-${sp.id}`,
                                type: "Sensor Profile",
                                position: convertCoord(sp.coord_x, sp.coord_y)
                            });
                        }
                    });
                }
                if (area.soil_profiles && Array.isArray(area.soil_profiles)) {
                    area.soil_profiles.forEach((sp: any) => {
                        if (sp.coord_x && sp.coord_y) {
                            tempMarkers.push({
                                id: `soil-${sp.id}`,
                                type: "Soil Profile",
                                position: convertCoord(sp.coord_x, sp.coord_y)
                            });
                        }
                    });
                }
                if (area.transects && Array.isArray(area.transects)) {
                    area.transects.forEach((transect: any) => {
                        if (transect.nodes && transect.nodes.length >= 2) {
                            const first = transect.nodes[0];
                            const second = transect.nodes[1];
                            if (first.coord_x && first.coord_y && second.coord_x && second.coord_y) {
                                const pos1 = convertCoord(first.coord_x, first.coord_y);
                                const pos2 = convertCoord(second.coord_x, second.coord_y);
                                const midLat = (((pos1 as number[])[0]) + ((pos2 as number[])[0])) / 2;
                                const midLng = (((pos1 as number[])[1]) + ((pos2 as number[])[1])) / 2;
                                tempMarkers.push({
                                    id: `transect-${transect.id}`,
                                    type: "Transect",
                                    position: [midLat, midLng]
                                });
                            }
                        }
                    });
                }
            });
            setAdditionalMarkers(tempMarkers);
        }
    }, [areas]);

    return (
        <div
            style={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? "none" : "auto",
            }}
        >
            <Grid container spacing={2} alignItems="center">
                {/* Left side: Input fields */}
                <Grid item xs={5}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <NumberInput
                                source="coord_x"
                                label="X Coordinate (m: SRID 2056)"
                                disabled={disabled}
                                validate={[required()]}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberInput
                                source="coord_y"
                                label="Y Coordinate (m: SRID 2056)"
                                disabled={disabled}
                                validate={[required()]}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberInput
                                source="latitude"
                                label="Latitude (°)"
                                disabled={disabled}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberInput
                                source="longitude"
                                label="Longitude (°)"
                                disabled={disabled}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <ElevationInput disabled={disabled} />
                        </Grid>
                    </Grid>
                </Grid>
                {/* Right side: Map and reposition button */}
                <Grid item xs={7}>
                    <div style={{ position: 'relative' }}>
                        <MapContainer
                            center={position}
                            zoom={13}
                            style={{ height: "400px", width: "100%" }}
                        >
                            <BaseLayers />
                            {areas && areas.map((a: any) => {
                                if (a.geom && a.geom.coordinates) {
                                    const rawCoords = a.geom.coordinates[0];
                                    const convertedCoords = rawCoords.map((coord: any) => {
                                        if (Math.abs(coord[0]) <= 180) {
                                            return [coord[1], coord[0]];
                                        } else {
                                            const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", coord);
                                            return [lat, lng];
                                        }
                                    });
                                    const isSelected = String(props.area_id) === String(a.id);
                                    return (
                                        <>
                                            <Polygon
                                                key={a.id}
                                                positions={convertedCoords}
                                                pathOptions={{ color: "blue" }}
                                            />

                                            <Marker
                                                position={L.latLngBounds(convertedCoords).getCenter()}
                                                icon={L.divIcon({
                                                    className: 'area-label',
                                                    html: `<div style="color: black; white-space: nowrap; font-weight: bold; font-size: 16px;">${a.name}</div>`,
                                                })}
                                                interactive={false}
                                            />
                                        </>
                                    );
                                }
                                return null;
                            })}
                            <Marker
                                position={position}
                                draggable={!disabled}
                                eventHandlers={{
                                    dragend(e) {
                                        const { lat, lng } = e.target.getLatLng();
                                        handleSetCoords(lat, lng);
                                    },
                                }}
                            />
                            <RecenterButton updateXY={updateXYFromLatLon} />
                            <MapUpdater areaId={props.area_id} polygonCoords={polygonCoords} />
                            {additionalMarkers.map((marker) => {
                                const mapping =
                                    iconMapping[marker.type] ||
                                    { icon: "map-marker", markerColor: "blue", iconColor: "white" };
                                return (
                                    <Marker
                                        key={marker.id}
                                        position={marker.position}
                                        icon={L.AwesomeMarkers.icon({
                                            icon: mapping.icon,
                                            prefix: "fa",
                                            markerColor: mapping.markerColor,
                                            iconColor: mapping.iconColor,
                                            extraClasses: "small-tooltip",
                                        })}
                                        opacity={0.15}
                                    />
                                );
                            })}
                        </MapContainer>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export const AreaCoordinateEntry = ({ source = "area_id" }: { source?: string }) => {
    const { watch } = useFormContext();
    const selectedArea = watch(source);
    const isDisabled = !selectedArea;
    return <CoordinateInput area_id={selectedArea} disabled={isDisabled} />;
};

export default CoordinateInput;
