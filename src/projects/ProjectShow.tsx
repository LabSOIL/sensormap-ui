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
            <ColorField source="color" />

        </SimpleShowLayout>
    </Show >
);

export default ProjectShow;


export const ProjectPlot = ({ source }) => {
    const record = useRecordContext();
    const data = record[source]

    return (
        <LineChart
            width={800}
            height={400}
            data={data}
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" >
                <Label value="Time" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis domain={['dataMin', 'dataMax']}>
                <Label value="Temperature (°C)" angle={-90} offset={5} position="insideLeft" />
            </YAxis>
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="temperature_1" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="temperature_2" stroke="#82ca9d" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="temperature_3" stroke="#ffc658" activeDot={{ r: 8 }} />



        </LineChart >

    );

};
