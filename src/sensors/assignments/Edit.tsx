import React from 'react';
import {
    Edit,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    DateTimeInput,
    required,
    useNotify,
    useRefresh,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import SensorPlotWithOverlay from '../../plots/SensorPlotWithOverlay';

const SensorProfileAssignmentEdit = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const navigate = useNavigate();

    const onSuccess = (data) => {
        notify(
            `Changes saved to Sensor: ${data.sensor.name} and Sensor Profile: ${data.sensor_profile.name}`
        );
        // Instead of a fixed redirect, we navigate back in history.
        navigate(-1);
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
