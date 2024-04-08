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
} from "react-admin";
import { LocationFieldPoints } from '../maps/Points';


const SoilProfileTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} SoilProfile</span>;
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

export const SoilProfileShow = () => (
    <Show title={<SoilProfileTitle />} actions={<SoilProfileShowActions />}>
        <SimpleShowLayout>
            <TextField source="name" />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <div style={{ textAlign: 'center', margin: '0 10px' }}>
                    <h2>Soil diagram</h2>
                    <img src="https://picsum.photos/200/300" alt="placeholder" />
                </div>
                <div style={{ width: '20%' }}></div>
                <div style={{ textAlign: 'center', margin: '0 10px' }}>
                    <h2>Photo</h2>
                    <img src="https://picsum.photos/200/300" alt="placeholder" />
                </div>
            </div>

            <TextField source="description" label="Horizon description" component="pre" />
            <ReferenceField source="soil_type_id" reference="soil_types" link="show">
                <TextField source="name" />
            </ReferenceField>
            <TextField source="location" />
            <TextField source="weather" />
            <TextField source="topography" />
            <DateField source="date_created" />
        </SimpleShowLayout>
    </Show>
);

export default SoilProfileShow;
