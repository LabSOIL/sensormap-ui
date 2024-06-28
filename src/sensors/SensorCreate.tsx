/* eslint react/jsx-key: off */
import * as React from 'react';
import { useMutation } from 'react-query';
import {
    Create,
    SimpleForm,
    TextField,
    TextInput,
    required,
    FileInput,
    FileField,
    ReferenceInput,
    SelectInput,
    useDataProvider,
    SaveButton,
    Toolbar,
    useNotify,
    useRedirect,
    DeleteButton,
    useRecordContext,
    useSaveContext,
    SaveContextProvider,
} from 'react-admin';


const SensorCreate = () => {
    const dataProvider = useDataProvider();
    const save = data => {
        dataProvider.createMany('sensors', { data: data });
    };

    return (
        <Create redirect="list">
            <SaveContextProvider value={{ save: save }}>
                {/* <SimpleForm toolbar={<SensorEditToolbar />}> */}
                <SimpleForm >
                    Upload the .gpx file from the GPS:
                    <FileInput
                        label="GPS (.gpx) data"
                        accept=".gpx"
                        source="gpx"
                        multiple={true}>
                        <FileField source="src" title="title" />
                    </FileInput>
                    Define the area to which this sensor belongs:
                    <ReferenceInput source="area_id" reference="areas" >
                        <SelectInput
                            label="Area"
                            source="area_id"
                            optionText="name" />
                    </ReferenceInput>

                </SimpleForm>
            </SaveContextProvider>
        </Create>
    )
};

export default SensorCreate;
