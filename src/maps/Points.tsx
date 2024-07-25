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

    const flipCoordinates = (coords) => {
        return coords.map(coord => [coord[1], coord[0]]);
    };

    const flipPolygonCoordinates = (polygon) => {
        return polygon.map(ring => flipCoordinates(ring));
    };

    if (record && !record.geom) {
        return (<><Typography variant="h6">No location data available</Typography><br />
            <Typography variant="caption">Map of points will show when data is assigned to Area</Typography></>)
    }

    const polygonCoordinates = flipPolygonCoordinates(record["geom"]["coordinates"]);

    const getLowestSampleText = (point) => {
        if (!point.samples || point.samples.length === 0) {
            return null;
        }

        // For all of the samples in the array, find the sample that has the highest upper_depth_cm
        const lowest_sample = point.samples.reduce((prev, current) => {
            return (prev.upper_depth_cm > current.upper_depth_cm) ? prev : current;
        });
        return (
            <div><br />
                <b>Samples:</b> {point.samples.length}
                <br />
                <b>Lowest sample:</b> {lowest_sample.name}
                <br />
                <b>Depth:</b> {lowest_sample.upper_depth_cm} - {lowest_sample.lower_depth_cm} cm
                <br />
                <b>Weight:</b> {lowest_sample.sample_weight} g
                <br />
                {lowest_sample.sampled_on ? <b>Sampled on:</b> : null}
                <br />
            </div>
        )
    }

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
            <BaseLayers />
            <Polygon
                positions={polygonCoordinates}
                pathOptions={{ color: record.project.color, opacity: 1, fillOpacity: 0.2 }}
                interactive={false}
            />
            <MarkerClusterGroup maxClusterRadius={40} chunkedLoading >
                {record.sensors.map((sensor, index) => (
                    <Marker
                        key={index}
                        position={[sensor["latitude"], sensor["longitude"]]}
                        icon={sensorIcon}
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
                {record.plots ? record.plots.map((plot, index) => {
                    return (
                        < Marker
                            key={index}
                            position={[plot["latitude"], plot["longitude"]]}
                            icon={plotIcon}
                        >
                            <Tooltip permanent>{plot["name"]}</Tooltip>
                            <Popup>
                                <b>{plot["name"]}</b>
                                <br />
                                {plot["description"]}
                                {getLowestSampleText(plot)}
                                <br /><br />
                                <Link to={createPath({ type: 'show', resource: 'plots', id: plot['id'] })}>
                                    Go to Plot
                                </Link>
                            </Popup>
                        </Marker>
                    )
                }) : null}

                {record.soil_profiles.map((soilProfile, index) => (
                    <Marker
                        key={index}
                        position={[soilProfile["latitude"], soilProfile["longitude"]]}
                        icon={soilProfileIcon}
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


                {record.transects.map((transect, index) => (
                    <>
                        <Polyline
                            key={index}
                            positions={
                                transect.nodes.map(node => [node.latitude, node.longitude])
                            }
                            color="red"
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
                                icon={transectIcon}
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
            <Legend />
        </MapContainer >
    );
}
