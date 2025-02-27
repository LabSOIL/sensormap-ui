import {
    useRecordContext,
    useRedirect,
    useNotify,
} from "react-admin";
import { IconButton } from '@mui/material';
import plots from '../plots';
import soil from '../soil';
import sensors from '../sensors';


export const CreatePlotButton = (label) => {
    const record = useRecordContext();
    const redirect = useRedirect();
    const notify = useNotify();

    return <IconButton
        color="success"
        title="Create plot"
        onClick={(event) => {
            if (navigator.clipboard) {
                const clipboardText = `${record.name}: ${record.comment}`;
                navigator.clipboard.writeText(clipboardText).then(() => {
                    notify(`Copied "${clipboardText}" to clipboard`);
                });
            }
            redirect('create', 'plots', null, {}, {
                record: {
                    name: record.name,
                    coord_x: record.coord_x,
                    coord_y: record.coord_y,
                    coord_z: record.elevation_gps,
                    created_on: new Date(record.time).toISOString().slice(0, 10)  // No time
                }
            })
            event.stopPropagation();
        }}
    >
        <plots.plot.icon />
    </IconButton >;
};

export const CreateSoilProfileButton = () => {
    const record = useRecordContext();
    const redirect = useRedirect();
    const notify = useNotify();

    return <IconButton
        color="success"
        title="Create soil profile"
        onClick={(event) => {
            if (navigator.clipboard) {
                const clipboardText = `${record.name}: ${record.comment}`;
                navigator.clipboard.writeText(clipboardText).then(() => {
                    notify(`Copied "${clipboardText}" to clipboard`);
                });
            }
            redirect('create', 'soil_profiles', null, {}, {
                record: {
                    coord_x: record.coord_x,
                    coord_y: record.coord_y,
                    coord_z: record.elevation_gps,
                    created_on: new Date(record.time).toISOString().slice(0, 10)  // No time
                }
            })
            event.stopPropagation();
        }}
    >
        <soil.profile.icon />
    </IconButton>;
};

export const CreateSensorButton = () => {
    const record = useRecordContext();
    const redirect = useRedirect();
    const notify = useNotify();

    return <IconButton
        color="success"
        title="Create sensor profile"
        onClick={(event) => {
            if (navigator.clipboard) {
                const clipboardText = `${record.name}: ${record.comment}`;
                navigator.clipboard.writeText(clipboardText).then(() => {
                    notify(`Copied "${clipboardText}" to clipboard`);
                });
            }
            redirect('create', 'sensor_profiles', null, {}, {
                record: {
                    coord_x: record.coord_x,
                    coord_y: record.coord_y,
                    coord_z: record.elevation_gps,
                    name: record.name,
                    description: record.comment,
                    created_on: new Date(record.time).toISOString().slice(0, 10)  // No time
                }
            })
            event.stopPropagation();
        }}
    >
        <sensors.sensor.icon />
    </IconButton>;
};