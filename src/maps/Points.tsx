import { useRecordContext, useRedirect, Show, SimpleShowLayout, TextField, useGetManyReference, useCreatePath, useEffect } from 'react-admin';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip, useMap } from 'react-leaflet';
import { CRS } from 'leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { BaseLayers } from './Layers';

export const LocationFieldPoints = ({ source }) => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const { data, isLoading, error } = useGetManyReference(
        'sensors',
        {
            target: 'area_id',
            id: record.id,
        }
    );

    if (!record) return null;
    if (!data) return null;


    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            bounds={record["geom"]["coordinates"]}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            {isLoading ? null :
                (
                    data.map((sensor, index) => (
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
                                    Go to Sensor</Link>

                            </Popup>
                        </Marker>
                    ))
                )}
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
