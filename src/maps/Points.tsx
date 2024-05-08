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

export const LocationFieldPoints = () => {
    const record = useRecordContext();
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

    if (!record || plotLoading || sensorLoading) return <Loading />;

    console.log("Plot data:", plotData);
    console.log("Sensor data:", sensorData);
    console.log("Soil Profile data:", soilProfileData);

    const fontAwesomeIcon = L.divIcon({
        URL: <ParkIcon />,
        iconSize: [40, 40],
        iconAnchor: [0, 36],
        popupAnchor: [0, -38],
        className: ''
    });
    const fontAwesomeIcon2 = L.icon({
        iconUrl: 'twitter_icon2.png',
        iconSize: [25, 25],
        iconAnchor: [0, 0],
        popupAnchor: [0, 0],
        shadowUrl: 'twitter_shadow.png',
        shadowSize: [22, 22],
        shadowAnchor: [1, 1]
    });

    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            bounds={record["geom"]["coordinates"]}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            {sensorData.map((sensor, index) => (
                < Marker
                    key={index}
                    position={sensor["geom"]["coordinates"]}

                ><Tooltip permanent>{sensor["name"]}</Tooltip>
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

                ><Tooltip permanent>{plot["name"]}</Tooltip>
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
            ))
            }
            {soilProfileData.map((soilProfile, index) => (
                < Marker
                    key={index}
                    position={[soilProfile["latitude"], soilProfile["longitude"]]}
                // icon={fontAwesomeIcon}
                ><Tooltip permanent>{soilProfile["name"]}</Tooltip>
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
            ))
            }
        </MapContainer >
    );
};

export const LocationFieldAreas = ({ rowClick, areas }) => {
    const redirect = useRedirect();
    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            // Use the bounds of all areas to set the bounds of the map
            bounds={areas.map((area) => area["geom"]["coordinates"])}
            scrollWheelZoom={true} >
            <BaseLayers />
            {
                areas.map(
                    (area, index) => (
                        < Polygon
                            key={index}
                            eventHandlers={{
                                click: () => {
                                    redirect('show', 'areas', area['id']);
                                }
                            }}
                            positions={area["geom"]['coordinates']}
                        >
                            <Tooltip permanent>{area.name}</Tooltip>


                        </Polygon>
                    )

                )
            }
        </MapContainer >
    );
};
