import {
    List,
    Datagrid,
    TextField,
    ReferenceManyCount,
    useGetList,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    ArrayField,
    Count,
    ReferenceField,
    FunctionField,
    useRecordContext,
} from "react-admin";
import { LocationFieldAreas } from '../maps/Areas';
import { ColorField } from 'react-admin-color-picker';

const AreaListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

export const ColorBox = () => {
    const record = useRecordContext();

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
                style={{
                    width: '20px', // Size of the box
                    height: '20px', // Size of the box
                    backgroundColor: record.color, // Use the record color
                    border: '1px solid #ccc', // Optional border for visibility
                    marginRight: '10px', // Space between box and text
                }}
            />
            <TextField source="name" />
        </div>
    );
};

export const AreaList = () => {
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading areas...</p>;

    return (
        <List actions={<AreaListActions />} storeKey={false}>
            <LocationFieldAreas
                areas={data} />
            <Datagrid rowClick="show">
                <TextField source="name" />
                <TextField source="description" />
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
                <ReferenceField
                    label="Project"
                    source="project_id"
                    reference="projects"
                    link="show"
                    emptyText="N/A"
                    sortable={false}
                >
                    <ColorBox />
                </ReferenceField>

            </Datagrid>
        </List>
    );
};



export default AreaList;
