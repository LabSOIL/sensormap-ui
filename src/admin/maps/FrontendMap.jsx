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

// Component to track zoom and map bounds
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

// Renders an area polygon with an enhanced label (tooltip)
const ZoomablePolygon = ({ area }) => {
    const map = useMap();
    if (!area.geom) return null;
    const positions = area.geom.coordinates[0].map(coord => [coord[1], coord[0]]);
    const bounds = L.latLngBounds(positions);
    const handleZoom = () => {
        map.fitBounds(bounds);
    };
    return (
        <Polygon
            positions={positions}
            color={area.project && area.project.color ? area.project.color : 'grey'}
            eventHandlers={{ click: handleZoom }}
        >
            <Tooltip
                permanent
                interactive={true}
                direction="center"
            >
            
                <span
                    onClick={handleZoom}
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
        </Polygon>
    );
};

// Helper to calculate the midpoint between two coordinates (each as [lat, lng])
const calculateMiddlePosition = (coord1, coord2) => {
    const lat = (coord1[0] + coord2[0]) / 2;
    const lng = (coord1[1] + coord2[1]) / 2;
    return [lat, lng];
};

// Ensure that the generated path is absolute (starts with '/')
const getAbsolutePath = (path) => (path.startsWith('/') ? path : '/' + path);

const ResetZoomControl = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        // Find the default zoom control container
        const zoomControl = document.querySelector('.leaflet-control-zoom');
        if (!zoomControl) return;
        // Create the reset button element
        const resetButton = document.createElement('a');
        resetButton.href = '#';
        resetButton.title = 'Reset Zoom';
        resetButton.innerHTML = '↺'; // Unicode reset icon
        // Apply inline styles to mimic the default zoom button
        resetButton.style.backgroundColor = 'white';
        resetButton.style.width = '30px';
        resetButton.style.height = '30px';
        resetButton.style.lineHeight = '30px';
        resetButton.style.textAlign = 'center';
        resetButton.style.color = 'black';
        resetButton.style.fontSize = '18px';
        resetButton.style.cursor = 'pointer';
        resetButton.style.fontWeight = 'bold';
        // Disable propagation so the map doesn't also catch the click
        L.DomEvent.disableClickPropagation(resetButton);
        L.DomEvent.on(resetButton, 'click', (e) => {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            map.fitBounds(bounds);
        });
        // Insert the reset button into the zoom control container.
        // This puts it between the zoom in and zoom out buttons.
        if (zoomControl.children.length >= 2) {
            zoomControl.insertBefore(resetButton, zoomControl.children[1]);
        } else {
            zoomControl.appendChild(resetButton);
        }
        // Clean up on unmount
        return () => {
            if (resetButton && resetButton.parentNode) {
                resetButton.parentNode.removeChild(resetButton);
            }
        };
    }, [map, bounds]);
    return null;
};



const FrontendMap = ({ height = "60%", width = "80%" }) => {
    const dataProvider = useDataProvider();
    const createPath = useCreatePath();
    const [areas, setAreas] = useState([]);
    const [bounds, setBounds] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(13);
    const [currentMapBounds, setCurrentMapBounds] = useState(null);
    const fittedRef = useRef(false);

    // State for toggling layer visibility via the Legend
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

    // Define EPSG:2056 with to wgs84 parameters
    proj4.defs("EPSG:2056", "+proj=somerc +lat_0=46.9524055555556 +lon_0=7.43958333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs +type=crs");
    const convertCoordinates = (x, y) => proj4("EPSG:2056", "EPSG:4326", [x, y]); // returns [lng, lat]

    // Fetch areas (with nested features) and compute padded bounds so details are centered
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
                const computedBounds = allCoords.length > 0 ? L.latLngBounds(allCoords).pad(0.5) : null;
                setBounds(computedBounds);
            })
            .catch(error => console.error('Error fetching areas:', error));
    }, [dataProvider]);

    // Icon mapping for features (matching the Legend)
    const iconMapping = {
        "Plot": { icon: 'trowel', markerColor: 'green', iconColor: 'black', resource: 'plots' },
        "Sensor Profile": { icon: 'temperature-low', markerColor: 'blue', iconColor: 'yellow', resource: 'sensor_profiles' },
        "Soil Profile": { icon: 'clipboard', markerColor: 'red', iconColor: 'yellow', resource: 'soil_profiles' },
        "Transect": { icon: 'road', markerColor: 'black', iconColor: 'white', resource: 'transects' }
    };

    // Generate markers from nested data (only when zoom level is 15 or greater)
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
                        // Create one marker per transect using the midpoint between the first two nodes
                        const pos = calculateMiddlePosition(
                            proj4(`EPSG:${transect.nodes[0].plot.coord_srid}`, 'EPSG:4326', [transect.nodes[0].plot.coord_x, transect.nodes[0].plot.coord_y]).reverse(),
                            proj4(`EPSG:${transect.nodes[1].plot.coord_srid}`, 'EPSG:4326', [transect.nodes[1].plot.coord_x, transect.nodes[1].plot.coord_y]).reverse()
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

    // Generate polylines for transects (joining all nodes)
    let transectPolylines = [];
    areas.forEach(area => {
        if (area.transects && Array.isArray(area.transects)) {
            area.transects.forEach(transect => {
                if (transect.nodes && transect.nodes.length > 1) {
                    const positions = transect.nodes.map(node => {
                        if (node.plot.coord_x && node.plot.coord_y) {
                            const [lng, lat] = convertCoordinates(node.plot.coord_x, node.plot.coord_y);
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

    // Component to fit the map bounds on first load
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

    const swissBounds = [
        [45.398181, 5.140242],
        [47.808455, 10.492294]
    ];
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
                maxBounds={swissBounds}
                maxZoom={20}
                minZoom={9}
            >
                <MapEvents setZoomLevel={setZoomLevel} setCurrentMapBounds={setCurrentMapBounds} />
                <ResetZoomControl bounds={bounds || [swissBounds]} />
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
                                    {/* Permanent label above each marker */}
                                    <Tooltip permanent direction="top" offset={[0, -35]} className="small-tooltip">
                                        <span style={{
                                            padding: '2px 4px',
                                            borderRadius: '3px',
                                            fontSize: '0.8em',
                                        }}>
                                            {marker.data.name}
                                        </span>
                                    </Tooltip>
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
