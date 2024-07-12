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
    useRedirect,
} from "react-admin";
import Plot from 'react-plotly.js';
import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';

const InstrumentShowActions = () => {
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
    if (!record || !record.data) {
        return <Loading />;
    }

    return (
        <div><Box>
            <Plot data={record.data.map((recordData, index) => {
                if (!recordData.data) {
                    return null;
                }
                const data = recordData.data;
                const channel = recordData.channel;

                const x = data.map(d => d.time);
                const y = data.map(d => d.value);

                return {
                    x: x,
                    y: y,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: `rgb(${index * 50}, ${index * 30}, ${index * 10})` },
                    name: channel
                };
            })}
                layout={{
                    width: 1400,
                    height: 600,
                    title: "Measurements",
                    showlegend: true,
                    legend: { orientation: "h" },
                    xaxis: { title: "Time" },
                    yaxis: { title: "Value" }
                }}
            />
        </Box>
            <Typography variant="caption" align="left">Note: The plot data is downsampled for performance reasons</Typography>
        </div>
    );
};

export const InstrumentShow = () => {
    const redirect = useRedirect();
    const handleRowClick = (record) => {
        console.log(record);
        if (!record) return;
        redirect('show', 'instrument_channels', record);
    }
    return (
        <Show actions={<InstrumentShowActions />}>
            <SimpleShowLayout >
                <TextField source="name" />
                <TextField source="description" />
                <DateField source="last_updated" showTime />
                <TextField source="filename" />
                <ColoredLine color="grey" height={2} />
                <TabbedShowLayout>
                    <TabbedShowLayout.Tab label="Channels">
                        <ArrayField source="channels">
                            <Datagrid rowClick={handleRowClick}>
                                <TextField source="channel_name" sortable={false} />
                                <NumberField source="data.length" label="Number of records" sortable={false} />
                            </Datagrid>
                        </ArrayField>
                    </TabbedShowLayout.Tab>
                </TabbedShowLayout>
            </SimpleShowLayout>
        </Show >
    )
};

export default InstrumentShow;
