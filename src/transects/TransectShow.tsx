import {
    Show,
    SimpleShowLayout,
    TextField,
    useRedirect,
    Button,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
    usePermissions,
    DateField,
    ReferenceField,
    Labeled,
    NumberField,
    FunctionField,
    CreateButton,
    Datagrid,
    ReferenceManyField,
    Loading,
    ArrayField,
} from "react-admin";
import { Grid, Typography } from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';


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
const ColoredLine = ({ color, height }) => (
    <hr
        style={{
            color: color,
            backgroundColor: color,
            height: height
        }}
    />
);


const CreateManyButton = () => {
    const redirect = useRedirect();
    const record = useRecordContext();

    return (
        <Button
            label="Add Many"
            onClick={(event) => {
                redirect(
                    '/plot_samples/createMany',
                    undefined,
                    undefined,
                    undefined,
                    { record: { plot_id: record.id } }
                );
            }}
            startIcon={< LibraryAddIcon fontSize='inherit' />}
        />
    )
}

const CreateSampleButton = () => {
    const record = useRecordContext();

    return (
        <CreateButton
            label="Add"
            resource="plot_samples"
            state={{
                record: {
                    plot_id: record.id,
                }
            }}
        />
    );

}

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

export const PlotShow = () => (
    <Show title={<PlotShowTitle />} actions={<PlotShowActions />}>
        <SimpleShowLayout >

            <TextField source="id" label="Transect ID" />

            <ColoredLine color="grey" height={2} />
            <Typography variant="h6" textAlign="center" gutterBottom>Nodes</Typography>
            <ArrayField source="nodes">
                <Datagrid rowClick="show" bulkActionButtons={false}>
                    <TextField source="id" label="Plot ID" />
                    <TextField source="name" label="Plot name" />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show >
);

export default PlotShow;
