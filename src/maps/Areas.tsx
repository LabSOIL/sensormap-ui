import {
    useRedirect,
    useGetList,
    Button,
    Link,
    useCreatePath,
    Loading,
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
import { Typography } from '@mui/material';


export const LocationFieldAreas = () => {
    const redirect = useRedirect();
    const createPath = useCreatePath();

    const { data: areas, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <Loading />;
    if (!areas) return null;


    if (areas.length === 0) {
        return <Typography variant="body1">No areas found</Typography>;
    }
    // If there are no geometry coordinates, we can't display the area. There
    // needs to be at least one area record with valid geom to display the map.
    // Otherwise return a message
    console.log("Areas:", areas);
    if (!areas.some(area => area["geom"] && area["geom"]["coordinates"])) {
        return <Typography variant="body">Add records to an area to display the map</Typography>;
    }

    const flipCoordinates = (coords) => {
        console.log("Flip coordinates called:", coords);
        return coords.map(coord => [coord[1], coord[0]]);
    };

    const flipPolygonCoordinates = (polygon) => {
        console.log("flipPolygonCoordinates called:", polygon);
        return polygon.map(ring => flipCoordinates(ring));
    };
    const validAreas = areas.filter(area => area["geom"] && area["geom"]["coordinates"]);
    console.log("validAreas:", validAreas);
    const allCoordinates = validAreas.flatMap(area => flipPolygonCoordinates(area["geom"]["coordinates"])[0]);
    console.log("allCoordinates:", allCoordinates);
    const bounds = L.latLngBounds(allCoordinates).pad(0.6); // Padding the bounds to zoom out further
    console.log("Bounds:", bounds);


    return (
        <MapContainer
            style={{ width: '100%', height: '500px' }}
            // Set bounds to a wider area than the calculated bounds to allow for
            // the user to zoom out and see the whole area
            bounds={bounds}
            scrollWheelZoom={true}
        >
            <BaseLayers />
            {validAreas ? validAreas.map(
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
                : null
            }
        </MapContainer>
    );
};