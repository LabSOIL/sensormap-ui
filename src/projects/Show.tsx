import {
    Show,
    SimpleShowLayout,
    TextField,
    Datagrid,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    DateField,
    ReferenceManyField,
    ReferenceManyCount,
    FunctionField,
} from 'react-admin';

import { ColorBox } from './List';

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
            <DateField source="last_updated" showTime />
            <FunctionField render={() => <ColorBox />} label="Color" />

            <ReferenceManyField reference="areas" target="project_id" label="Areas">
                <Datagrid rowClick="show">
                    <TextField source="name" />
                    <TextField source="description" />
                    <ReferenceManyCount
                        label="Transects"
                        reference="transects"
                        target="area_id"
                        link
                    />
                    <ReferenceManyCount
                        label="Sensors"
                        reference="sensor_profiles"
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
