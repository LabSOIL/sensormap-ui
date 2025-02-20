import {
    useGetOne,
    Loading,
    useNotify,
    useRecordContext,
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
import { BaseLayers } from './Layers';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import Legend from './Legend'; // Import the Legend component
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import proj4 from 'proj4';

const DEFAULT_ZOOM_LEVEL = 15;

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
const calculateCentroid = (polygon) => {
    let totalArea = 0;
    let centroidX = 0;
    let centroidY = 0;

    for (let i = 0; i < polygon.length - 1; i++) {
        const x0 = polygon[i][0];
        const y0 = polygon[i][1];
        const x1 = polygon[i + 1][0];
        const y1 = polygon[i + 1][1];
        const area = (x0 * y1 - x1 * y0);
        totalArea += area;
        centroidX += (x0 + x1) * area;
        centroidY += (y0 + y1) * area;
    }

    totalArea *= 0.5;
    centroidX /= (6 * totalArea);
    centroidY /= (6 * totalArea);

    return { lat: centroidX, lng: centroidY };
};

export const TransectCreateMap = ({ area_id }) => {
    const { setValue, getValues, watch } = useFormContext();
    const notify = useNotify();
    const { data: record, isLoading, error } = useGetOne(
        'areas', { id: area_id }
    );
    if (isLoading) return <Loading />;

    if (record.plots.length === 0) {
        notify('No plots available. Choose another area.');
    }

    const flippedPolygonCoordinates = flipPolygonCoordinates(record.geom.coordinates);
    const polygonCentroid = calculateCentroid(flippedPolygonCoordinates[0]);

    // Define state variables
    const [polygonCoordinates, setPolygonCoordinates] = useState(flippedPolygonCoordinates);
    const [plots, setPlots] = useState(record.plots);
    const [mapCenter, setMapCenter] = useState({
        lat: polygonCentroid.lat,
        lng: polygonCentroid.lng,
        zoomLevel: DEFAULT_ZOOM_LEVEL
    });
    const [updateMap, setUpdateMap] = useState(false);
    const [nodePolyLine, setNodePolyLine] = useState(null);

    // If the user changes the area, zoom to new area and remove chosen nodes
    useEffect(() => {
        if (!record || !record.plots || !record.geom || record.plots.length === 0) return;
        setPlots(record.plots);
        const coords = flipPolygonCoordinates(record.geom.coordinates);
        const centroid = calculateCentroid(coords[0]);
        // Define state variables
        setPolygonCoordinates(coords);
        setMapCenter({
            lat: centroid.lat,
            lng: centroid.lng,
            zoomLevel: DEFAULT_ZOOM_LEVEL
        });
        setUpdateMap(true);
        clearNodes();
    }, [record]);

    const MapRecenter = () => {
        // Takes control of moving the map to the new coordinates
        // component state of setUpdateMap is used to prevent an infinite loop
        const map = useMap();
        if (!mapCenter || !map) return;

        useEffect(() => {
            // Only fly to center if updating is permitted by variable
            const { lat, lng, zoomLevel } = mapCenter;
            if (updateMap) {
                map.flyTo([lat, lng], zoomLevel);
                setUpdateMap(false);
            }
        }, [record, updateMap]);

        return null;
    };


    const addNode = (plot) => {
        // Adds a node to the form context state
        const newNodes = [...getValues('nodes'), plot];

        setValue('nodes', newNodes);
    }

    const clearNodes = () => {
        // Clears all nodes from the form context state
        setValue('nodes', []);
        setNodePolyLine(null);
    };

    useEffect(() => {
        if (record.plots.length > 0 && getValues('nodes').length > 1) {
            setNodePolyLine(getValues('nodes').map(
                node => [node["latitude"], node["longitude"]]
            ));
        }
    }, [watch('nodes')]);

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
                {plots && plots.length > 0 ? plots.map((plot, index) => {
                    return (
                        <Marker
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
                {record.transects.map((transect, index) => (
                    <>
                        <Polyline
                            key={index}
                            positions={
                                transect.nodes.map(node => [node.latitude, node.longitude])
                            }
                            color="black"
                            weight={5}
                        />

                    </>
                ))}
            </MarkerClusterGroup>
            {nodePolyLine && <Polyline positions={nodePolyLine} pathOptions={{ color: 'red' }} />}
            <MapRecenter />
            <Legend />
        </MapContainer>
    );
};
export const TransectShowMap = () => {
    const record = useRecordContext();

    if (!record) {
        return <Loading />;
    }

    // Convert coordinates to lat/lon
    const nodePolyLine = record.nodes.map(node => {
        // Define the projection for the coordinates
        return proj4(`EPSG:${node.coord_srid}`, 'EPSG:4326', [node.coord_x, node.coord_y]).reverse();
    });

    // Get map bounds from the bounding box of all nodes in the record
    const mapBounds = record.nodes.reduce((acc, node) => {
        return acc.extend(proj4(`EPSG:${node.coord_srid}`, 'EPSG:4326', [node.coord_x, node.coord_y]).reverse());
    }, L.latLngBounds());

    // We want a similar map to create, but just the plots from the record now
    // instead as it is resembling a show view

    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
            bounds={mapBounds}
            scrollWheelZoom={true}
            maxZoom={20}
        >
            <BaseLayers />

            {record.nodes && record.nodes.length > 0 ? record.nodes.map((plot, index) => {
                const sourceProj = `EPSG:${plot.coord_srid}`;
                const destProj = 'EPSG:4326';
                const [lon, lat] = proj4(sourceProj, destProj, [plot.coord_x, plot.coord_y]);
                return (
                    <Marker
                        key={index}
                        position={[lat, lon]}
                        icon={plotIcon}
                    >
                        <Tooltip permanent>{plot["name"]}</Tooltip>
                        <Popup>
                            <b>{plot["name"]}</b>
                        </Popup>
                    </Marker>
                )
            }) : null}

            {nodePolyLine && <Polyline positions={nodePolyLine} pathOptions={{ color: 'black' }} />}
            <Legend />
        </MapContainer>
    )
};

export default TransectCreateMap;