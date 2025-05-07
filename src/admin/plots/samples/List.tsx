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
    downloadCSV,
    FunctionField,
    FilterButton,
    NumberInput,
    CreateButton,
    ExportButton,
} from "react-admin";
import { stopPropagation } from "ol/events/Event";
import { ImportButton } from "react-admin-import-csv";
import jsonExport from 'jsonexport/dist';
import { Typography } from '@mui/material';

const filterOptions = [
    <TextInput label="Project/Plot/Area" source="q" alwaysOn />,
    <TextInput label="Name" source="name" alwaysOn />,
    <NumberInput label="Replicate" source="replicate" transform={v => Math.floor(v / 100)} />,
    <NumberInput label="Upper Depth (cm)" source="upper_depth_cm" transform={v => Math.floor(v / 100)} />,
    <NumberInput label="Lower Depth (cm)" source="lower_depth_cm" transform={v => Math.floor(v / 100)} />,
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
                <FilterButton filters={filterOptions} />
                <Typography variant="body2">Create from within Plot view</Typography>
                <CreateButton disabled />
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
            filters={filterOptions}
            actions={<PlotSampleListActions />}
            storeKey={false}
            empty={false}
            perPage={25}
            exporter={exporter}
        >
            <Datagrid rowClick="show">
                <TextField source="plot.area.project.name" label="Project" sortable={false} />
                <FieldWrapper label="Plot"><PlotNameField /></FieldWrapper>
                <TextField source="plot.area.name" label="Area" sortable={false} />
                <TextField source="name" />
                <NumberField source="upper_depth_cm" label="Upper Depth (cm)" />
                <NumberField source="lower_depth_cm" label="Lower Depth (cm)" />
                <NumberField source="replicate" label="Replicate" />
                <FunctionField label="Microbial fields (filled/total)" render={record => {
                    const microbialFieldsFilled: number = (
                        Number(record.fungi_per_g ? 1 : 0) +
                        Number(record.bacteria_per_g ? 1 : 0) +
                        Number(record.archea_per_g ? 1 : 0) +
                        Number(record.methanogens_per_g ? 1 : 0) +
                        Number(record.methanotrophs_per_g ? 1 : 0)
                    );
                    const microbialFieldsTotal: number = 5;
                    return `${microbialFieldsFilled}/${microbialFieldsTotal}`;
                }} />

                <FunctionField label="Composition fields (filled/total)" render={record => {
                    const compositionFieldsFilled: number = (
                        Number(record.fe_ug_per_g ? 1 : 0) +
                        Number(record.na_ug_per_g ? 1 : 0) +
                        Number(record.al_ug_per_g ? 1 : 0) +
                        Number(record.k_ug_per_g ? 1 : 0) +
                        Number(record.ca_ug_per_g ? 1 : 0) +
                        Number(record.mg_ug_per_g ? 1 : 0) +
                        Number(record.mn_ug_per_g ? 1 : 0) +
                        Number(record.s_ug_per_g ? 1 : 0) +
                        Number(record.cl_ug_per_g ? 1 : 0) +
                        Number(record.p_ug_per_g ? 1 : 0) +
                        Number(record.si_ug_per_g ? 1 : 0)
                    );
                    const compositionFieldsTotal: number = 11;
                    return `${compositionFieldsFilled}/${compositionFieldsTotal}`;
                }
                } />
            </Datagrid>
        </List>
    );
};



export default PlotSampleList;
