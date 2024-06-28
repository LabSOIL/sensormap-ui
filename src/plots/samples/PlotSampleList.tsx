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
    downloadCSV,
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
    const samplesForExport = plots.map(sample => {
        const {
            plot,
            last_updated,
            ...sampleForExport
        } = sample; // omit fields

        sampleForExport.project_name = sample.plot.area.project.name;
        sampleForExport.area_name = sample.plot.area.name;
        sampleForExport.plot_gradient = sample.plot.gradient;
        sampleForExport.plot_iterator = sample.plot.plot_iterator;

        return sampleForExport;
    });

    jsonExport(samplesForExport, {
        headers: [
            "id", "plot_id", "project_name", "area_name", "plot_gradient",
            "plot_iterator", "name", "created_on",
            "upper_depth_cm", "lower_depth_cm", "sample_weight",
            "subsample_weight", "subsample_replica_weight", "ph", "rh", "loi",
            "mfc", "c", "n", "cn", "clay_percent", "silt_percent",
            "sand_percent", "fe_ug_per_g", "na_ug_per_g", "al_ug_per_g",
            "k_ug_per_g", "ca_ug_per_g", "mg_ug_per_g", "mn_ug_per_g",
            "s_ug_per_g", "cl_ug_per_g", "p_ug_per_g", "si_ug_per_g",
            "fungi_per_g", "bacteria_per_g", "archea_per_g",
            "methanogens_per_g", "methanotrophs_per_g"
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
                <TextField source="plot.area.project.name" label="Project" />
                <FieldWrapper label="Plot"><PlotNameField /></FieldWrapper>
                <TextField source="plot.area.name" label="Area" />
                <TextField source="name" />
                <NumberField source="upper_depth_cm" label="Upper Depth (cm)" />
                <NumberField source="lower_depth_cm" label="Lower Depth (cm)" />
            </Datagrid>
        </List>
    );
};



export default PlotSampleList;
