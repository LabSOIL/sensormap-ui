import {
    List,
    Datagrid,
    TextField,
    useGetList,
    usePermissions,
    TopToolbar,
    TextInput,
    useNotify,
    NumberField,
    useRecordContext,
    useCreatePath,
    Link,
    useGetOne,
} from "react-admin";
import { stopPropagation } from "ol/events/Event";
import { ImportButton } from "react-admin-import-csv";
import { CreateButton, ExportButton } from "ra-ui-materialui";
import jsonExport from 'jsonexport/dist';

const postFilters = [
    <TextInput label="Search" source="q" alwaysOn />,
];


const PlotSampleListActions = (props) => {
    const {
        className,
        basePath,
        total,
        resource,
        currentSort,
        filterValues,
        exporter,
    } = props;
    const { permissions } = usePermissions();
    const notify = useNotify();

    return (
        <TopToolbar className={className}>
            {permissions === 'admin' && <>
                <CreateButton basePath={basePath} />
                <ImportButton
                    parseConig={{ dynamicTyping: true }}
                    postCommitCallback={(response) => {
                        if (response[0].success === false) {
                            // Provide useful message to user
                            notify(
                                `Error: ${response[0]?.err.message} (${response[0]?.err?.body.detail.length} errors)\n${response[0].err?.body.detail.map(obj => `Line ${obj.loc[1]} (${obj.loc[2]}): ${obj.msg}`).join('\n')}`, {
                                type: 'error',
                                multiLine: true,
                            });
                            throw new Error(error);
                        }
                    }}
                    {...props}
                />
            </>}
            <ExportButton
                disabled={total === 0}
                resource={resource}
                sort={currentSort}
                filter={filterValues}
                exporter={exporter}
            />
        </TopToolbar>
    );
};

const getProjectNameFromAreaID = (area_id) => {
    const { data, isPending, error } = useGetOne(
        'areas', { id: area_id }
    );
    return data;
}

const exporter = plots => {
    const samplesForExport = plots.map(plot => {
        const {
            // area_id,
            // area,
            // samples,
            // geom,
            // latitude,
            // longitude,
            // last_updated,
            // name,
            // image,
            // coord_srid,
            ...sampleForExport
        } = plot; // omit fields
        console.log("Area ID:", sampleForExport.plot.area_id)

        // plotForExport.area_name = plot.area.name; // add a field
        return sampleForExport;
    });

    // console.log("plotsForExport", plotsForExport[1]);
    jsonExport(samplesForExport, {
        headers: [
            "id", "plot_iterator", "slope", "gradient", "vegetation_type",
            "topography", "aspect", "created_on", "weather", "lithology",
            "coord_x", "coord_y", "coord_z", "area_name"
        ]  // order fields in the export
    }, (err, csv) => {
        downloadCSV(csv, 'plots');
    });
};

const PlotNameField = () => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const path = createPath({
        resource: 'plots',
        type: 'show',
        id: record.plot.id,
    });

    return (
        <Link to={path} onClick={stopPropagation}>
            <TextField source="plot.name" label="Area" />
        </Link>
    );
}
export const PlotSampleList = () => {
    const FieldWrapper = ({ children, label }) => children;

    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading ...</p>;

    return (
        <List
            filters={postFilters}
            actions={<PlotSampleListActions />}
            storeKey={false}
            empty={false}
            perPage={25}
            exporter={exporter}
        >
            <Datagrid rowClick="show">
                <FieldWrapper label="Plot"><PlotNameField /></FieldWrapper>
                <TextField source="name" />
                <NumberField source="upper_depth_cm" label="Upper Depth (cm)" />
                <NumberField source="lower_depth_cm" label="Lower Depth (cm)" />
                <NumberField source="sample_weight" label="Sample Weight (g)" />
                <NumberField source="subsample_weight" label="Subsample Weight" />
                <NumberField source="subsample_replica_weight" label="Subsample Replica Weight" />
            </Datagrid>
        </List>
    );
};



export default PlotSampleList;
