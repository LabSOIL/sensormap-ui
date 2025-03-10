import {
    List,
    Datagrid,
    TextField,
    DateField,
    FunctionField,
    useRecordContext,
} from "react-admin";

const SampleListPanel = () => {
    // Get the samples from the integral results such that it can be used in a
    // dot point list * <channel name> : <concatenated list of samples>
    const record = useRecordContext();
    if (!record) {
        return null;
    }
    let samples = [];
    record.channels.forEach(channel => {
        let sampleList = "";
        channel.integral_results.forEach(integral => {
            sampleList += integral.sample_name + ", ";
        });
        samples.push({ channel: channel.channel_name, samples: sampleList.slice(0, -2) });
    });

    // Sort list by channel name
    samples.sort((a, b) => a.channel.localeCompare(b.channel));

    return (
        <div>
            <h1>Channels: Samples</h1>
            <ul>
                {samples.map((sample, index) => {
                    return <li key={index}>{sample.channel}: {sample.samples}</li>
                }
                )}
            </ul>

        </div>
    );
}

export const InstrumentList = () => {
    const channelSamples = (record) => {
        // For each channel, get the sample for each integral result and return the total number
        let totalSamples = 0;
        record.channels.forEach(channel => {
            totalSamples += channel.integral_results.length;
        });
        return totalSamples;
    }

    return (
        <List storeKey={false} >
            <Datagrid rowClick="show" expand={<SampleListPanel />}>
                <TextField source="filename" />
                <TextField source="name" />
                <TextField source="description" />
                <TextField source="project.name" label="Project" />
                <DateField source="last_updated" showTime />
                <FunctionField label="Channels (filtered/total)" render={record => `${record.channel_qty_filled}/${record.channels.length}`} />
                <FunctionField label="Total samples" render={channelSamples} />
            </Datagrid>
        </List >
    );
};

export default InstrumentList;
