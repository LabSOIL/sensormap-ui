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

const LinePlotShow = () => {
    const record = useRecordContext();
    const { setValue, watch } = useFormContext();
    const baselinePoints = watch('baseline_points', []);
    const [layout, setLayout] = useState({
        width: 1400,
        height: 600,
        title: record?.channel_name || '',
        xaxis: { title: "Time" },
        yaxis: { title: "Value" }
    });

    if (!record) {
        return <Loading />;
    }
    if (!record.data) {
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
        setValue('baseline_points', updatedPoints);
    };

    const handleRelayout = useCallback((eventData) => {
        setLayout((prevLayout) => ({
            ...prevLayout,
            ...eventData
        }));
    }, []);


    return (
        <div>
            <Plot
                data={[
                    {
                        x: record.data.x,
                        y: record.data.y,
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: 'red' },
                    },
                    {
                        x: baselinePoints.map(point => point.x),
                        y: baselinePoints.map(point => point.y),
                        type: 'scatter',
                        mode: 'markers',
                        marker: { color: 'blue', size: 10 },
                        name: 'Clicked Points',
                    }
                ]}
                layout={layout}
                onClick={handlePlotClick}
                onRelayout={handleRelayout}
            />
        </div>
    );
};

const InstrumentChannelEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <LinePlotShow />
                <ArrayInput source="baseline_points" >
                    <SimpleFormIterator
                        getItemLabel={index => `#${index + 1}`}
                        inline
                        disableAdd
                    >
                        <TextInput source="x" readOnly />
                        <TextInput source="y" readOnly />
                    </SimpleFormIterator>
                </ArrayInput>

            </SimpleForm>
        </Edit>
    )
};

export default InstrumentChannelEdit;
