import {
    Show,
    SimpleShowLayout,
    TextField,
    ReferenceManyCount,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    DateField,
    ReferenceField,
    NumberField,
    FunctionField,
} from "react-admin";
import { LocationFieldPoints } from '../maps/Points';


const PlotShowTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} SoilProfile</span>;
};

const PlotShowActions = () => {
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

export const PlotShow = () => (
    <Show title={<PlotShowTitle />} actions={<PlotShowActions />}>
        <SimpleShowLayout >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center', margin: '0 10px' }}>
                    <h2>Soil diagram</h2>
                    <img src="https://picsum.photos/300/450" alt="placeholder" />
                </div>
                <div style={{ width: '20%' }}></div>
                <div style={{ textAlign: 'center', margin: '0 10px' }}>
                    <h2>Photo</h2>
                    <img src="https://picsum.photos/300/450" alt="placeholder" />
                </div>
            </div>

            <TextField source="name" />
            <ReferenceField source="soil_type_id" reference="soil_types" link="show">
                <TextField source="name" />
            </ReferenceField>
            <TextField source="description_horizon" label="Horizon description" component="pre" />
            <FunctionField
                label="Coordinates"
                render={record => `${record.coord_x}, ${record.coord_y} (SRID: ${record.coord_srid})`}
            />
            <TextField source="coord_z" label="Elevation (m)" />
            <DateField source="date_created" label="Description Date" />
            <TextField source="vegetation_type" label="Vegetation Type" />
            <TextField source="topography" label="Topography" />
            <TextField source="aspect" label="Aspect (°)" />
            <TextField source="slope" label="Slope (°)" />
            <TextField source="weather" />
            <TextField source="lythology_surficial_deposit" label="Lythology/Surficial deposit" />
        </SimpleShowLayout>
    </Show>
);

export default PlotShow;
