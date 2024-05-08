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
    ReferenceField,
    ReferenceArrayField,
    SingleFieldList,
    ChipField,
    ReferenceManyField,
    useGetManyReference,
    Loading,
} from "react-admin";
import { LocationFieldPoints } from '../maps/Points';
import { ColorField } from 'react-admin-color-picker';

// const AreaTitle = () => {
//     const record = useRecordContext();
//     // the record can be empty while loading
//     if (!record) return null;
//     return <span>{record.place} Area</span>;
// };

const AreaShowActions = () => {
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

export const AreaShow = () => {

    return (

        <Show
            // title={<AreaTitle />}
            actions={<AreaShowActions />}
        >
            <SimpleShowLayout>
                <TextField source="name" />
                <TextField source="description" />
                <ReferenceField
                    label="Project"
                    source="project_id"
                    reference="projects"
                    link="show"
                    emptyText="N/A"
                    sortable={false}
                >
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceManyCount
                    label="Sensors"
                    reference="sensors"
                    target="area_id"
                    link
                />
                <ReferenceManyCount
                    label="Plots"
                    reference="plots"
                    target="area_id"
                    link
                />
                <ReferenceManyCount
                    label="Soil Profiles"
                    reference="soil_profiles"
                    target="area_id"
                    link
                />

                <LocationFieldPoints />
            </SimpleShowLayout>
        </Show>
    )
};

export default AreaShow;
