import {
    Edit,
    SimpleForm,
    TextInput,
    required,
    ReferenceInput,
    SelectInput,
    Toolbar,
    SaveButton,
    NumberInput,
    useDataProvider,
} from 'react-admin';
import { CoordinateInput } from '../../maps/CoordinateEntry';
import { useEffect, useState } from 'react';


const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

export const SoilTypeInput = () => {
    const dataProvider = useDataProvider();
    const [soilTypes, setSoilTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch soil types from the data provider
    useEffect(() => {
        const fetchSoilTypes = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await dataProvider.getSensorSoilTypes();
                console.log('SoilTypeInput: Fetched soil types', response.data);
                setSoilTypes(response.data);
            } catch (error) {
                console.error('SoilTypeInput: Error fetching soil types', error);
                setError('Failed to load soil types. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchSoilTypes();
    }, [dataProvider]); // Removed setSoilTypes from dependencies as it's stable
        
    if (loading) {
        return (
            <SelectInput
                source="soil_type_vwc"
                label="Soil Type"
                choices={[]}
                disabled
                helperText="Loading soil types..."
                validate={[required()]}
            />
        );
    }

    if (error) {
        return (
            <SelectInput
                source="soil_type_vwc"
                label="Soil Type"
                choices={[]}
                disabled
                helperText={error}
                validate={[required()]}
            />
        );
    }

    if (soilTypes.length === 0) {
        return (
            <SelectInput
                source="soil_type_vwc"
                label="Soil Type"
                choices={[]}
                disabled
                helperText="No soil types available"
                validate={[required()]}
            />
        );
    }

    return (
        <SelectInput
            source="soil_type_vwc"
            helperText="Select the soil type for this sensor profile. This will be used to calculate the VWC from the moisture counts."
            label="Soil Type"
            optionText="name"
            optionValue="id"
            choices={soilTypes}
            validate={[required()]}
        />
    );
}
const SensorProfileEdit = () => {
    return (
        <Edit>
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput
                        label="Area"
                        source="area_id"
                        optionText="name" />
                </ReferenceInput>
                <TextInput source="name" validate={[required()]} />
                <TextInput source="description" />
                <TextInput source="serial_number" />
                <TextInput source="comment" label="Notes/Comments" multiline />
                <SoilTypeInput />
                <CoordinateInput updateElevationOnMount={false} />
            </SimpleForm>
        </Edit>
    )
};

export default SensorProfileEdit;
