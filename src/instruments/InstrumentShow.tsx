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
    BooleanField,
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

const ChannelList = () => {
    const BooleanFieldFromList = () => {
        const record = useRecordContext();
        if (!record) {
            return null;
        }
        const baseline_values = record.baseline_values.length > 0;

        return <BooleanField
            label="Baseline adjusted"
            source="baseline_values"
            record={{ baseline_values }}
        />;
    };
    BooleanFieldFromList.defaultProps = { label: "Baseline Adjusted" };

    const BooleanIntegralResults = () => {
        const record = useRecordContext();
        if (!record) {
            return null;
        }
        const integral_results = record.integral_results.length > 0;

        return <BooleanField
            label="Integral calculated"
            source="integral_results"
            record={{ integral_results }}
        />;
    }
    BooleanIntegralResults.defaultProps = { label: "Integrals Calculated" };

    const redirect = useRedirect();
    const handleRowClick = (record) => {
        if (!record) return;
        redirect('show', 'instrument_channels', record);
    };

    const record = useRecordContext();
    if (!record) {
        return <Loading />;
    }
    // Sort the channels list by name
    record.channels.sort((a, b) => a.channel_name.localeCompare(b.channel_name));

    return (
        <ArrayField source="channels">
            <Datagrid
                rowClick={handleRowClick}
                bulkActionButtons={false}
            >
                <TextField source="channel_name" sortable={false} />
                <BooleanFieldFromList />
                <BooleanIntegralResults />
            </Datagrid>
        </ArrayField>
    );
}

export const InstrumentShow = () => {
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
                        <ChannelList />
                    </TabbedShowLayout.Tab>
                </TabbedShowLayout>
            </SimpleShowLayout>
        </Show >
    )
};

export default InstrumentShow;
