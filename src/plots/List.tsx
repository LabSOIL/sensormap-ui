import {
    List,
    Datagrid,
    TextField,
    TextInput,
    usePermissions,
    TopToolbar,
    DateField,
    FunctionField,
    downloadCSV,
    Link,
    useRecordContext,
    useCreatePath,
    useNotify,
    CreateButton,
    ExportButton,
} from "react-admin";
import { stopPropagation } from "ol/events/Event";
import { ImportButton } from "react-admin-import-csv";
import jsonExport from 'jsonexport/dist';

const postFilters = [
    <TextInput label="Name" source="name" alwaysOn />,
    <TextInput label="Area/Gradient" source="q" alwaysOn />,
];

const PlotListActions = (props) => {
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
                    parseConfig={{ dynamicTyping: true }}
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
    const plotsForExport = plots.map(plot => {
        const {
            area_id,
            area,
            samples,
            geom,
            latitude,
            longitude,
            last_updated,
            name,
            image,
            coord_srid,
            ...plotForExport
        } = plot; // omit fields
        plotForExport.area_name = plot.area.name; // add a field
        return plotForExport;
    });

    jsonExport(plotsForExport, {
        headers: [
            "id", "plot_iterator", "gradient", "vegetation_type",
            "topography", "aspect", "created_on", "weather", "lithology",
            "coord_x", "coord_y", "coord_z", "area_name"
        ]  // order fields in the export
    }, (err, csv) => {
        downloadCSV(csv, 'plots');
    });
};

const AreaNameField = () => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const path = createPath({
        resource: 'areas',
        type: 'show',
        id: record.area.id,
    });

    return (
        <Link to={path} onClick={stopPropagation}>
            <TextField source="area.name" label="Area" />
        </Link>
    );
}

export const PlotList = () => {
    const FieldWrapper = ({ children, label }) => children;
    function toTitleCase(text) {
        return text.toLowerCase().replace(
            /(?<![^\s\p{Pd}])[^\s\p{Pd}]/ug, match => match.toUpperCase()
        );
    }

    return (
        <List
            filters={postFilters}
            actions={<PlotListActions />}
            storeKey={false}
            empty={false}
            perPage={25}
            exporter={exporter}
        >
            <Datagrid
                rowClick="show"
            >
                <TextField source="name" />
                <FieldWrapper label="Area"><AreaNameField /></FieldWrapper>
                <FunctionField render={record => `${toTitleCase(record.gradient)}`} label="Gradient" />
                <FunctionField
                    label="Samples"
                    render={record => record.samples ? record.samples.length : 0}
                />
                <FunctionField label="Microbial fields (filled/total)" render={record => {
                    const microbialFieldsFilled: number = record.samples.reduce((acc, sample) => (
                        acc + Number(sample.fungi_per_g ? 1 : 0) +
                        Number(sample.bacteria_per_g ? 1 : 0) +
                        Number(sample.archea_per_g ? 1 : 0) +
                        Number(sample.methanogens_per_g ? 1 : 0) +
                        Number(sample.methanotrophs_per_g ? 1 : 0)
                    ), 0);
                    const microbialFieldsTotal: number = record.samples.length * 5;
                    return `${microbialFieldsFilled}/${microbialFieldsTotal}`;
                }} />

                <FunctionField label="Composition fields (filled/total)" render={record => {
                    const compositionFieldsFilled: number = record.samples.reduce((acc, sample) => (
                        acc + Number(sample.fe_ug_per_g ? 1 : 0) +
                        Number(sample.na_ug_per_g ? 1 : 0) +
                        Number(sample.al_ug_per_g ? 1 : 0) +
                        Number(sample.k_ug_per_g ? 1 : 0) +
                        Number(sample.ca_ug_per_g ? 1 : 0) +
                        Number(sample.mg_ug_per_g ? 1 : 0) +
                        Number(sample.mn_ug_per_g ? 1 : 0) +
                        Number(sample.s_ug_per_g ? 1 : 0) +
                        Number(sample.cl_ug_per_g ? 1 : 0) +
                        Number(sample.p_ug_per_g ? 1 : 0) +
                        Number(sample.si_ug_per_g ? 1 : 0)
                    ), 0);
                    const compositionFieldsTotal: number = record.samples.length * 11;
                    return `${compositionFieldsFilled}/${compositionFieldsTotal}`;
                }} />
                <DateField source="last_updated" showTime />
            </Datagrid>
        </List >
    );
};

export default PlotList;
