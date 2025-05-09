/* eslint react/jsx-key: off */
import {
    Create,
    DateInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextField,
    TextInput,
    required,
} from 'react-admin';
import { AreaCoordinateEntry } from '../../maps/CoordinateEntry';

const SoilClassificationCreate = () => {
    return (
        <Create redirect="show">
            <SimpleForm>
                <ReferenceInput source="area_id" reference="areas">
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
                <ReferenceInput source="soil_type_id" reference="soil_types">
                    <SelectInput optionText="name" validate={[required()]} />
                </ReferenceInput>
                <NumberInput
                    source="depth_upper_cm"
                    label="Depth Upper (cm)"
                    validate={[required()]}
                />
                <NumberInput
                    source="depth_lower_cm"
                    label="Depth Lower (cm)"
                    validate={[required()]}
                />

                <DateInput source="sample_date" label="Sample Date" />
                <NumberInput
                    source="fe_abundance_g_per_cm3"
                    label="Fe Abundance (g/cm³)"
                />
                <TextInput source="name" label="Name" />
                <TextInput source="description" label="Description" multiline />
                <AreaCoordinateEntry is_required={false} />
            </SimpleForm>
        </Create>
    );
};

export default SoilClassificationCreate;
