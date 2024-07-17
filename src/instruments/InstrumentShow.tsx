import {
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    Loading,
    DateField,
    TabbedShowLayout,
    NumberField,
    ArrayField,
    Datagrid,
    useRedirect,
    BooleanField,
    useDataProvider,
    downloadCSV,
    Button,
} from "react-admin";

const InstrumentShowActions = () => {
    const { permissions } = usePermissions();
    const record = useRecordContext();
    const dataProvider = useDataProvider();

    if (!record) {
        return null
    }

    const handleRawDataClick = () => {
        dataProvider.getInstrumentRawData('instruments', record)
            .then(response => {
                const headers = response.data[0];
                const data = response.data.slice(1);

                // Create CSV content manually
                let csvContent = headers.join(",") + "\n";
                data.forEach(row => {
                    csvContent += row.join(",") + "\n";
                });

                downloadCSV(csvContent, record.filename + '_raw.csv');
            })
            .catch(error => {
                console.error("Error getting raw data:", error);
            });
    };

    const handleBaselineFilteredDataClick = () => {
        dataProvider.getInstrumentBaselineFilteredData('instruments', record)
            .then(response => {
                const headers = response.data[0];
                const data = response.data.slice(1);

                // Create CSV content manually
                let csvContent = headers.join(",") + "\n";
                data.forEach(row => {
                    csvContent += row.join(",") + "\n";
                });

                downloadCSV(csvContent, record.filename + '_baseline_filtered.csv');
            })
            .catch(error => {
                console.error("Error getting baseline data:", error);
            });
    };

    const handleSummaryDataClick = () => {
        dataProvider.getInstrumentSummaryData('instruments', record)
            .then(response => {
                const headers = response.data[0];
                const data = response.data.slice(1);

                // Create CSV content manually
                let csvContent = headers.join(",") + "\n";
                data.forEach(row => {
                    csvContent += row.join(",") + "\n";
                });

                downloadCSV(csvContent, record.filename + '_summary.csv');
            })
            .catch(error => {
                console.error("Error getting summary data:", error);
            });
    }

    return (
        <TopToolbar>
            {permissions === 'admin' && <>
                <Button variant="contained" color="primary" onClick={handleRawDataClick}>Export raw data</Button>
                <Button variant="contained" color="primary" onClick={handleBaselineFilteredDataClick}>Export baseline filtered data</Button>
                <Button variant="contained" color="primary" onClick={handleSummaryDataClick}>Export summary data</Button>
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
const ExpandPanel = () => {
    const record = useRecordContext();
    if (!record) {
        return null;
    }
    return (
        <ArrayField source="integral_results">
            <Datagrid bulkActionButtons={false}>
                <TextField source="start" />
                <TextField source="end" />
                <TextField source="area" />
            </Datagrid>
        </ArrayField>
    )
};

const ChannelList = () => {
    const record = useRecordContext();
    if (!record) {
        return <Loading />;
    }

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
        const integral_results = record.integral_results.length;

        return <NumberField
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


    // Sort the channels list by name
    record.channels.sort((a, b) => a.channel_name.localeCompare(b.channel_name));


    return (
        <ArrayField source="channels">
            <Datagrid
                rowClick={handleRowClick}
                expand={<ExpandPanel />}
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
