import {
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    FunctionField,
    Loading,
} from "react-admin";
import Plot from 'react-plotly.js';
import { Box } from '@mui/system';

const InstrumentChannelShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <>
                <EditButton />
                <DeleteButton />
            </>}
        </TopToolbar>
    );
}
const ColoredLine = ({ color, height }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: height
        }}
    />
);

const LinePlotShow = () => {
    const record = useRecordContext();
    if (!record) {
        return <Loading />;
    }

    return (
        <div><Box>
            <Plot data={[
                {
                    x: record.time_values,
                    y: record.raw_values,
                    type: 'scattergl',
                    mode: 'lines+markers',
                    marker: { color: 'red' },
                    name: 'Raw Data',
                },
                {
                    x: record.baseline_chosen_points.map(point => point.x),
                    y: record.baseline_chosen_points.map(point => point.y),
                    type: 'scattergl',
                    mode: 'markers',
                    marker: { color: '#2F4F4F', size: 10, opacity: 0.8 },
                    name: 'Selected Points',
                },
                // Also the baseline_values
                {
                    x: record.time_values,
                    y: record.baseline_values,
                    type: 'scattergl',
                    mode: 'lines',
                    marker: { color: 'blue' },
                    name: 'Filtered baseline',
                },
                // Set width of plot
            ]}
                layout={{
                    width: 1000,
                    height: 400,
                    title: record.channel_name,
                    xaxis: {
                        title: 'Time',
                    },
                    yaxis: {
                        title: 'Value',
                    },
                }} />
        </Box></div>
    );
}

export const InstrumentChannelShow = () => (
    <Show actions={<InstrumentChannelShowActions />}>
        <SimpleShowLayout >
            <TextField source="experiment.name" />
            <TextField source="experiment.description" />
            <TextField source="experiment.filename" />
            <TextField source="experiment.last_updated" />
            <TextField source="channel_name" />
            <FunctionField label="Number of values" render={record => record.raw_values.length} />
            <ColoredLine color="grey" height={2} />
            <LinePlotShow />

        </SimpleShowLayout>
    </Show >
);

export default InstrumentChannelShow;
