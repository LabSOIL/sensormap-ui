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
} from 'react-admin';
import { Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { Loading } from 'react-admin';
import { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import Button from '@mui/material/Button';

const InstrumentChannelIntegrate = () => {
    const [updating, setUpdating] = useState(false);
    const MyTopToolbar = () => (
        <TopToolbar>
            <ShowButton label='Return to channel' variant="contained" />
        </TopToolbar>
    );

    const LinePlotEdit = () => {
        const record = useRecordContext();
        const [update, { }] = useUpdate();
        const { setValue, watch } = useFormContext();
        const baselinePairs = watch('baseline_chosen_pairs', []);
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
            update('instrument_channels',
                {
                    id: record.id,
                    data: {
                        baseline_chosen_pairs: baselinePairs
                    }
                }
            ).then(() => {
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

        const handlePlotClick = (data) => {
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

            const updatedPairs = [...baselinePairs];
            if (updatedPairs.length === 0 || updatedPairs[updatedPairs.length - 1].end) {
                updatedPairs.push({ start: newPoint });
            } else {
                updatedPairs[updatedPairs.length - 1].end = newPoint;
            }

            setValue('baseline_chosen_pairs', updatedPairs);
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
                            y: record.baseline_values,
                            type: 'scattergl',
                            mode: 'lines+markers',
                            marker: { color: 'blue' },
                            name: 'Baseline Data',
                        },
                        ...baselinePairs.map((pair, index) => ({
                            x: [pair.start.x, pair.end?.x].filter(Boolean),
                            y: [pair.start.y, pair.end?.y].filter(Boolean),
                            type: 'scattergl',
                            mode: 'markers',
                            marker: { color: 'blue', size: 20, opacity: 0.8 },
                            name: `Selected Pair ${index + 1}`,
                        })),
                        ...baselinePairs.map((pair, index) => (
                            pair.end ? {
                                x: [pair.start.x, pair.end.x, pair.end.x, pair.start.x],
                                y: [0, 0, Math.max(...record.baseline_values), Math.max(...record.baseline_values)],
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
            </div>
        );
    };

    const handleClick = (index) => {
        const updatedPairs = [...baselinePairs];
        updatedPairs.splice(index, 1);
        setValue('baseline_chosen_pairs', updatedPairs);
        setUpdating(true);
    };

    return (
        <Edit actions={<MyTopToolbar />}>
            <SimpleForm toolbar={false}>
                <LinePlotEdit />
                <ArrayInput source="baseline_chosen_pairs">
                    <SimpleFormIterator
                        inline
                        disableAdd
                        disableReordering
                        disableClear
                        removeButton={
                            <Button onClick={(index) => handleClick(index)}>Remove Pair</Button>
                        }
                    >
                        <TextInput source="start.x" label="Start X" readOnly />
                        <TextInput source="start.y" label="Start Y" readOnly />
                        <TextInput source="end.x" label="End X" readOnly />
                        <TextInput source="end.y" label="End Y" readOnly />
                    </SimpleFormIterator>
                </ArrayInput>
            </SimpleForm>
        </Edit>
    )
};

export default InstrumentChannelIntegrate;
