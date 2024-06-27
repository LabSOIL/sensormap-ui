import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    NumberField,
} from "react-admin";

export const PlotShow = () => (
    <Show >
        <SimpleShowLayout >
            <DateField source="time" label="Time (UTC)" showTime />
            <TextField source="name" />
            <NumberField source="latitude" />
            <NumberField source="longitude" />
            <TextField source="x" label="X (SRID: 2056)" />
            <TextField source="y" label="Y (SRID: 2056)" />
            <NumberField source="elevation_gps" />
            <TextField source="comment" />
            <TextField source="original_filename" />
        </SimpleShowLayout>
    </Show >
);

export default PlotShow;
