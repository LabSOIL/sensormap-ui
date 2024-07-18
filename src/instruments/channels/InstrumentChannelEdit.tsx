/* eslint react/jsx-key: off */
import {
    Edit,
    TextInput,
    SimpleForm,
    useRecordContext,
    ArrayInput,
    SimpleFormIterator,
    useUpdate,
    useRefresh,
    useNotify,
    TopToolbar,
    ShowButton,
    Button,
    EditButton,
    useRedirect,
    usePermissions,
} from 'react-admin';
import { Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { Loading } from 'react-admin';
import { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

const InstrumentChannelEdit = () => {
    const [updating, setUpdating] = useState(false);
    const MyTopToolbar = () => {
        const { permissions } = usePermissions();
        const redirect = useRedirect();
        const record = useRecordContext();

        if (!record || !record.id) {
            return null;
        };
        const handleExperimentReturn = () => {
            redirect('show', 'instruments', record.experiment.id);
        };
        const handleChannelReturn = () => {
            redirect('show', 'instrument_channels', record.id);
        };
        const handleRedirectToIntegrate = () => {
            redirect(`/instrument_channels/${record.id}/integrate`);
        };

        return (
            <TopToolbar>
                <Button variant="contained" onClick={handleExperimentReturn}>Return to Experiment</Button>
                <Button variant="contained" onClick={handleChannelReturn}>Return to Channel</Button>
                {permissions === 'admin' && <>
                    <Button onClick={handleRedirectToIntegrate} variant="contained" color="success">Integrate</Button>
                </>}
            </TopToolbar>
        );
    }
    const LinePlotEdit = () => {
        const record = useRecordContext();
        const [update, { }] = useUpdate();
        const { setValue, watch } = useFormContext();
        const baselinePoints = watch('baseline_chosen_points', []);
        const notify = useNotify();
        const refresh = useRefresh();
        const [updating, setUpdating] = useState(false);
        const [layout, setLayout] = useState({
            width: 1000,
            height: 400,
            title: record?.channel_name || '',
            xaxis: { title: "Time" },
            yaxis: { title: "Value" },
            uirevision: 'true',
        });
        const [rawData, setRawData] = useState({ x: [], y: [] });
        const [selectedPoints, setSelectedPoints] = useState({ x: [], y: [] });
        const [baselineData, setBaselineData] = useState({ x: [], y: [] });

        useEffect(() => {
            if (record) {
                setRawData({ x: record.time_values, y: record.raw_values });
                setBaselineData({ x: record.time_values, y: record.baseline_values });
            }
        }, [record]);

        useEffect(() => {
            setSelectedPoints({
                x: baselinePoints.map(point => point.x),
                y: baselinePoints.map(point => point.y),
            });
        }, [baselinePoints]);

        if (!record) {
            return <Loading />;
        }
        if (!record.raw_values || !record.time_values) {
            return <Typography variant="h6">No data to display</Typography>;
        }

        const updatePoints = () => {
            update('instrument_channels', {
                id: record.id,
                data: {
                    baseline_chosen_points: baselinePoints,
                },
            })
                .then(() => {
                    notify('Baseline updated', { autoHideDuration: 500 });
                    refresh();
                })
                .catch((error) => {
                    notify('Error: Changes could not be saved');
                    refresh();
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
            data.points = data.points.filter((point) => {
                const x = point.x;
                const y = point.y;
                const index = record.time_values.findIndex(
                    (value, index) => value === x && record.raw_values[index] === y
                );
                return index !== -1;
            });

            if (data.points.length === 0) {
                notify('No valid data point selected');
                return;
            }

            const { points } = data;
            const newPoints = points.map((point) => ({
                x: point.x,
                y: point.y,
            }));

            const updatedPoints = [...baselinePoints];
            newPoints.forEach((newPoint) => {
                const index = updatedPoints.findIndex(
                    (point) => point.x === newPoint.x && point.y === newPoint.y
                );
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
                ...eventData,
            }));
        }, []);

        return (
            <div>
                <Plot
                    data={[
                        {
                            x: rawData.x,
                            y: rawData.y,
                            type: 'scattergl',
                            mode: 'lines+markers',
                            marker: { color: 'red' },
                            name: 'Raw Data',
                        },
                        {
                            x: selectedPoints.x,
                            y: selectedPoints.y,
                            type: 'scattergl',
                            mode: 'markers',
                            marker: { color: '#2F4F4F', size: 20, opacity: 0.8 },
                            name: 'Selected Points',
                        },
                        {
                            x: baselineData.x,
                            y: baselineData.y,
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
        setUpdating(true);
    };


    return (
        <Edit actions={<MyTopToolbar />}>
            <SimpleForm toolbar={false}>
                <LinePlotEdit />
                <ArrayInput source="baseline_chosen_points">
                    <SimpleFormIterator
                        inline
                        disableAdd
                        disableReordering
                        disableClear
                        removeButton={
                            <Button onClick={handleClick}>Remove Point</Button>
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
