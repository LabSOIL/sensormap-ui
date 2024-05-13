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
    useDataProvider,
    SaveContextProvider,
    FileInput,
    FileField,
} from 'react-admin';

const PlotSampleCreateMany = () => {
    const dataProvider = useDataProvider();
    const save = data => {
        console.log(data);
        dataProvider.createMany('plot_samples', { data: data });
    };

    return (
        <Create redirect="list">
            <SaveContextProvider value={{ save: save }}>
                <SimpleForm >
                    Define the plot to which this sample belongs to:
                    <ReferenceInput source="plot_id" reference="plots" >
                        <SelectInput
                            label="Plot"
                            source="plot_id"
                            optionText="name" />
                    </ReferenceInput>
                    Upload a CSV containing the plot sample data:
                    <FileInput
                        label="Plot sample data (.csv)"
                        accept=".csv"
                        source="csv"
                        multiple={false}>
                        <FileField source="src" title="title" />
                    </FileInput>
                </SimpleForm>
            </SaveContextProvider>
        </Create>
    )
};

export default PlotSampleCreateMany;
