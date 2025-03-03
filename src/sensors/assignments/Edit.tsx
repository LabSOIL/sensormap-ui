import React from 'react';
import {
    Edit,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    required,
    useRedirect,
    useNotify,
    useRefresh,
} from 'react-admin';
import SensorPlotWithOverlay from '../../plots/SensorPlotWithOverlay';

const SensorProfileAssignmentEdit = () => {
    const redirect = useRedirect();
    const notify = useNotify();
    const refresh = useRefresh();

    const onSuccess = (data) => {
        notify(`Changes saved to Sensor: ${data.sensor.name} and Sensor Profile: ${data.sensor_profile.name}`);
        redirect("show", "sensors", data.sensor_id, {});
        refresh();
    };

    return (
        <Edit mutationOptions={{ onSuccess }} mutationMode="pessimistic">
            <SimpleForm>
                <ReferenceInput source="sensor_id" reference="sensors">
                    <SelectInput optionText="name" validate={required()} />
                </ReferenceInput>
                <ReferenceInput source="sensorprofile_id" reference="sensor_profiles">
                    <SelectInput optionText="name" validate={required()} />
                </ReferenceInput>
                <DateTimeInput source="date_from" label="Date From" validate={required()} />
                <DateTimeInput source="date_to" label="Date To" validate={required()} />
                <SensorPlotWithOverlay interactive={true} />
            </SimpleForm>
        </Edit>
    );
};

export default SensorProfileAssignmentEdit;
