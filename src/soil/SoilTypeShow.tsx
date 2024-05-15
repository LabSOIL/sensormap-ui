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
} from "react-admin";


const SoilTypeTitle = () => {
    const record = useRecordContext();
    // the record can be empty while loading
    if (!record) return null;
    return <span>{record.place} SoilType</span>;
};

const SoilTypeShowActions = () => {
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

export const SoilTypeShow = () => (
    <Show title={<SoilTypeTitle />} actions={<SoilTypeShowActions />}>
        <SimpleShowLayout>
            <TextField source="name" />
            <TextField source="description" />
            <DateField source="last_updated" showTime/>
            <ReferenceManyCount
                label="Soil Profiles"
                reference="soil_profiles"
                target="soil_type_id"
                link
            />
        </SimpleShowLayout>
    </Show>
);

export default SoilTypeShow;
