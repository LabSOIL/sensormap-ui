import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    required,
    ReferenceInput,
    SelectInput,
    Toolbar,
    SaveButton,
} from 'react-admin';
import { useWatch } from 'react-hook-form';
import { CoordinateInput, AreaCoordinateEntry } from '../../maps/CoordinateEntry';
import { SoilTypeInput } from './Edit';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

export const PROFILE_TYPE_CHOICES = [
    { id: 'tms', name: 'TMS' },
    { id: 'chamber', name: 'Chamber' },
    { id: 'redox', name: 'Redox' },
];

export const ProfileTypeFields = () => {
    const profileType = useWatch({ name: 'profile_type' });

    return (
        <>
            {profileType === 'tms' && <SoilTypeInput />}
            {profileType === 'chamber' && (
                <>
                    <NumberInput source="volume_ml" label="Chamber Volume (ml)" />
                    <NumberInput source="area_cm2" label="Collar Area (cm²)" />
                    <TextInput source="instrument_model" label="Instrument Model" />
                    <TextInput source="chamber_id_external" label="Chamber ID" />
                </>
            )}
            {(profileType === 'chamber' || profileType === 'redox') && (
                <NumberInput source="position" label="Position Number" />
            )}
        </>
    );
};

const SensorProfileCreate = () => {

    return (
        <Create redirect="list">
            <SimpleForm toolbar={<MyToolbar />} defaultValues={{ profile_type: 'tms' }}>
                <TextInput source="name" validate={[required()]} />
                Define the area to which this sensor belongs:
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput
                        label="Area"
                        source="area_id"
                        optionText="name"
                        validate={required()}
                    />
                </ReferenceInput>
                <SelectInput
                    source="profile_type"
                    label="Profile Type"
                    choices={PROFILE_TYPE_CHOICES}
                    defaultValue="tms"
                    validate={required()}
                />
                <ProfileTypeFields />
                <AreaCoordinateEntry source="area_id" />
                <TextInput source="description" />
            </SimpleForm>
        </Create>
    )
};

export default SensorProfileCreate;
