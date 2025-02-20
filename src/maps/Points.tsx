import {
    useRecordContext,
    useRedirect,
    useGetManyReference,
    useCreatePath,
    Loading,
} from 'react-admin';
import {
    MapContainer,
    Marker,
    Popup,
    Polygon,
    Tooltip,
    Polyline
} from 'react-leaflet';
import { Link } from 'react-router-dom';
import { BaseLayers } from './Layers';
import * as L from 'leaflet';
import ParkIcon from '@mui/icons-material/Park';
import { Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import Legend from './Legend'; // Import the Legend component
import MarkerClusterGroup from 'react-leaflet-cluster'
import React, { useState } from 'react';
import proj4 from 'proj4';
import react from '@vitejs/plugin-react';


const sensorIcon = L.AwesomeMarkers.icon({
    icon: 'temperature-low',
    iconColor: 'yellow',
    prefix: 'fa',
    markerColor: 'blue'
});

const plotIcon = L.AwesomeMarkers.icon({
    icon: 'trowel',
    iconColor: 'black',
    prefix: 'fa',
    markerColor: 'green'
});

const soilProfileIcon = L.AwesomeMarkers.icon({
    icon: 'clipboard',
    iconColor: 'yellow',
    prefix: 'fa',
    markerColor: 'red'
});

const transectIcon = L.AwesomeMarkers.icon({
    icon: 'road',
    iconColor: 'white',
    prefix: 'fa',
    markerColor: 'black'
});

export const LocationFieldPoints = () => {
    const record = useRecordContext();
    const createPath = useCreatePath();

    if (!record) return <Loading />;

    const flipCoordinates = (coords) => coords.map(coord => [coord[1], coord[0]]);
    const flipPolygonCoordinates = (polygon) => polygon.map(ring => flipCoordinates(ring));

    if (!record.geom || !record.geom.coordinates) {
        return (
            <Typography variant="h6">No location data available</Typography>
        );
    }
    const polygonCoordinates = flipPolygonCoordinates(record["geom"]["coordinates"]);

    // Define the state to track visibility of layers
    const [layersVisibility, setLayersVisibility] = useState({
        sensor_profiles: { visible: true, label: 'Sensors' },
        plots: { visible: true, label: 'Plots' },
        soil_profiles: { visible: true, label: 'Soil Profiles' },
        transects: { visible: true, label: 'Transects' }
    });

    // Function to toggle the visibility of layers
    const toggleLayer = (layerKey) => {
        setLayersVisibility((prevState) => ({
            ...prevState,
            [layerKey]: { ...prevState[layerKey], visible: !prevState[layerKey].visible }
        }));
    };
    const calculateMiddlePosition = (coord1, coord2) => {
        const lat = (coord1[0] + coord2[0]) / 2;
        const lng = (coord1[1] + coord2[1]) / 2;
        return [lat, lng];
    };
    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
            bounds={polygonCoordinates}
            scrollWheelZoom={true}
            maxZoom={20}
        >
            <Polygon
                positions={polygonCoordinates}
                pathOptions={{ color: record.project.color, opacity: 1, fillOpacity: 0.2 }}
                interactive={false}
            />
            <MarkerClusterGroup maxClusterRadius={40} chunkedLoading >
                {layersVisibility.sensor_profiles.visible && record.sensor_profiles.map((obj, index) => (
                    <Marker
                        key={index}
                        position={proj4(`EPSG:${obj.coord_srid}`, 'EPSG:4326', [obj.coord_x, obj.coord_y]).reverse()}
                        icon={L.AwesomeMarkers.icon({
                            icon: 'temperature-low',
                            iconColor: 'yellow',
                            prefix: 'fa',
                            markerColor: 'blue'
                        })}
                    >
                        <Tooltip permanent>{obj["name"]}</Tooltip>
                        <Popup>
                            <b>{obj["name"]}</b>
                            <br />
                            {obj["description"]}
                            <br /><br />
                            <Link to={createPath({ type: 'show', resource: 'sensor_profiles', id: obj['id'] })}>
                                Go to Sensor
                            </Link>
                        </Popup>
                    </Marker>
                ))}
                {layersVisibility.plots.visible && record.plots.map((obj, index) => (
                    <Marker
                        key={index}
                        position={proj4(`EPSG:${obj.coord_srid}`, 'EPSG:4326', [obj.coord_x, obj.coord_y]).reverse()}
                        icon={L.AwesomeMarkers.icon({
                            icon: 'trowel',
                            iconColor: 'black',
                            prefix: 'fa',
                            markerColor: 'green'
                        })}
                    >
                        <Tooltip permanent>{obj["name"]}</Tooltip>
                        <Popup>
                            <b>{obj["name"]}</b>
                            <br />
                            {obj["description"]}
                            <br /><br />
                            <Link to={createPath({ type: 'show', resource: 'plots', id: obj['id'] })}>
                                Go to Plot
                            </Link>
                        </Popup>
                    </Marker>
                ))}
                {layersVisibility.soil_profiles.visible && record.soil_profiles.map((obj, index) => (
                    <Marker
                        key={index}
                        position={proj4(`EPSG:${obj.coord_srid}`, 'EPSG:4326', [obj.coord_x, obj.coord_y]).reverse()}
                        icon={L.AwesomeMarkers.icon({
                            icon: 'clipboard',
                            iconColor: 'yellow',
                            prefix: 'fa',
                            markerColor: 'red'
                        })}
                    >
                        <Tooltip permanent>{obj["name"]}</Tooltip>
                        <Popup>
                            <b>{obj["name"]}</b>
                            <br />
                            {obj["description"]}
                            <br /><br />
                            <Link to={createPath({ type: 'show', resource: 'soil_profiles', id: obj['id'] })}>
                                Go to Soil Profile
                            </Link>
                        </Popup>
                    </Marker>
                ))}
                {layersVisibility.transects.visible && record.transects.map((transect, index) => (
                    <>
                        <Polyline
                            key={index}
                            positions={transect.nodes.map(node => proj4(`EPSG:${node.coord_srid}`, 'EPSG:4326', [node.coord_x, node.coord_y]).reverse())}
                            color="black"
                            weight={5}
                        />
                        {transect.nodes.length > 1 && (
                            <Marker
                                position={
                                    calculateMiddlePosition(
                                        proj4(`EPSG:${transect.nodes[0].coord_srid}`, 'EPSG:4326', [transect.nodes[0].coord_x, transect.nodes[0].coord_y]).reverse(),
                                        proj4(`EPSG:${transect.nodes[1].coord_srid}`, 'EPSG:4326', [transect.nodes[1].coord_x, transect.nodes[1].coord_y]).reverse()
                                    )
                                }
                                icon={L.AwesomeMarkers.icon({
                                    icon: 'road',
                                    iconColor: 'white',
                                    prefix: 'fa',
                                    markerColor: 'black'
                                })}
                            >
                                <Tooltip permanent>
                                    {transect.name}
                                </Tooltip>
                                <Popup>
                                    <b>Name</b>: {transect["name"]}
                                    <br />
                                    <b>Description</b>: {transect["description"]}
                                    <br />
                                    Nodes:
                                    <ul>
                                        {transect.nodes.map((node, index) => (
                                            <li key={index}>{node.name}</li>
                                        ))}
                                    </ul>
                                    <Link to={createPath({ type: 'show', resource: 'transects', id: transect['id'] })}>
                                        Go to Transect
                                    </Link>
                                </Popup>
                            </Marker>
                        )}
                    </>
                ))}
            </MarkerClusterGroup>
            <BaseLayers />
            <Legend layers={layersVisibility} toggleLayer={toggleLayer} />
        </MapContainer >
    );
};

// Define an icon for the GNSS point
const gnssIcon = L.AwesomeMarkers.icon({
    icon: 'map-marker',
    iconColor: 'white',
    prefix: 'fa',
    markerColor: 'blue',
});

export const GNSSMap = () => {
    const record = useRecordContext();

    if (!record) {
        return <Typography variant="h6">Loading GNSS point...</Typography>;
    }

    if (!record.latitude || !record.longitude) {
        return (
            <Typography variant="h6">No GNSS location data available</Typography>
        );
    }

    const position = [record.latitude, record.longitude];

    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
            center={position}
            zoom={15}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            <Marker position={position} icon={gnssIcon}>
                <Tooltip permanent>{record.name}</Tooltip>
            </Marker>
        </MapContainer>
    );
};