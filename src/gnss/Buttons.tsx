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
                    coord_x: record.x,
                    coord_y: record.y,
                    coord_z: record.elevation_gps,
                    created_on: record.time
                }
            })
            event.stopPropagation();
        }}
    >
        <plots.plot.icon />
    </IconButton>;
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
                    coord_x: record.x,
                    coord_y: record.y,
                    coord_z: record.elevation_gps,
                    created_on: record.time
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
        title="Create sensor"
        onClick={(event) => {
            if (navigator.clipboard) {
                const clipboardText = `${record.name}: ${record.comment}`;
                navigator.clipboard.writeText(clipboardText).then(() => {
                    notify(`Copied "${clipboardText}" to clipboard`);
                });
            }
            redirect('create', 'sensors', null, {}, {
                record: {
                    coord_x: record.x,
                    coord_y: record.y,
                    coord_z: record.elevation_gps,
                    name: record.name,
                    description: record.comment,
                    created_on: record.time
                }
            })
            event.stopPropagation();
        }}
    >
        <sensors.sensor.icon />
    </IconButton>;
};