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
    Button,
    useRedirect,
    ArrayField,
    Datagrid,
} from "react-admin";
import Plot from 'react-plotly.js';
import { Box } from '@mui/system';

const InstrumentChannelShowActions = () => {
    const { permissions } = usePermissions();
    const redirect = useRedirect();
    const record = useRecordContext();

    if (!record || !record.id) {
        return null;
    };
    const handleReturn = () => {
        redirect('show', 'instruments', record.experiment.id);
    };
    const handleRedirectToIntegrate = () => {
        redirect(`/instrument_channels/${record.id}/integrate`);
    };

    return (
        <TopToolbar>
            <Button variant="contained" onClick={handleReturn}>Return to Experiment</Button>
            {permissions === 'admin' && <>
                <EditButton label="Edit baseline" icon={false} variant='contained' color="success" />
                <Button onClick={handleRedirectToIntegrate} variant="contained" color="success">Integrate</Button>
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
                // Put the integral shaded areas on the plot
                ...record.integral_chosen_pairs.map((pair, index) => (
                    pair.end ? {
                        x: [pair.start.x, pair.end.x, pair.end.x, pair.start.x],
                        y: [Math.min(...record.baseline_values), Math.min(...record.baseline_values), Math.max(...record.baseline_values), Math.max(...record.baseline_values)],
                        type: 'scatter',
                        fill: 'toself',
                        fillcolor: 'rgba(0, 0, 255, 0.2)',
                        line: { width: 0 },
                        name: pair.sample_name,
                    } : null
                )).filter(Boolean),
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
                }}
                config={{
                    toImageButtonOptions: {
                        format: 'png', // one of png, svg, jpeg, webp
                        filename: `channel_${record.channel_name}_plot`,
                        height: 800,
                        width: 2000,
                        scale: 8 // Multiply title/legend/axis/canvas sizes by this factor

                    }
                }}
            />
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
            <ArrayField source="integral_results">
                <Datagrid>
                    <TextField source="start" />
                    <TextField source="end" />
                    <TextField source="area" label="Electrons Transferred [mol]" />
                    <TextField source="sample_name" />
                </Datagrid>
            </ArrayField>

        </SimpleShowLayout>
    </Show >
);

export default InstrumentChannelShow;
