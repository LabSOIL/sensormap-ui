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
    Tooltip
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

export const LocationFieldPoints = () => {
    const record = useRecordContext();
    if (!record) return <Loading />;

    const createPath = useCreatePath();
    const {
        data: plotData,
        isLoading: plotLoading,
        error: plotError
    } = useGetManyReference(
        'plots', { target: 'area_id', id: record.id }
    );
    const {
        data: sensorData,
        isLoading: sensorLoading,
        error: sensorError
    } = useGetManyReference(
        'sensors', { target: 'area_id', id: record.id }
    );
    const {
        data: soilProfileData,
        isLoading: soilProfileLoading,
        error: soilProfileError
    } = useGetManyReference(
        'soil_profiles', { target: 'area_id', id: record.id }
    );

    if (!record || plotLoading || sensorLoading || soilProfileLoading) return <Loading />;

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

    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            bounds={polygonCoordinates}
            scrollWheelZoom={true}
            maxZoom={18}
        >
            <BaseLayers />
            <Polygon
                positions={polygonCoordinates}
                pathOptions={{ color: record.project.color, opacity: 1, fillOpacity: 0.2 }}
                interactive={false}
            />
            {sensorData.map((sensor, index) => (
                <Marker
                    key={index}
                    position={sensor["geom"]["coordinates"]}
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
            {plotData.map((plot, index) => (
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
                        <br /><br />
                        <Link to={createPath({ type: 'show', resource: 'plots', id: plot['id'] })}>
                            Go to Plot
                        </Link>
                    </Popup>
                </Marker>
            ))}
            {soilProfileData.map((soilProfile, index) => (
                < Marker
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
            <Legend /> {/* Add the Legend component */}
        </MapContainer>
    );
};
