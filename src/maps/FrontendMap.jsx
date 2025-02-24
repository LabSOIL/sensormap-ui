import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, useMap, useMapEvents, Marker, Popup, Polygon, Tooltip, Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BaseLayers } from './Layers';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import proj4 from 'proj4';
import { useDataProvider, useCreatePath } from 'react-admin';
import { Link } from 'react-router-dom';
import Legend from './Legend';

// Map events component to track zoom and bounds
const MapEvents = ({ setZoomLevel, setCurrentMapBounds }) => {
    const map = useMap();
    useMapEvents({
        zoomend() {
            setZoomLevel(map.getZoom());
        },
        moveend() {
            setCurrentMapBounds(map.getBounds());
        },
    });
    return null;
};

// Component to render an area polygon with a tooltip that zooms in
const ZoomablePolygon = ({ area }) => {
    const map = useMap();
    if (!area.geom) return null;
    const positions = area.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
    const center = positions.reduce((acc, pos) => [acc[0] + pos[0], acc[1] + pos[1]], [0, 0]);
    const centerPos = [center[0] / positions.length, center[1] / positions.length];
    const handleZoom = () => {
        map.setView(centerPos, 15);
    };
    return (
        <Polygon
            positions={positions}
            color={area.project && area.project.color ? area.project.color : 'blue'}
            eventHandlers={{ click: handleZoom }}
        >
            <Tooltip permanent interactive={true}>
                <span onClick={handleZoom} style={{ cursor: 'pointer' }}>{area.name}</span>
            </Tooltip>
        </Polygon>
    );
};

// Helper to calculate the midpoint between two coordinates (each [lat, lng])
const calculateMiddlePosition = (coord1, coord2) => {
    const lat = (coord1[0] + coord2[0]) / 2;
    const lng = (coord1[1] + coord2[1]) / 2;
    return [lat, lng];
};

// Ensure the generated path is absolute (starts with "/")
const getAbsolutePath = (path) => path.startsWith('/') ? path : '/' + path;

const FrontendMap = ({ height = "60%", width = "80%" }) => {
    const dataProvider = useDataProvider();
    const createPath = useCreatePath();
    const [areas, setAreas] = useState([]);
    const [bounds, setBounds] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(13);
    const [currentMapBounds, setCurrentMapBounds] = useState(null);
    const fittedRef = useRef(false);

    // Local state to manage layer visibility (used by the Legend)
    const [layersVisibility, setLayersVisibility] = useState({
        sensor_profiles: { visible: true, label: 'Sensors' },
        plots: { visible: true, label: 'Plots' },
        soil_profiles: { visible: true, label: 'Soil Profiles' },
        transects: { visible: true, label: 'Transects' }
    });

    const toggleLayer = (layerKey) => {
        setLayersVisibility(prev => ({
            ...prev,
            [layerKey]: { ...prev[layerKey], visible: !prev[layerKey].visible }
        }));
    };

    // Define the Swiss coordinate system (EPSG:2056) with the towgs84 parameters
    proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs");
    const convertCoordinates = (x, y) => proj4("EPSG:2056", "EPSG:4326", [x, y]); // returns [lng, lat]

    // Fetch areas from react-admin (each area contains nested plots, sensor_profiles, soil_profiles, and transects)
    useEffect(() => {
        dataProvider.getList('areas', {
            filter: {},
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
        })
            .then(({ data: areasData }) => {
                setAreas(areasData);
                const allCoords = areasData
                    .filter(area => area.geom && area.geom.coordinates && area.geom.coordinates.length > 0)
                    .flatMap(area => area.geom.coordinates[0].map(coord => [coord[1], coord[0]]));
                const computedBounds = allCoords.length > 0 ? L.latLngBounds(allCoords) : null;
                setBounds(computedBounds);
            })
            .catch(error => console.error('Error fetching areas:', error));
    }, [dataProvider]);

    // Icon mapping matching the legend; note transect now uses key "Transect"
    const iconMapping = {
        "Plot": { icon: 'trowel', markerColor: 'green', iconColor: 'black', resource: 'plots' },
        "Sensor Profile": { icon: 'temperature-low', markerColor: 'blue', iconColor: 'yellow', resource: 'sensor_profiles' },
        "Soil Profile": { icon: 'clipboard', markerColor: 'red', iconColor: 'yellow', resource: 'soil_profiles' },
        "Transect": { icon: 'road', markerColor: 'black', iconColor: 'white', resource: 'transects' }
    };

    // Generate markers from the nested data
    let markers = [];
    areas.forEach(area => {
        if (zoomLevel >= 15) {
            if (area.plots && Array.isArray(area.plots)) {
                area.plots.forEach(plot => {
                    if (plot.coord_x && plot.coord_y) {
                        const [lng, lat] = convertCoordinates(plot.coord_x, plot.coord_y);
                        markers.push({
                            id: `plot-${plot.id}`,
                            position: [lat, lng],
                            type: 'Plot',
                            data: plot,
                            area: area
                        });
                    }
                });
            }
            if (area.sensor_profiles && Array.isArray(area.sensor_profiles)) {
                area.sensor_profiles.forEach(sp => {
                    if (sp.coord_x && sp.coord_y) {
                        const [lng, lat] = convertCoordinates(sp.coord_x, sp.coord_y);
                        markers.push({
                            id: `sensor-${sp.id}`,
                            position: [lat, lng],
                            type: 'Sensor Profile',
                            data: sp,
                            area: area
                        });
                    }
                });
            }
            if (area.soil_profiles && Array.isArray(area.soil_profiles)) {
                area.soil_profiles.forEach(sp => {
                    if (sp.coord_x && sp.coord_y) {
                        const [lng, lat] = convertCoordinates(sp.coord_x, sp.coord_y);
                        markers.push({
                            id: `soil-${sp.id}`,
                            position: [lat, lng],
                            type: 'Soil Profile',
                            data: sp,
                            area: area
                        });
                    }
                });
            }
            if (area.transects && Array.isArray(area.transects)) {
                area.transects.forEach(transect => {
                    if (transect.nodes && Array.isArray(transect.nodes) && transect.nodes.length > 1) {
                        // Calculate a single marker position for the transect (using the midpoint of the first two nodes)
                        const pos = calculateMiddlePosition(
                            proj4(`EPSG:${transect.nodes[0].coord_srid}`, 'EPSG:4326', [transect.nodes[0].coord_x, transect.nodes[0].coord_y]).reverse(),
                            proj4(`EPSG:${transect.nodes[1].coord_srid}`, 'EPSG:4326', [transect.nodes[1].coord_x, transect.nodes[1].coord_y]).reverse()
                        );
                        markers.push({
                            id: `transect-${transect.id}`,
                            position: pos,
                            type: 'Transect',
                            data: transect,
                            area: area
                        });
                    }
                });
            }
        }
    });

    const filteredMarkers = markers.filter(marker => {
        if (marker.type === 'Plot') return layersVisibility.plots.visible;
        if (marker.type === 'Sensor Profile') return layersVisibility.sensor_profiles.visible;
        if (marker.type === 'Soil Profile') return layersVisibility.soil_profiles.visible;
        if (marker.type === 'Transect') return layersVisibility.transects.visible;
        return true;
    });

    // Generate polylines for transects (connecting all nodes)
    let transectPolylines = [];
    areas.forEach(area => {
        if (area.transects && Array.isArray(area.transects)) {
            area.transects.forEach(transect => {
                if (transect.nodes && transect.nodes.length > 1) {
                    const positions = transect.nodes.map(node => {
                        if (node.coord_x && node.coord_y) {
                            const [lng, lat] = convertCoordinates(node.coord_x, node.coord_y);
                            return [lat, lng];
                        }
                        return null;
                    }).filter(pos => pos !== null);
                    if (positions.length > 1) {
                        transectPolylines.push({
                            id: transect.id,
                            positions
                        });
                    }
                }
            });
        }
    });

    const FitBounds = ({ bounds }) => {
        const map = useMap();
        useEffect(() => {
            if (bounds && !fittedRef.current) {
                map.fitBounds(bounds);
                fittedRef.current = true;
            }
        }, [bounds, map]);
        return null;
    };

    return (
        <div style={{
            position: 'relative',
            height: height,
            width: width,
            margin: '20px auto',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
            }} />
            <MapContainer
                bounds={bounds || [[45.398181, 5.140242], [47.808455, 10.492294]]}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                maxBounds={[
                    [45.398181, 5.140242],
                    [47.808455, 10.492294]
                ]}
                minZoom={9}
            >
                <MapEvents setZoomLevel={setZoomLevel} setCurrentMapBounds={setCurrentMapBounds} />
                <BaseLayers />
                <FitBounds bounds={bounds} />
                {zoomLevel >= 15 && (
                    <MarkerClusterGroup maxClusterRadius={25} chunkedLoading>
                        {filteredMarkers.map(marker => {
                            const mapping = iconMapping[marker.type] || { icon: 'map-marker', markerColor: 'blue', iconColor: 'white', resource: 'areas' };
                            return (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    icon={L.AwesomeMarkers.icon({
                                        icon: mapping.icon,
                                        prefix: 'fa',
                                        markerColor: mapping.markerColor,
                                        iconColor: mapping.iconColor,
                                    })}
                                >
                                    <Popup>
                                        <div style={{ fontSize: '0.9em' }}>
                                            <strong>{marker.type}</strong>
                                            <br />
                                            <b>Name:</b> {marker.data.name || 'N/A'}
                                            {marker.data.description && (
                                                <>
                                                    <br /><b>Description:</b> {marker.data.description}
                                                </>
                                            )}
                                            {marker.area && marker.area.name && (
                                                <>
                                                    <br /><b>Area:</b> {marker.area.name}
                                                </>
                                            )}
                                            {marker.data.last_updated && (
                                                <>
                                                    <br /><b>Last Updated:</b> {new Date(marker.data.last_updated).toLocaleString()}
                                                </>
                                            )}
                                            <br />
                                            <Link to={getAbsolutePath(createPath({ type: 'show', resource: mapping.resource, id: marker.data.id }))}>
                                                {marker.type === 'Transect' ? 'Go to Transect' : 'View Details'}
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MarkerClusterGroup>
                )}
                {layersVisibility.transects.visible && transectPolylines.map(poly => (
                    <Polyline key={poly.id} positions={poly.positions} color="black" weight={5} />
                ))}
                {areas.map(area => (
                    <ZoomablePolygon key={area.id} area={area} />
                ))}
                <Legend layers={layersVisibility} toggleLayer={toggleLayer} />
            </MapContainer>
        </div>
    );
};

export default FrontendMap;
