/* eslint react/jsx-key: off */
import {
    Edit,
    DateInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required,
} from 'react-admin';
import { AreaCoordinateEntry } from '../../maps/CoordinateEntry';

const SoilClassificationEdit = () => {

    return (
        <Edit redirect="show" >
            <SimpleForm >
                <TextInput source="id" disabled />
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

        </Edit >

    )
};

export default SoilClassificationEdit;
