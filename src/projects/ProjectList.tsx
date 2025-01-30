import {
    List,
    Datagrid,
    TextField,
    useRecordContext,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    ReferenceManyCount,
    FunctionField,
} from "react-admin";

const ProjectListActions = () => {
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
    if (!record) return null;

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
            <TextField source="color" />
        </div>
    );
};
const ProjectList = () => {
    const { permissions } = usePermissions();

    return (
        <List storeKey={false}
            actions={<ProjectListActions />}
            perPage={25}
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? undefined : false}
                rowClick="show"
            >
                <TextField source="name" />
                <TextField source="description" />
                <FunctionField render={() => <ColorBox />} label="Color" />
                <ReferenceManyCount
                    label="Assigned Areas"
                    reference="areas"
                    target="project_id"
                />
            </Datagrid>
        </List >

    )
};

export default ProjectList;
