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
    DateField,
    NumberField,
} from "react-admin";


const PlotSampleListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

export const PlotSampleList = () => {
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );

    if (isLoading) return <p>Loading ...</p>;

    return (
        <List actions={<PlotSampleListActions />} storeKey={false}>
            <Datagrid rowClick="show">
                <ReferenceField
                    source="plot_id"
                    reference="plots"
                    sort={{ field: 'name', order: 'ASC' }}
                >
                    <TextField source="name" />
                </ReferenceField>
                <TextField source="name" />
                <NumberField source="upper_depth_cm" label="Upper Depth (cm)" />
                <NumberField source="lower_depth_cm" label="Lower Depth (cm)" />
                <NumberField source="sample_weight" label="Sample Weight (g)" />
                <TextField source="subsample_weight" label="Subsample Weight" />
                <NumberField source="ph" label="pH" />
                <NumberField source="rh" label="Residual Humidity (RH)" />
                <NumberField source="loi" label="Loss on Ignition (LOI)" />
                <NumberField source="mfc" label="Moisture Factor Correction (MFC)" />
                <NumberField source="c" label="Carbon (C) %" />
                <NumberField source="n" label="Nitrogen (N) %" />
                <NumberField source="cn" label="Carbon:Nitrogen Ratio" />
                <NumberField source="clay_percent" label="Clay (%)" />
                <NumberField source="silt_percent" label="Silt (%)" />
                <NumberField source="sand_percent" label="Sand (%)" />
                <NumberField source="fe_ug_per_g" label="Iron (Fe) in ug/g" />
                <NumberField source="al_ug_per_g" label="Aluminum (Al) in ug/g" />
                <NumberField source="k_ug_per_g" label="Potassium (K) in ug/g" />
                <NumberField source="ca_ug_per_g" label="Calcium (Ca) in ug/g" />
                <NumberField source="mg_ug_per_g" label="Magnesium (Mg) in ug/g" />
                <NumberField source="mn_ug_per_g" label="Manganese (Mn) in ug/g" />
                <NumberField source="s_ug_per_g" label="Sulfur (S) in ug/g" />
                <NumberField source="cl_ug_per_g" label="Chlorine (Cl) in ug/g" />
                <NumberField source="p_ug_per_g" label="Phosphorus (P) in ug/g" />
                <NumberField source="si_ug_per_g" label="Silicon (Si) in ug/g" />
            </Datagrid>
        </List>
    );
};



export default PlotSampleList;
