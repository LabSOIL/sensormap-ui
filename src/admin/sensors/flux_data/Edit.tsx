import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    required,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    Toolbar,
    SaveButton,
} from 'react-admin';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const FluxDataEdit = () => (
    <Edit>
        <SimpleForm toolbar={<MyToolbar />}>
            <TextInput source="id" disabled />
            <ReferenceInput source="sensorprofile_id" reference="sensor_profiles" filter={{ profile_type: 'chamber' }}>
                <SelectInput label="Chamber Profile" optionText="name" validate={required()} />
            </ReferenceInput>
            <DateTimeInput source="measured_on" validate={required()} />
            <TextInput source="replicate" validate={required()} helperText="e.g. REP_1, REP_2" />
            <SelectInput source="setting" choices={[
                { id: 'uncovered', name: 'Uncovered' },
                { id: 'covered', name: 'Covered' },
            ]} />
            <NumberInput source="flux_co2_umol_m2_s" label="CO2 flux (umol/m2/s)" />
            <NumberInput source="flux_ch4_nmol_m2_s" label="CH4 flux (nmol/m2/s)" />
            <NumberInput source="flux_h2o_umol_m2_s" label="H2O flux (umol/m2/s)" />
            <NumberInput source="r2_co2" label="R2 CO2" />
            <NumberInput source="r2_ch4" label="R2 CH4" />
            <NumberInput source="r2_h2o" label="R2 H2O" />
            <NumberInput source="swc" label="Soil Water Content" />
            <NumberInput source="n_measurements" label="N Measurements" />
        </SimpleForm>
    </Edit>
);

export default FluxDataEdit;
