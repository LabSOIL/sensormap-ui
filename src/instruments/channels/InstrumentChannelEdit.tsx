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
    TextField,
    ChipField,
    FunctionField,
} from 'react-admin';
import { Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { Loading } from 'react-admin';
import React, { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import axios from 'axios';
import Button from '@mui/material/Button';
import dataProvider from '../../dataProvider/index';



const InstrumentChannelEdit = () => {
    const [updating, setUpdating] = useState(false);

    const ReturnButton = () => {
        // Return to the channel show page
        const redirect = useRedirect();
        const record = useRecordContext();
        return (
            <Button
                variant='contained'
                onClick={() => redirect('show', 'instrument_channels', record.id)}
            >
                Return to channel
            </Button>
        );
    };

    const MyToolbar = () => (
        <Toolbar>
            <ReturnButton />
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
        const updatePoints = () => {
            update('instrument_channels',
                {
                    id: record.id,
                    data: {
                        baseline_chosen_points: baselinePoints
                    }
                }
            ).then(() => {
                notify('Baseline updated', { autoHideDuration: 500 });
                refresh();
            }).catch((error) => {
                notify('Error: Changes could not be saved', 'error');
                console.error(error);
            });
        };

        useEffect(() => {
            if (updating) {
                updatePoints();
                setUpdating(false);
            }
        }, [updating]);

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
                // Sort the points by x value
                updatedPoints.sort((a, b) => a.x - b.x);
                if (index === -1) {
                    updatedPoints.push(newPoint);
                } else {
                    updatedPoints.splice(index, 1);
                }
            });
            setValue('baseline_chosen_points', updatedPoints);
            setUpdating(true);
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

    const handleClick = (record) => {
        // Remove the point from the list and update the record
        // Trigger update on the new list (the same as updating the plot)
        console.log("Click");
        setUpdating(true);
    };


    return (
        <Edit>
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <LinePlotEdit />
                <ArrayInput source="baseline_chosen_points">
                    <SimpleFormIterator
                        inline
                        disableAdd
                        disableReordering
                        removeButton={
                            <Button onClick={handleClick}>Remove</Button>
                        }
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
