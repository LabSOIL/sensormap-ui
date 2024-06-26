import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    useRecordContext,
    useRedirect,
} from "react-admin";
import { IconButton } from '@mui/material';
import plots from '../plots';
import soil from '../soil';


const CreatePlotButton = () => {
    const record = useRecordContext();
    const redirect = useRedirect();

    return <IconButton
        color="success"
        title="Create plot"
        onClick={(event) => {
            redirect('create', 'plots', null, {}, {
                record: {
                    coord_x: record.latitude,
                    coord_y: record.longitude
                }
            })
            event.stopPropagation();
        }}
    >
        <plots.plot.icon />
    </IconButton>;
};

const CreateSoilProfileButton = () => {
    const record = useRecordContext();
    const redirect = useRedirect();

    return <IconButton
        color="success"
        title="Create soil profile"
        onClick={(event) => {
            redirect('create', 'soil_profiles', null, {}, {
                record: {
                    coord_x: record.latitude,
                    coord_y: record.longitude
                }
            })
            event.stopPropagation();
        }}
    >
        <soil.profile.icon />
    </IconButton>;
};
export const GNSSList = () => {
    return (
        <>
            <List storeKey={false}>
                <Datagrid rowClick="show">
                    <DateField source="time" label="Time (UTC)" showTime />
                    <TextField source="name" />
                    <NumberField source="latitude" />
                    <NumberField source="longitude" />
                    <NumberField source="elevation_gps" />
                    <TextField source="comment" />
                    <TextField source="original_filename" />
                    <CreatePlotButton />
                    <CreateSoilProfileButton />
                </Datagrid>
            </List >
        </>
    );
};



export default GNSSList;
