/* eslint react/jsx-key: off */
import {
    Edit,
    TextInput,
    SimpleForm,
    SaveButton,
    Toolbar,
    useRecordContext,
    ArrayInput,
    SimpleFormIterator,
    useDataProvider,
    useRefresh,
    useNotify,
} from 'react-admin';
import { Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { Loading } from 'react-admin';
import React, { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import axios from 'axios';
import Button from '@mui/material/Button';
import dataProvider from '../../dataProvider/index';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const LinePlotEditor = () => {
    const record = useRecordContext();
    const { setValue, watch } = useFormContext();
    const baselinePoints = watch('baseline_values', []);
    const [layout, setLayout] = useState({
        width: 800,
        title: record?.channel_name || '',
        xaxis: { title: "Time" },
        yaxis: { title: "Value" }
    });

    if (!record) {
        return <Loading />;
    }
    if (!record.raw_values) {
        return <Typography variant="h6">No data to display</Typography>;
    }

    const handlePlotClick = (data) => {
        const { points } = data;
        const newPoints = points.map(point => ({
            x: point.x,
            y: point.y
        }));

        const updatedPoints = [...baselinePoints];
        newPoints.forEach(newPoint => {
            const index = updatedPoints.findIndex(
                point => point.x === newPoint.x && point.y === newPoint.y
            );
            if (index === -1) {
                updatedPoints.push(newPoint);
            } else {
                updatedPoints.splice(index, 1);
            }
        });
        setValue('baseline_values', updatedPoints);
    };

    const handleRelayout = useCallback((eventData) => {
        setLayout((prevLayout) => ({
            ...prevLayout,
            ...eventData
        }));
    }, []);


    return (
        <Plot
            data={[
                {
                    x: record.time_values,
                    y: record.raw_values,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'red' },
                },
                {
                    x: baselinePoints.map(point => point.x),
                    y: baselinePoints.map(point => point.y),
                    type: 'scatter',
                    mode: 'markers',
                    marker: { color: '#2F4F4F', size: 20, opacity: 0.8 },
                    name: 'Clicked Points',
                }
            ]}
            layout={layout}
            onClick={handlePlotClick}
            onRelayout={handleRelayout}
        />
    );
};

const UpdateEditButton = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const record = useRecordContext();

    if (!record || record === undefined || !record.id) {
        return null;
    }
    console.log(record);
    const onSuccess = data => {
        console.log("data", data)
        dataProvider.update('instrument_channels', {
            id: record.id,
            data: {
                baseline_values: data.baseline_values
            }
        }).then(() => {
            notify('Changes saved');
            refresh();
        }).catch((error) => {
            notify(`Error: ${error.message}`, 'error');
        });
    }

    return (
        <SaveButton type="button" mutationOptions={{ onSuccess }} alwaysEnable />
    );
};

const InstrumentChannelEdit = () => {

    return (
        <Edit>
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <TextInput source="baseline_spline" />
                <LinePlotEditor />
                <ArrayInput source="baseline_values" >
                    <SimpleFormIterator
                        getItemLabel={index => `#${index + 1}`}
                        inline
                        disableAdd
                    >
                        <TextInput source="x" readOnly />
                        <TextInput source="y" readOnly />
                    </SimpleFormIterator>
                </ArrayInput>
                <UpdateEditButton />
            </SimpleForm>
        </Edit>
    )
};

export default InstrumentChannelEdit;
