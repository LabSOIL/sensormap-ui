import {
    Show,
    SimpleShowLayout,
    TextField,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    DateField,
    ReferenceField,
    Labeled,
    FunctionField,
    ArrayField,
    Datagrid,
    SingleFieldList,
    SimpleList,
} from "react-admin";
import { LocationFieldPoints } from '../maps/Points';
import { Grid, Typography } from '@mui/material';


const SoilProfileShowTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} Soil Profile: {record.name}</span>;
};

const SoilProfileShowActions = () => {
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

const ImageField = ({ source }) => {
    const record = useRecordContext();
    if (!record) {
        return <Loading />;
    }

    if (!record[source]) {

        return <>
            <br />
            <Typography align="center">No image available</Typography>
        </>;
    }
    const base64Image = record[source];
    return (
        <div style={{ textAlign: 'center', margin: '0 10px' }}>
            <img src={`${base64Image}`} style={{ maxWidth: '80%', height: 'auto' }} />
        </div>
    );
};
export const SoilProfileShow = () => {
    const postRowSx = (record, index) => ({
        whiteSpace: "pre-wrap"
    });
    return (
        <Show title={<SoilProfileShowTitle />} actions={<SoilProfileShowActions />}>
            <SimpleShowLayout >
                <Grid container>
                    <Grid item xs={4} textAlign="left">
                        <FunctionField render={record => `${record.name}: `} variant="h5" gutterBottom label={null} />
                        <ReferenceField source="area_id" reference="areas" link="show">
                            <TextField source="name" variant="h5" />
                        </ReferenceField>{" "}
                        <TextField source="gradient" variant="h5" />
                    </Grid>
                    <Grid item xs={4} textAlign="center">
                        <ReferenceField source="soil_type_id" reference="soil_types" link="show">
                            <TextField source="name" variant="h5"
                            />
                        </ReferenceField>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                        <DateField
                            source="created_on"
                            variant="h5"
                            gutterBottom
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <Labeled>
                            <FunctionField render={record => `${record.coord_x}, ${record.coord_y}`} label="X, Y Coordinates (m)" />
                            {/* <TextField source="coord_x" /> */}
                        </Labeled >
                    </Grid>
                    <Grid item xs={2}>
                        <Labeled><TextField source="vegetation_type" /></Labeled >

                    </Grid>
                    <Grid item xs={2}>
                        <Labeled><TextField source="aspect" /></Labeled >
                    </Grid>
                    <Grid item xs={2}>
                        <Labeled><TextField source="parent_material" /></Labeled >
                    </Grid>
                    <Grid item xs={2}>
                        <Labeled><TextField source="topography" /></Labeled >
                    </Grid>
                    <Grid item xs={2}>
                        <Labeled><DateField source="last_updated" showTime /></Labeled>
                    </Grid>
                    <Grid item xs={4}>
                        <Labeled><TextField source="coord_z" label="Elevation (m)" /></Labeled >
                    </Grid>
                </Grid>

                <ColoredLine color="grey" height={2} />
                <Grid container>
                    <Grid item xs={6}>
                        <Typography variant="h6" textAlign="center" gutterBottom>Horizon description</Typography>
                        <ArrayField source="description_horizon">
                            {/* <Datagrid> */}
                            <SimpleList
                                primaryText={record => record.title}
                                secondaryText={record => record.description}
                                rowSx={postRowSx}
                                linkType={false}
                                multiline
                            />
                        </ArrayField>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6" textAlign="center" gutterBottom>Illustrations</Typography>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                            <div style={{ textAlign: 'center', margin: '0 10px' }}>
                                <h2>Soil diagram</h2>
                                <ImageField source="soil_diagram" />
                            </div>
                            <div style={{ width: '20%' }}></div>
                            <div style={{ textAlign: 'center', margin: '0 10px' }}>
                                <h2>Photo</h2>
                                <ImageField source="photo" />
                            </div>
                        </div>

                    </Grid>

                </Grid>
            </SimpleShowLayout>
        </Show >
    )
};

export default SoilProfileShow;
