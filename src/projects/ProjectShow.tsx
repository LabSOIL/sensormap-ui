import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    ReferenceField,
    TabbedShowLayout,
    Datagrid,
    List,
    useRecordContext,
    ArrayField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    DateField,
    ReferenceManyField,
    ReferenceManyCount,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import {
    LineChart,
    Line,
    Label,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { ColorField } from 'react-admin-color-picker';


const ProjectShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><EditButton /><DeleteButton /></>}
        </TopToolbar>
    );
}

const ProjectShow = () => (
    <Show actions={<ProjectShowActions />}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <DateField source="last_updated" showTime/>
            <ColorField source="color" />
            <ReferenceManyField reference="areas" target="project_id" label="Areas">
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
                </Datagrid>
            </ReferenceManyField>
        </SimpleShowLayout>
    </Show >
);

export default ProjectShow;
