import {
    useGetOne,
    Loading,
} from 'react-admin';
import {
    MapContainer,
    Marker,
    Popup,
    Polygon,
    Tooltip,
    useMap,
    Polyline,
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
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Layout } from 'react-admin';

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

const flipCoordinates = (coords) => {
    return coords.map(coord => [coord[1], coord[0]]);
};

const flipPolygonCoordinates = (polygon) => {
    return polygon.map(ring => flipCoordinates(ring));
};

export const TransectCreateMap = ({ area_id }) => {
    const { data: record, isLoading, error } = useGetOne(
        'areas', { id: area_id }
    );

    if (isLoading) return <Loading />;
    const formContext = useFormContext();


    if (record && !record.plots) {
        return (<><Typography variant="h6">No location data available</Typography><br />
            <Typography variant="caption">Map of points will show when data is assigned to Area</Typography></>)
    }

    const polygonCoordinates = flipPolygonCoordinates(record["geom"]["coordinates"]);
    const plotData = record.plots;
    const MapRecenter = ({ lat, lng, zoomLevel }) => {
        const map = useMap();

        useEffect(() => {
            // Fly to that coordinates and set new zoom level

            map.flyTo([lat, lng], zoomLevel);
        }, [record]);
        return null;
    };


    const addNode = (plot) => {
        const transectNodes = formContext.getValues('nodes') || [];
        const newNodes = [...transectNodes, plot];
        formContext.setValue('nodes', newNodes);
    }

    let transectNodes = formContext.getValues('nodes') || [];
    const [nodePolyLine, setNodePolyLine] = useState(null);

    useEffect(() => {
        if (transectNodes.length > 1) {
            const nodeCoords = transectNodes.map(node => [node["latitude"], node["longitude"]]);
            setNodePolyLine(<Polyline positions={nodeCoords} pathOptions={{ color: 'red' }} />);
        }
        transectNodes = formContext.getValues('nodes') || [];
    }, [transectNodes]);


    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
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
            <MarkerClusterGroup maxClusterRadius={40} chunkedLoading >

                {plotData ? plotData.map((plot, index) => {
                    return (
                        < Marker
                            key={index}
                            position={[plot["latitude"], plot["longitude"]]}
                            icon={plotIcon}
                            eventHandlers={{
                                click: (e) => {
                                    addNode(plot);
                                },
                            }}
                        >
                            <Tooltip permanent>{plot["name"]}</Tooltip>
                            <Popup>
                                <b>{plot["name"]}</b>
                            </Popup>
                        </Marker>
                    )
                }) : null}
            </MarkerClusterGroup>
            // Draw a polyline from all the nodes
            {nodePolyLine}
            <MapRecenter lat={polygonCoordinates[0][0][0]} lng={polygonCoordinates[0][0][1]} zoomLevel={15} />
            <Legend />
        </MapContainer>
    );
};

export default TransectCreateMap;