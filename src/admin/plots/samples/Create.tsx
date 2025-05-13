import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import {
    Create,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    required,
    minValue,
    useGetOne,
    useNotify,
    Toolbar,
    SaveButton,
    useRefresh,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { Grid } from '@mui/material';


export const SoilClassificationInput = () => {
    const { watch } = useFormContext();
    const plotId = watch('plot_id');

    const { data: plot, isLoading } = useGetOne('plots', { id: plotId }, { enabled: !!plotId });

    const areaId = plot?.area?.id;

    return (
        <ReferenceInput
            source="soil_classification_id"
            reference="soil_classifications"
            sort={{ field: 'name', order: 'ASC' }}
            filter={{ area_id: areaId }}
            disabled={!plotId || isLoading} // Disable until a plot is chosen or loading is complete
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


const SampleToolbar = () => {
    const notify = useNotify();
    const { reset } = useFormContext();
    const refresh = useRefresh();
    return (
        <Toolbar>
            <SaveButton
                type="button"
                label="Save and add another"
                variant="contained"
                mutationOptions={{
                    onSuccess: () => {
                        reset();
                        window.scrollTo(0, 0);
                        notify('ra.notification.created', {
                            type: 'info',
                            messageArgs: { smart_count: 1 },
                        });
                        refresh();
                    },
                }}
            />
            <SaveButton label="Save and return" />
        </Toolbar>
    );
};

const SampleDetails = () => {
    // Provides some sample information about the selected plot
    const { getValues, watch } = useFormContext();
    const [selectedPlotId, setSelectedPlotId] = useState(null);

    useEffect(() => {
        const plotId = getValues('plot_id');
        if (plotId) setSelectedPlotId(plotId);
    }, [watch('plot_id'),]);

    const { data: plot, isLoading, error } = useGetOne('plots', { id: selectedPlotId });

    if (isLoading) return <Typography>Loading plot details...</Typography>;
    if (error) return <Typography>Error loading plot details</Typography>;
    if (!plot) return null;

    return (
        <div>
            <Typography variant="body1">Plot Samples for {plot.name}:</Typography>
            {plot.samples.map(sample => (
                <Typography key={sample.id} variant="body2">
                    {sample.name} (Depth: {sample.upper_depth_cm} - {sample.lower_depth_cm} cm, replicate: {sample.replicate})
                </Typography>
            ))}
        </div>
    );
};

const PlotSampleCreate = () => {
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
        <Create redirect="show" mutationOptions={{ onError }}>
            <SimpleForm toolbar={<SampleToolbar />}>
                <TextField source="id" />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
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
                    </Grid>
                    <Grid item xs={6}>
                        <SampleDetails />
                    </Grid>
                </Grid>
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
                <NumberInput source="sample_weight" label="Sample Weight (g)" validate={[required()]} />
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
        </Create>
    )
};

export default PlotSampleCreate;
