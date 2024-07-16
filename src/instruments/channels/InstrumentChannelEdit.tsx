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
    useRedirect,
    useUpdate,
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

const LinePlotEdit = () => {
    const record = useRecordContext();
    const [update, { isPending, error }] = useUpdate();
    const { setValue, watch } = useFormContext();
    const baselinePoints = watch('baseline_chosen_points', []);
    const notify = useNotify();
    const refresh = useRefresh();
    const [layout, setLayout] = useState({
        width: 1000,
        height: 400,
        title: record?.channel_name || '',
        xaxis: { title: "Time" },
        yaxis: { title: "Value" }
    });

    if (!record) {
        return <Loading />;
    }
    if (!record.raw_values || !record.time_values) {
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
        setValue('baseline_chosen_points', updatedPoints);
        update('instrument_channels',
            {
                id: record.id,
                data: {
                    baseline_chosen_points: updatedPoints
                }
            }
        ).then(() => {
            refresh();
        }).catch((error) => {
            notify('Error: Changes could not be saved', 'error');
            console.error(error);
        });
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
                        x: record.time_values,
                        y: record.raw_values,
                        type: 'scattergl',
                        mode: 'lines+markers',
                        marker: { color: 'red' },
                        name: 'Raw Data',
                    },
                    {
                        x: baselinePoints.map(point => point.x),
                        y: baselinePoints.map(point => point.y),
                        type: 'scattergl',
                        mode: 'markers',
                        marker: { color: '#2F4F4F', size: 20, opacity: 0.8 },
                        name: 'Selected Points',
                    },
                    // Also the baseline_values
                    {
                        x: record.time_values,
                        y: record.baseline_values,
                        type: 'scattergl',
                        mode: 'lines',
                        marker: { color: 'blue' },
                        name: 'Baseline',
                    },
                ]}
                layout={layout}
                onClick={handlePlotClick}
                onRelayout={handleRelayout}
            />
        </div>
    );
};

const UpdateChangesButton = () => {
    const dataProvider = useDataProvider();
    const [update, { isPending, error }] = useUpdate();
    const redirect = useRedirect();
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    if (!record || !record.id) {
        return null;
    }

    const handleClick = async () => {
        const updatedRecord = {
            baseline_chosen_points: record.baseline_chosen_points
        };
        update('instrument_channels',
            { id: record.id, data: updatedRecord }
        ).then(() => {
            refresh();
        }).catch((error) => {
            notify('Error: Changes could not be saved', 'error');
            console.error(error);
        });
    };

    return (
        <Button onClick={handleClick}>Update changes</Button>
    );
}


const InstrumentChannelEdit = () => {
    return (
        <Edit>
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <LinePlotEdit />
                <UpdateChangesButton />
                <ArrayInput source="baseline_chosen_points" >
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
