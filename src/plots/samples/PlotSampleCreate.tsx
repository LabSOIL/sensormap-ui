/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    NumberField,
    minValue,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';

/*

   name: PlotSampleNames = Field(
        default=None,
        index=True,
    )
    upper_depth_cm: float = Field(
        default=None,
        nullable=False,
        title="Upper Depth (cm)",
        description="Upper depth in centimeters from the surface where the "
        "sample was taken",
    )
    lower_depth_cm: float = Field(
        default=None,
        nullable=False,
        title="Lower Depth (cm)",
        description="Lower depth in centimeters from the surface where the "
        "sample was taken",
    )
    plot_id: UUID = Field(
        nullable=False,
        index=True,
        foreign_key="plot.id",
        title="Plot ID",
        description="Unique identifier for the plot",
    )
    sample_weight: float = Field(
        default=None,
        nullable=False,
        title="Sample Weight (g)",
        description="Weight of the complete sample collected in the field "
        "(in grams)",
    )
    subsample_weight: str = Field(
        default=None,
        nullable=True,
        title="Subsample Weight",
        description="Weight of the subsample taken for pH, RH, and LOI "
        "measurements. May contain additional information like replicates",
    )
    ph: float = Field(
        default=None,
        nullable=True,
        title="pH",
        description="Average pH value. If replicates are used, this "
        "represents the average pH",
    )
    rh: float = Field(
        default=None,
        nullable=True,
        title="Residual Humidity (RH)",
        description="Residual humidity",
    )
    loi: float = Field(
        default=None,
        nullable=True,
        title="Loss on Ignition (LOI)",
        description="Loss on ignition during drying process",
    )
    mfc: float = Field(
        default=None,
        nullable=True,
        title="Moisture Factor Correction (MFC)",
        description="Moisture factor correction, representing the ratio of "
        "air-dried soil to oven-dried soil",
    )
    c: float = Field(
        default=None,
        nullable=True,
        title="Carbon (C) %",
        description="Percentage of carbon content in weight",
    )
    n: float = Field(
        default=None,
        nullable=True,
        title="Nitrogen (N) %",
        description="Percentage of nitrogen content in weight",
    )
    cn: float = Field(
        default=None,
        nullable=True,
        title="Carbon:Nitrogen Ratio",
        description="Ratio of carbon to nitrogen",
    )
    clay_percent: float = Field(
        default=None,
        nullable=True,
        title="Clay (%)",
        description="Percentage of clay by volume",
    )
    silt_percent: float = Field(
        default=None,
        nullable=True,
        title="Silt (%)",
        description="Percentage of silt by volume",
    )
    sand_percent: float = Field(
        default=None,
        nullable=True,
        title="Sand (%)",
        description="Percentage of sand by volume",
    )

    fe_ug_per_g: int = Field(
        default=None,
        nullable=True,
        title="Iron (Fe) in ug/g",
        description="Iron content in micrograms per gram (ug/g)",
    )
    al_ug_per_g: int = Field(
        default=None,
        nullable=True,
        title="Aluminum (Al) in ug/g",
        description="Aluminum content in micrograms per gram (ug/g)",
    )
    k_ug_per_g: int = Field(
        default=None,
        nullable=True,
        title="Potassium (K) in ug/g",
        description="Potassium content in micrograms per gram (ug/g)",
    )
    ca_ug_per_g: int = Field(
        default=None,
        nullable=True,
        title="Calcium (Ca) in ug/g",
        description="Calcium content in micrograms per gram (ug/g)",
    )
    mg_ug_per_g: int = Field(
        default=None,
        nullable=True,
        title="Magnesium (Mg) in ug/g",
        description="Magnesium content in micrograms per gram (ug/g)",
    )
    mn_ug_per_g: float = Field(
        default=None,
        nullable=True,
        title="Manganese (Mn) in ug/g",
        description="Manganese content in micrograms per gram (ug/g)",
    )
    s_ug_per_g: float = Field(
        default=None,
        nullable=True,
        title="Sulfur (S) in ug/g",
        description="Sulfur content in micrograms per gram (ug/g)",
    )
    cl_ug_per_g: float = Field(
        default=None,
        nullable=True,
        title="Chlorine (Cl) in ug/g",
        description="Chlorine content in micrograms per gram (ug/g)",
    )
    p_ug_per_g: float = Field(
        default=None,
        nullable=True,
        title="Phosphorus (P) in ug/g",
        description="Phosphorus content in micrograms per gram (ug/g)",
    )
    si_ug_per_g: float = Field(
        default=None,
        nullable=True,
        title="Silicon (Si) in ug/g",
        description="Silicon content in micrograms per gram (ug/g)",
    )


*/
const PlotSampleCreate = () => {
    return (

        <Create redirect="show">
            <SimpleForm >
                <TextField source="id" />
                <SelectInput source="name" choices={[
                    { id: 'A', name: 'A' },
                    { id: 'B', name: 'B' },
                    { id: 'C', name: 'C' }
                ]} defaultValue={'A'} helperText="Sample Name" validate={[required()]} />
                <ReferenceInput
                    source="plot_id"
                    reference="plots"
                    sort={{ field: 'name', order: 'ASC' }}
                >
                    <SelectInput
                        label="Plot"
                        source="plot_id"
                        optionText={(record) => `${record.name}`}
                        validate={required()}
                    />
                </ReferenceInput>

                <NumberInput
                    source="upper_depth_cm"
                    label="Upper Depth (cm)"
                    validate={[required(), minValue(0)]}
                    helperText={<>Upper depth in centimeters from the surface where the sample was taken</>}
                />
                <NumberInput
                    source="lower_depth_cm"
                    label="Lower Depth (cm)"
                    validate={[required(), minValue(0)]}
                    helperText={<>Lower depth in centimeters from the surface where the sample was taken</>}
                />
                <NumberInput source="sample_weight" label="Sample Weight (g)" validate={[required()]} />
                <TextInput source="subsample_weight" label="Subsample Weight" />
                <NumberInput source="ph" label="pH" />
                <NumberInput source="rh" label="Residual Humidity (RH)" />
                <NumberInput source="loi" label="Loss on Ignition (LOI)" />
                <NumberInput source="mfc" label="Moisture Factor Correction (MFC)" />
                <NumberInput source="c" label="Carbon (C) %" />
                <NumberInput source="n" label="Nitrogen (N) %" />
                <NumberInput source="cn" label="Carbon:Nitrogen Ratio" />
                <NumberInput source="clay_percent" label="Clay (%)" />
                <NumberInput source="silt_percent" label="Silt (%)" />
                <NumberInput source="sand_percent" label="Sand (%)" />
                <NumberInput source="fe_ug_per_g" label="Iron (Fe) in ug/g" />
                <NumberInput source="al_ug_per_g" label="Aluminum (Al) in ug/g" />
                <NumberInput source="k_ug_per_g" label="Potassium (K) in ug/g" />
                <NumberInput source="ca_ug_per_g" label="Calcium (Ca) in ug/g" />
                <NumberInput source="mg_ug_per_g" label="Magnesium (Mg) in ug/g" />
                <NumberInput source="mn_ug_per_g" label="Manganese (Mn) in ug/g" />
                <NumberInput source="s_ug_per_g" label="Sulfur (S) in ug/g" />
                <NumberInput source="cl_ug_per_g" label="Chlorine (Cl) in ug/g" />
                <NumberInput source="p_ug_per_g" label="Phosphorus (P) in ug/g" />
                <NumberInput source="si_ug_per_g" label="Silicon (Si) in ug/g" />

            </SimpleForm>
        </Create >

    )
};

export default PlotSampleCreate;
