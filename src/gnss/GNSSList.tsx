import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    FunctionField,
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
                    <FunctionField source="coord_x" label="X (m)" render={record => record.coord_x.toFixed(2)} />
                    <FunctionField source="coord_y" label="Y (m)" render={record => record.coord_y.toFixed(2)} />
                    <CreatePlotButton label="Plot" />
                    <CreateSoilProfileButton label="Soil Profile" />
                    <CreateSensorButton label="Sensor" />
                </Datagrid>
            </List >
        </>
    );
};


export default GNSSList;
