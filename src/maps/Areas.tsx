import {
    useRedirect,
    useGetList,
    Button,
    Link,
    useCreatePath,
} from 'react-admin';
import {
    MapContainer,
    TileLayer,
    Polygon,
    Tooltip,
    FeatureGroup,

} from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import { BaseLayers } from './Layers';


export const LocationFieldAreas = ({ areas }) => {
    const redirect = useRedirect();
    const createPath = useCreatePath();
    if (areas.length === 0) {
        return null;
    }
    const flipCoordinates = (coords) => {
        return coords.map(coord => [coord[1], coord[0]]);
    };

    const flipPolygonCoordinates = (polygon) => {
        return polygon.map(ring => flipCoordinates(ring));
    };
    const validAreas = areas.filter(area => area["geom"] && area["geom"]["coordinates"]);

    return (
        <MapContainer
            style={{ width: '100%', height: '700px' }}
            bounds={validAreas.map((area) => flipPolygonCoordinates(area["geom"]["coordinates"])[0])}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            {
                validAreas.map(
                    (area, index) => (
                        <Polygon
                            key={index}
                            pathOptions={{ fillOpacity: 0.25, color: area.project.color }}
                            eventHandlers={{
                                click: () => {
                                    redirect('show', 'areas', area['id']);
                                }
                            }}
                            positions={flipPolygonCoordinates(area["geom"]['coordinates'])}
                        >
                            <Tooltip
                                permanent
                                interactive={true}
                            >
                                <Link to={createPath({ type: 'show', resource: 'areas', id: area['id'] })}>
                                    {area.name}
                                </Link>
                            </Tooltip>
                        </Polygon>
                    )
                )
            }
        </MapContainer>
    );
};