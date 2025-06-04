import { Typography } from '@mui/material';
/* eslint react/jsx-key: off */
import {
    DateInput,
    Edit,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required,
    minValue,
    useNotify,
    useRecordContext,
} from 'react-admin';

export const SoilClassificationInput = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <ReferenceInput
            source="soil_classification_id"
            reference="soil_classifications"
            sort={{ field: 'name', order: 'ASC' }}
            filter={{ area_id: record.plot.area_id }} // Filter by area_id
        >
            <SelectInput
                label="Soil Classification"
                source="soil_classification_id"
                optionText={(record) => {
                    const date = new Date(record.created_on).toLocaleDateString();
                    return `${date} ${record.soil_type?.name} (${record.area?.name} ${record.depth_upper_cm} - ${record.depth_lower_cm} cm)`;
                }}
            />
        </ReferenceInput>
    );
};

const PlotSampleEdit = () => {
    const notify = useNotify();

    const onError = (error) => {
        if (error.status === 409) {
            notify("Either the sample name is not unique, or a sample with the same replicate, upper and lower depth already exists.");
            window.scrollTo(0, 0);
            return;
        }
        notify(`Error: ${error}`);
    };
    return (
        <Edit redirect="show" mutationOptions={{ onError }}>
            <SimpleForm>

                <ReferenceInput
                    source="plot_id"
                    reference="plots"
                    sort={{ field: 'name', order: 'ASC' }}
                >
                    <SelectInput
                        label="Plot"
                        source="plot_id"
                        optionText="name"
                        validate={required()}
                        readOnly
                    />
                </ReferenceInput>
                <SoilClassificationInput />

                <TextInput source="name" validate={[required()]} />
                <NumberInput source="replicate" label="Replicate" validate={[required()]} defaultValue={1} />
                <NumberInput
                    source="upper_depth_cm"
                    label="Upper Depth (cm)"
                    validate={[required(), minValue(0)]}
                    helperText={<>Upper-most depth in centimeters relative to the surface where the sample was taken</>}
                />
                <NumberInput
                    source="lower_depth_cm"
                    label="Lower Depth (cm)"
                    validate={[required(), minValue(0)]}
                    helperText={<>Lower-most depth in centimeters relative to the surface where the sample was taken</>}
                />
                <NumberInput source="sample_weight" label="Sample Weight (g)"/>
                <NumberInput source="subsample_weight" label="Subsample Weight" />
                <NumberInput source="subsample_replica_weight" label="Subsample Replica Weight" />
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
                <NumberInput source="na_ug_per_g" label="Sodium (Na) in ug/g" />
                <NumberInput source="al_ug_per_g" label="Aluminum (Al) in ug/g" />
                <NumberInput source="k_ug_per_g" label="Potassium (K) in ug/g" />
                <NumberInput source="ca_ug_per_g" label="Calcium (Ca) in ug/g" />
                <NumberInput source="mg_ug_per_g" label="Magnesium (Mg) in ug/g" />
                <NumberInput source="mn_ug_per_g" label="Manganese (Mn) in ug/g" />
                <NumberInput source="s_ug_per_g" label="Sulfur (S) in ug/g" />
                <NumberInput source="cl_ug_per_g" label="Chlorine (Cl) in ug/g" />
                <NumberInput source="p_ug_per_g" label="Phosphorus (P) in ug/g" />
                <NumberInput source="si_ug_per_g" label="Silicon (Si) in ug/g" />
                <Typography variant="h6" gutterBottom>Microbial Fields</Typography>
                <NumberInput source="fungi_per_g" helperText="Fungi (fungal 18S gene copy number per g of soil)" />
                <NumberInput source="bacteria_per_g" helperText="Bacteria (bacterial 16S gene copy number per g of soil)" />
                <NumberInput source="archea_per_g" helperText="Archea (archeal 16S gene copy number per g of soil)" />
                <NumberInput source="methanogens_per_g" helperText="Methanogens (mcrA gene copy number per g of soil)" />
                <NumberInput source="methanotrophs_per_g" helperText="Methanotrophs (pmoA gene copy number per g of soil)" />
            </SimpleForm>
        </Edit>
    )
};

export default PlotSampleEdit;
