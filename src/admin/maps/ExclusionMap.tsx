import {
    useGetOne,
    useGetList,
    useCreate,
    useDelete,
    Loading,
} from 'react-admin';
import {
    MapContainer,
    Marker,
    Popup,
    Polygon,
    Tooltip,
} from 'react-leaflet';
import { BaseLayers } from './Layers';
import * as L from 'leaflet';
import { Typography } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';
import proj4 from 'proj4';

const plotIncludedIcon = L.AwesomeMarkers.icon({
    icon: 'trowel',
    iconColor: 'black',
    prefix: 'fa',
    markerColor: 'green',
});

const plotExcludedIcon = L.AwesomeMarkers.icon({
    icon: 'ban',
    iconColor: 'white',
    prefix: 'fa',
    markerColor: 'gray',
});

const sensorIncludedIcon = L.AwesomeMarkers.icon({
    icon: 'temperature-low',
    iconColor: 'yellow',
    prefix: 'fa',
    markerColor: 'blue',
});

const sensorExcludedIcon = L.AwesomeMarkers.icon({
    icon: 'ban',
    iconColor: 'white',
    prefix: 'fa',
    markerColor: 'gray',
});

interface ExclusionMapProps {
    websiteId: string;
    areaId: string;
}

const ExclusionMap = ({ websiteId, areaId }: ExclusionMapProps) => {
    const { data: area, isLoading: areaLoading } = useGetOne('areas', { id: areaId });
    const {
        data: plotExclusions,
        isLoading: plotExLoading,
        refetch: refetchPlotEx,
    } = useGetList('website_plot_exclusions', {
        filter: { website_id: websiteId },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'id', order: 'ASC' },
    });
    const {
        data: sensorExclusions,
        isLoading: sensorExLoading,
        refetch: refetchSensorEx,
    } = useGetList('website_sensor_exclusions', {
        filter: { website_id: websiteId },
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'id', order: 'ASC' },
    });
    const [create] = useCreate();
    const [deleteOne] = useDelete();

    if (areaLoading || plotExLoading || sensorExLoading) return <Loading />;
    if (!area || !area.geom || !area.geom.coordinates) {
        return <Typography variant="body2">No location data available for this area.</Typography>;
    }

    const flipCoordinates = (coords: number[][]) => coords.map(coord => [coord[1], coord[0]]);
    const flipPolygonCoordinates = (polygon: number[][][]) => polygon.map(ring => flipCoordinates(ring));
    const polygonCoordinates = flipPolygonCoordinates(area.geom.coordinates);

    const excludedPlotIds = new Set((plotExclusions || []).map(ex => ex.plot_id));
    const excludedSensorIds = new Set((sensorExclusions || []).map(ex => ex.sensorprofile_id));

    const getPlotExclusionId = (plotId: string) => {
        const ex = (plotExclusions || []).find(e => e.plot_id === plotId);
        return ex ? ex.id : null;
    };

    const getSensorExclusionId = (sensorId: string) => {
        const ex = (sensorExclusions || []).find(e => e.sensorprofile_id === sensorId);
        return ex ? ex.id : null;
    };

    const handlePlotClick = (plotId: string) => {
        if (excludedPlotIds.has(plotId)) {
            const exclusionId = getPlotExclusionId(plotId);
            if (exclusionId) {
                deleteOne('website_plot_exclusions', { id: exclusionId }, {
                    onSuccess: () => { refetchPlotEx(); },
                });
            }
        } else {
            create('website_plot_exclusions', { data: { website_id: websiteId, plot_id: plotId } }, {
                onSuccess: () => { refetchPlotEx(); },
            });
        }
    };

    const handleSensorClick = (sensorId: string) => {
        if (excludedSensorIds.has(sensorId)) {
            const exclusionId = getSensorExclusionId(sensorId);
            if (exclusionId) {
                deleteOne('website_sensor_exclusions', { id: exclusionId }, {
                    onSuccess: () => { refetchSensorEx(); },
                });
            }
        } else {
            create('website_sensor_exclusions', { data: { website_id: websiteId, sensorprofile_id: sensorId } }, {
                onSuccess: () => { refetchSensorEx(); },
            });
        }
    };

    return (
        <MapContainer
            style={{ width: '100%', height: '400px' }}
            bounds={polygonCoordinates}
            scrollWheelZoom={true}
            maxZoom={20}
        >
            <Polygon
                positions={polygonCoordinates}
                pathOptions={{ color: area.project.color, opacity: 1, fillOpacity: 0.2 }}
                interactive={false}
            />
            {(area.plots || []).map((plot) => {
                const isExcluded = excludedPlotIds.has(plot.id);
                return (
                    <Marker
                        key={`plot-${plot.id}`}
                        position={proj4(`EPSG:${plot.coord_srid}`, 'EPSG:4326', [plot.coord_x, plot.coord_y]).reverse()}
                        icon={isExcluded ? plotExcludedIcon : plotIncludedIcon}
                        eventHandlers={{ click: () => handlePlotClick(plot.id) }}
                    >
                        <Tooltip permanent>{plot.name}</Tooltip>
                        <Popup>
                            <b>{plot.name}</b>
                            <br />
                            {plot.description}
                            <br /><br />
                            <b>Status:</b> {isExcluded ? 'Excluded' : 'Included'}
                            <br />
                            <em>Click marker to {isExcluded ? 'include' : 'exclude'}</em>
                        </Popup>
                    </Marker>
                );
            })}
            {(area.sensor_profiles || []).map((sensor) => {
                const isExcluded = excludedSensorIds.has(sensor.id);
                return (
                    <Marker
                        key={`sensor-${sensor.id}`}
                        position={proj4(`EPSG:${sensor.coord_srid}`, 'EPSG:4326', [sensor.coord_x, sensor.coord_y]).reverse()}
                        icon={isExcluded ? sensorExcludedIcon : sensorIncludedIcon}
                        eventHandlers={{ click: () => handleSensorClick(sensor.id) }}
                    >
                        <Tooltip permanent>{sensor.name}</Tooltip>
                        <Popup>
                            <b>{sensor.name}</b>
                            <br />
                            {sensor.description}
                            <br /><br />
                            <b>Status:</b> {isExcluded ? 'Excluded' : 'Included'}
                            <br />
                            <em>Click marker to {isExcluded ? 'include' : 'exclude'}</em>
                        </Popup>
                    </Marker>
                );
            })}
            <BaseLayers />
        </MapContainer>
    );
};

export default ExclusionMap;
