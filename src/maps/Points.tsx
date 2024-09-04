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

    const polygonCoordinates = flipPolygonCoordinates(record["geom"]["coordinates"]);

    // Define the state to track visibility of layers
    const [layersVisibility, setLayersVisibility] = useState({
        sensors: { visible: true, label: 'Sensors' },
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
                {layersVisibility.sensors.visible && record.sensors.map((sensor, index) => (
                    <Marker
                        key={index}
                        position={[sensor["latitude"], sensor["longitude"]]}
                        icon={L.AwesomeMarkers.icon({
                            icon: 'temperature-low',
                            iconColor: 'yellow',
                            prefix: 'fa',
                            markerColor: 'blue'
                        })}
                    >
                        <Tooltip permanent>{sensor["name"]}</Tooltip>
                        <Popup>
                            <b>{sensor["name"]}</b>
                            <br />
                            {sensor["description"]}
                            <br /><br />
                            <Link to={createPath({ type: 'show', resource: 'sensors', id: sensor['id'] })}>
                                Go to Sensor
                            </Link>
                        </Popup>
                    </Marker>
                ))}
                {layersVisibility.plots.visible && record.plots.map((plot, index) => (
                    <Marker
                        key={index}
                        position={[plot["latitude"], plot["longitude"]]}
                        icon={L.AwesomeMarkers.icon({
                            icon: 'trowel',
                            iconColor: 'black',
                            prefix: 'fa',
                            markerColor: 'green'
                        })}
                    >
                        <Tooltip permanent>{plot["name"]}</Tooltip>
                        <Popup>
                            <b>{plot["name"]}</b>
                            <br />
                            {plot["description"]}
                            <br /><br />
                            <Link to={createPath({ type: 'show', resource: 'plots', id: plot['id'] })}>
                                Go to Plot
                            </Link>
                        </Popup>
                    </Marker>
                ))}
                {layersVisibility.soil_profiles.visible && record.soil_profiles.map((soilProfile, index) => (
                    <Marker
                        key={index}
                        position={[soilProfile["latitude"], soilProfile["longitude"]]}
                        icon={L.AwesomeMarkers.icon({
                            icon: 'clipboard',
                            iconColor: 'yellow',
                            prefix: 'fa',
                            markerColor: 'red'
                        })}
                    >
                        <Tooltip permanent>{soilProfile["name"]}</Tooltip>
                        <Popup>
                            <b>{soilProfile["name"]}</b>
                            <br />
                            {soilProfile["description"]}
                            <br /><br />
                            <Link to={createPath({ type: 'show', resource: 'soil_profiles', id: soilProfile['id'] })}>
                                Go to Soil Profile
                            </Link>
                        </Popup>
                    </Marker>
                ))}
                {layersVisibility.transects.visible && record.transects.map((transect, index) => (
                    <>
                        <Polyline
                            key={index}
                            positions={transect.nodes.map(node => [node.latitude, node.longitude])}
                            color="black"
                            weight={5}
                        />
                        {transect.nodes.length > 1 && (
                            <Marker
                                position={
                                    calculateMiddlePosition(
                                        [transect.nodes[0].latitude, transect.nodes[0].longitude],
                                        [transect.nodes[1].latitude, transect.nodes[1].longitude]
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