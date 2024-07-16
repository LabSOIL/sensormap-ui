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
} from 'react-admin';
import { Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { Loading } from 'react-admin';
import { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import Button from '@mui/material/Button';

const InstrumentChannelEdit = () => {
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
                notify('Error: Changes could not be saved');
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
            // Make sure the clicked point corresponds to a data point in the
            // raw data of the record. We don't want to add points that are
            // from the baseline filtered points -- that doesn't make
            // any sense..!! We can do this by checking if the y value of the
            // clicked point is the same as the y value of the raw data at
            // the same x value.
            data.points = data.points.filter(point => {
                const x = point.x;
                const y = point.y;
                const index = record.time_values.findIndex((value, index) => {
                    return value === x && record.raw_values[index] === y;
                });
                return index !== -1;
            });

            if (data.points.length === 0) {
                notify('No valid data point selected');
                return;
            }

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
