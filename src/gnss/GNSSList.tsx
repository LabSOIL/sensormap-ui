import {
    List,
    Datagrid,
    TextField,
    DateField,
} from "react-admin";
import {
    CreatePlotButton,
    CreateSoilProfileButton,
    CreateSensorButton,
} from "./Buttons";
import { postFilters } from "../filters/list";

export const GNSSList = () => {
    return (
        <>
            <List storeKey={false} filters={postFilters}
            >
                <Datagrid rowClick="show" sx={{
                    '& .column-undefined': { width: 15 }, // Icon columns
                    '& .column-time': { width: 200 },
                }}>
                    <DateField source="time" label="Time (UTC)" showTime />
                    <TextField source="name" />
                    <TextField source="comment" />
                    <TextField source="original_filename" />
                    <CreatePlotButton label="Plot" />
                    <CreateSoilProfileButton label="Soil Profile" />
                    <CreateSensorButton label="Sensor" />
                </Datagrid>
            </List >
        </>
    );
};


export default GNSSList;
