import {
    required,
    NumberInput,
    Button,
    useGetList,
    useRecordContext,
} from 'react-admin';
import { MapContainer, Marker, Polygon, Tooltip, useMap } from 'react-leaflet';
import { useFormContext } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { Grid, Typography } from '@mui/material';
import proj4 from 'proj4';
import L from 'leaflet';
import { BaseLayers } from './Layers';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import { get } from 'http';
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

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

const AreaPolygonAndMarkers = ({ areaId, setPolygonCoords }: {
    areaId: string,
    setPolygonCoords: (coords: L.LatLngExpression[]) => void
}) => {
    const [additionalMarkers, setAdditionalMarkers] = useState<{ id: string; type: string; position: L.LatLngExpression }[]>([]);
    const { data: areas, isLoading, error } = useGetList("areas", {
        // Use useGetList to load all areas.
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "id", order: "ASC" },
        filter: {},
    });

    useEffect(() => {
        if (areas && areaId) {
            const selectedArea = areas.find((a: any) => String(a.id) === String(areaId));
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
    }, [areas, areaId]);

    const convertCoordXYtoLatLon = (x: number, y: number): L.LatLngExpression => {
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
                                position: convertCoordXYtoLatLon(plot.coord_x, plot.coord_y)
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
                                position: convertCoordXYtoLatLon(sp.coord_x, sp.coord_y)
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
                                position: convertCoordXYtoLatLon(sp.coord_x, sp.coord_y)
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
                                const pos1 = convertCoordXYtoLatLon(first.coord_x, first.coord_y);
                                const pos2 = convertCoordXYtoLatLon(second.coord_x, second.coord_y);
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

    if (isLoading) return <p>Loading...</p>;
    return (
        <>
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
            {areas.map((area: any) => {
                if (area.geom && area.geom.coordinates) {
                    const rawCoords = area.geom.coordinates[0];
                    const convertedCoords = rawCoords.map((coord: any) => {
                        if (Math.abs(coord[0]) <= 180) {
                            return [coord[1], coord[0]];
                        } else {
                            const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", coord);
                            return [lat, lng];
                        }
                    });
                    return (
                        <>
                            <Polygon
                                key={area.id}
                                positions={convertedCoords}
                                pathOptions={{ color: area.project.color }}
                            >
                                <Tooltip
                                    permanent
                                    interactive={false}
                                    direction="center">

                                    <span
                                        // onClick={handleZoom}
                                        style={{
                                            background: 'rgba(255,255,255,0.8)',
                                            padding: '3px 6px',
                                            borderRadius: '4px',
                                            fontWeight: 'bolder',
                                            color: '#000',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {area.name}
                                    </span>
                                </Tooltip>
                            </Polygon >
                        </>
                    );
                }
                return null;

            }
            )}

        </>
    )
}
const getElevationSwissTopo = async (x: number, y: number): Promise<number | undefined> => {
    try {
        const response = await fetch(
            `https://api3.geo.admin.ch/rest/services/height?easting=${x}&northing=${y}&sr=2056&format=json&geometryFormat=geojson`
        );
        const data = await response.json();
        if (data.success === false) {
            throw new Error(`Error fetching elevation: ${data.error.message}`);
        }
        return parseFloat(data.height);
    } catch (error) {
        console.error(`Error fetching elevation: ${error.message}`);
        return undefined;
    }
};

const ElevationInput = ({ disabled = false, is_required = true }: { disabled?: boolean; is_required?: boolean }) => {
    const formContext = useFormContext();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successResponse, setSuccessResponse] = useState(false);

    const updateElevation = () => {
        const x = formContext.getValues("coord_x");
        const y = formContext.getValues("coord_y");

        getElevationSwissTopo(x, y).then((z) => {
            formContext.setValue("coord_z", z);
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
                validate={is_required ? [required()] : undefined}
            />
        </>
    );
};

const MapUpdater = ({ areaId, polygonCoords }: { areaId: string | undefined; polygonCoords: L.LatLngExpression[] | null }) => {
    // This updates the map view when a new area is chosen.
    const map = useMap();
    const prevAreaIdRef = useRef<string | undefined>(undefined);
    useEffect(() => {
        if (areaId && polygonCoords) {
            const bounds = L.latLngBounds(polygonCoords);
            map.fitBounds(bounds);
            prevAreaIdRef.current = areaId;
        }
    }, [areaId, polygonCoords, map]);
    return null;
};

const RecenterButton = ({ updateXY }: { updateXY: (lat: number, lng: number) => void }) => {
    // Adds a button to recenter the marker to the center of the map.
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
export const CoordinateInput = ({ disabled = false, is_required = true, ...props }: { disabled?: boolean; is_required?: boolean;[key: string]: any }) => {
    const { setValue, watch } = useFormContext();
    const defaultCoordinates: L.LatLngExpression = [46.224413762594594, 7.359968915183943];
    const watch_coord_x = watch("coord_x");
    const watch_coord_y = watch("coord_y");
    const watch_coord_z = watch("coord_z");
    const watch_latitude = watch("latitude");
    const watch_longitude = watch("longitude");
    const [areaPolygonCoords, setAreaPolygonCoords] = useState<L.LatLngExpression[] | null>(null);
    const [coordinateData, setCoordinateData] = useState({
        coord_x: watch_coord_x || null,
        coord_y: watch_coord_y || null,
        coord_z: watch_coord_z || null,
        latitude: watch_latitude || null,
        longitude: watch_longitude || null,
    });

    const isValidCoordinate = (value: any): boolean => typeof value === "number" && isFinite(value);
    const lastUpdatedRef = useRef<"xy" | "latlon" | null>(null);

    const [position, setPosition] = useState<L.LatLngExpression>(() => {
        if (isValidCoordinate(watch_latitude) && isValidCoordinate(watch_longitude)) {
            return [watch_latitude, watch_longitude];
        } else if (isValidCoordinate(watch_coord_x) && isValidCoordinate(watch_coord_y)) {
            const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", [watch_coord_x, watch_coord_y]);
            return [lat, lng];
        }
        return defaultCoordinates;
    });

    const updateXYFromLatLon = (lat: number, lng: number) => {
        if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
            const [x, y] = proj4("EPSG:4326", "EPSG:2056", [lng, lat]);
            getElevationSwissTopo(x, y).then((z) => {
                setCoordinateData({
                    coord_x: x,
                    coord_y: y,
                    coord_z: z || null,
                    latitude: lat,
                    longitude: lng,
                });
            });
            setPosition([lat, lng]);
            lastUpdatedRef.current = "latlon";
        }
    };

    useEffect(() => {
        if (coordinateData.coord_x && coordinateData.coord_y && (!coordinateData.latitude || !coordinateData.longitude)) {
            const [lat, lon] = proj4("EPSG:2056", "EPSG:4326", [coordinateData.coord_x, coordinateData.coord_y]);
            getElevationSwissTopo(coordinateData.coord_x, coordinateData.coord_y).then((z) => {
                setCoordinateData({
                    ...coordinateData,
                    latitude: lat,
                    longitude: lon,
                    coord_z: z || null,
                });
            });
        }
        if (coordinateData.latitude && coordinateData.longitude && (!coordinateData.coord_x || !coordinateData.coord_y)) {
            const [x, y] = proj4("EPSG:4326", "EPSG:2056", [coordinateData.longitude, coordinateData.latitude]);
            getElevationSwissTopo(x, y).then((z) => {
                setCoordinateData({
                    ...coordinateData,
                    coord_x: x,
                    coord_y: y,
                    coord_z: z || null,
                });
            });
        }
        if (!watch_coord_x && coordinateData.coord_x) {
            setValue("coord_x", coordinateData.coord_x, { shouldValidate: true });
        }
        if (!watch_coord_y && coordinateData.coord_y) {
            setValue("coord_y", coordinateData.coord_y, { shouldValidate: true });
        }
        if (!watch_coord_z && coordinateData.coord_z) {
            setValue("coord_z", coordinateData.coord_z, { shouldValidate: true });
        }
        if (!watch_latitude && coordinateData.latitude) {
            setValue("latitude", coordinateData.latitude, { shouldValidate: true });
        }
        if (!watch_longitude && coordinateData.longitude) {
            setValue("longitude", coordinateData.longitude, { shouldValidate: true });
        }
    }, [coordinateData, watch_coord_x, watch_coord_y, watch_coord_z, watch_latitude, watch_longitude]);

    useEffect(() => {
        if (lastUpdatedRef.current === "xy" && isValidCoordinate(watch_coord_x) && isValidCoordinate(watch_coord_y)) {
            const [lng, lat] = proj4("EPSG:2056", "EPSG:4326", [watch_coord_x, watch_coord_y]);
            if (Math.abs(lat - (position as number[])[0]) > 0.000001 || Math.abs(lng - (position as number[])[1]) > 0.000001) {
                setPosition([lat, lng]);
                setCoordinateData({
                    ...coordinateData,
                    coord_x: watch_coord_x,
                    coord_y: watch_coord_y,
                    latitude: lat,
                    longitude: lng,
                });
            }
        }
    }, [watch_coord_x, watch_coord_y]);

    useEffect(() => {
        if (lastUpdatedRef.current === "latlon" && isValidCoordinate(watch_latitude) && isValidCoordinate(watch_longitude)) {
            if (Math.abs(watch_latitude - (position as number[])[0]) > 0.000001 || Math.abs(watch_longitude - (position as number[])[1]) > 0.000001) {
                const [x, y] = proj4("EPSG:4326", "EPSG:2056", [watch_longitude, watch_latitude]);
                setPosition([watch_latitude, watch_longitude]);
                setCoordinateData({
                    ...coordinateData,
                    coord_x: x,
                    coord_y: y,
                    latitude: watch_latitude,
                    longitude: watch_longitude,
                });
            }
        }
    }, [watch_latitude, watch_longitude]);

    return (
        <div
            style={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? "none" : "auto",
            }}
        >
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={5}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <NumberInput
                                source="coord_x"
                                label="X Coordinate (m: SRID 2056)"
                                disabled={disabled}
                                validate={is_required ? [required()] : undefined}
                                onChange={() => {
                                    lastUpdatedRef.current = "xy";
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <NumberInput
                                source="coord_y"
                                label="Y Coordinate (m: SRID 2056)"
                                disabled={disabled}
                                validate={is_required ? [required()] : undefined}
                                onChange={() => {
                                    lastUpdatedRef.current = "xy";
                                }}
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
                            <ElevationInput disabled={disabled} is_required={is_required} />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={7}>
                    <div style={{ position: 'relative' }}>
                        <MapContainer
                            center={position}
                            zoom={13}
                            style={{ height: "400px", width: "100%", zIndex: 1000 }}
                        >
                            <BaseLayers />
                            <Marker
                                position={position}
                                draggable={!disabled}
                                zIndexOffset={1000}
                                eventHandlers={{
                                    dragend(e) {
                                        const { lat, lng } = e.target.getLatLng();
                                        updateXYFromLatLon(lat, lng);
                                    },
                                }}
                            />
                            <AreaPolygonAndMarkers areaId={props.area_id} setPolygonCoords={setAreaPolygonCoords} />
                            <RecenterButton updateXY={updateXYFromLatLon} />
                            <MapUpdater areaId={props.area_id} polygonCoords={areaPolygonCoords} />
                        </MapContainer>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
};

export const AreaCoordinateEntry = ({ source = "area_id", is_required = true }: { source?: string; is_required?: boolean }) => {
    // This component is used to show the coordinate input fields when an area is selected.
    const { watch } = useFormContext();
    const selectedArea = watch(source);
    const isDisabled = !selectedArea;
    return <CoordinateInput area_id={selectedArea} disabled={isDisabled} is_required={is_required} />;
};

export default CoordinateInput;
