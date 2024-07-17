import {
    List,
    Datagrid,
    TextField,
    DateField,
} from "react-admin";


export const InstrumentList = () => {
    return (
        <List storeKey={false} >
            <Datagrid rowClick="show">
                <TextField source="filename" />
                <TextField source="name" />
                <TextField source="description" />
                <DateField source="last_updated" showTime />
            </Datagrid>
        </List >
    );
};

export default InstrumentList;
