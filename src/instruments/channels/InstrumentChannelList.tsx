import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceField,
    FunctionField,
} from "react-admin";


export const InstrumentChannelList = () => {
    return (
        <List storeKey={false}>
            <Datagrid rowClick="show">
                <TextField source="channel_name" />
                <ReferenceField source="experiment_id" reference="instruments">
                    <FunctionField render={record => `${record.filename} (${record.name})`} />
                </ReferenceField>
                <TextField source="description" />
                <FunctionField label="Baseline Points" render={record => record.baseline_points.length} />
                <DateField source="last_updated" showTime />
            </Datagrid>
        </List >
    );
};

export default InstrumentChannelList;
