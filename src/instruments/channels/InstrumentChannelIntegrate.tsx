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

const InstrumentChannelIntegrate = () => {
    const [updating, setUpdating] = useState(false);

    const MyTopToolbar = () => {
        const { permissions } = usePermissions();
        const redirect = useRedirect();
        const record = useRecordContext();

        if (!record || !record.id) {
            return null;
        }
        const handleExperimentReturn = () => {
            redirect('show', 'instruments', record.experiment.id);
        };
        const handleChannelReturn = () => {
            redirect('show', 'instrument_channels', record.id);
        };

        return (
            <TopToolbar>
                <Button variant="contained" onClick={handleExperimentReturn}>Return to Experiment</Button>
                <Button variant="contained" onClick={handleChannelReturn}>Return to Channel</Button>
                {permissions === 'admin' && <>
                    <EditButton
                        label="Edit baseline"
                        icon={false}
                        variant='contained'
                        color="success" />
                </>}
            </TopToolbar>
        );
    };

    const LinePlotEdit = () => {
        const record = useRecordContext();
        const [update] = useUpdate();
        const { setValue, watch } = useFormContext();
        const IntegralPairs = watch('integral_chosen_pairs', []);
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
        if (!record.baseline_values || !record.time_values || record.baseline_values.length === 0) {
            return <Typography variant="h6">Filter baseline first</Typography>;
        }

        const updatePairs = () => {
            update('instrument_channels', {
                id: record.id,
                data: {
                    integral_chosen_pairs: IntegralPairs
                }
            }).then(() => {
                notify('Baseline updated', { autoHideDuration: 500 });
                refresh();
            }).catch((error) => {
                notify('Error: Changes could not be saved');
                console.error(error);
            });
        };

        useEffect(() => {
            if (updating) {
                updatePairs();
                setUpdating(false);
            }
        }, [updating]);

        const handlePlotClick = useCallback((data) => {
            data.points = data.points.filter(point => {
                const x = point.x;
                const y = point.y;
                const index = record.time_values.findIndex((value, index) => {
                    return value === x && record.baseline_values[index] === y;
                });
                return index !== -1;
            });

            if (data.points.length === 0) {
                notify('No valid data point selected');
                return;
            }

            const { points } = data;
            const newPoint = { x: points[0].x, y: points[0].y };

            const updatedPairs = [...IntegralPairs];

            if (
                updatedPairs.length === 0
                || (updatedPairs[updatedPairs.length - 1].end && updatedPairs[updatedPairs.length - 1].end !== undefined && updatedPairs[updatedPairs.length - 1].end.x !== undefined && updatedPairs[updatedPairs.length - 1].end.y !== undefined)
            ) {
                updatedPairs.push({ start: newPoint });
            } else {
                updatedPairs[updatedPairs.length - 1].end = newPoint;
            }

            console.log('After update:', updatedPairs);

            setValue('integral_chosen_pairs', updatedPairs);
            if (updatedPairs[updatedPairs.length - 1].end) {
                setUpdating(true);
            }
        }, [IntegralPairs, record, setValue, notify]);

        const handleRelayout = useCallback((eventData) => {
            setLayout((prevLayout) => ({
                ...prevLayout,
                ...eventData
            }));
        }, []);

        const handleClick = (index) => {
            const updatedPairs = [...IntegralPairs];
            updatedPairs.splice(index, 1);
            setValue('integral_chosen_pairs', updatedPairs);
            setUpdating(true);
        };

        return (
            <div>
                <Plot
                    data={[
                        {
                            x: record.time_values,
                            y: record.baseline_values,
                            type: 'scattergl',
                            mode: 'lines+markers',
                            marker: { color: 'blue' },
                            name: 'Baseline Data',
                        },
                        ...IntegralPairs.map((pair, index) => ({
                            x: [pair.start.x, pair.end?.x].filter(Boolean),
                            y: [pair.start.y, pair.end?.y].filter(Boolean),
                            type: 'scattergl',
                            mode: 'markers',
                            marker: { color: 'blue', size: 20, opacity: 0.8 },
                            name: `Selected Pair ${index + 1}`,
                        })),
                        ...IntegralPairs.map((pair, index) => (
                            pair.end ? {
                                x: [pair.start.x, pair.end.x, pair.end.x, pair.start.x],
                                y: [Math.min(...record.baseline_values), Math.min(...record.baseline_values), Math.max(...record.baseline_values), Math.max(...record.baseline_values)],
                                type: 'scatter',
                                fill: 'toself',
                                fillcolor: 'rgba(0, 0, 255, 0.2)',
                                line: { width: 0 },
                                name: `Shaded Region ${index + 1}`,
                            } : null
                        )).filter(Boolean),
                    ]}
                    layout={layout}
                    onClick={handlePlotClick}
                    onRelayout={handleRelayout}
                />
                <ArrayInput source="integral_chosen_pairs">
                    <SimpleFormIterator
                        inline
                        disableAdd
                        disableReordering
                        disableClear
                        removeButton={
                            <Button onClick={() => handleClick(index)}>Remove Pair</Button>
                        }
                    >
                        <TextInput source="start.x" label="Start X" readOnly />
                        <TextInput source="start.y" label="Start Y" readOnly />
                        <TextInput source="end.x" label="End X" readOnly />
                        <TextInput source="end.y" label="End Y" readOnly />
                    </SimpleFormIterator>
                </ArrayInput>
            </div>
        );
    };


    return (
        <Edit actions={<MyTopToolbar />}>
            <SimpleForm toolbar={false}>
                <LinePlotEdit />
            </SimpleForm>
        </Edit>
    );
};

export default InstrumentChannelIntegrate;
