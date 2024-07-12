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
    DateField,
    TabbedShowLayout,
    Labeled,
    NumberField,
    ArrayField,
    Datagrid,
} from "react-admin";
import Plot from 'react-plotly.js';
import { Grid, Typography } from '@mui/material';
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

    // Create a line plot using record.data.x and record.data.y
    return (
        <div><Box>
            <Plot data={[{
                x: record.time_values,
                y: record.raw_values,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'red' },
            }]} layout={{
                width: 800,
                title: record.channel_name,
                xaxis: { title: "Time" },
                yaxis: { title: "Value" }
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
