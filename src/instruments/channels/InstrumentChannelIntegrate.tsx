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
    ArrayField,
    Datagrid,
    TextField,
    ButtonProps,
} from 'react-admin';
import { Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { Loading } from 'react-admin';
import { useState, useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

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

const InstrumentChannelIntegrate = () => {
    const [updating, setUpdating] = useState(false);
    const notify = useNotify();
    const refresh = useRefresh();


    const LinePlotEdit = () => {
        const record = useRecordContext();
        const [update] = useUpdate();
        const { getValues, setValue, watch } = useFormContext();

        const IntegralPairs = watch('integral_chosen_pairs', []);

        const [layout, setLayout] = useState({
            width: 1000,
            height: 400,
            title: record?.channel_name || '',
            xaxis: { title: "Time" },
            yaxis: { title: "Value" },
            uirevision: 'true',
        });

        const [baselineData, setBaselineData] = useState({ x: [], y: [] });
        const [selectedPairs, setSelectedPairs] = useState([]);

        useEffect(() => {
            if (record) {
                setBaselineData({ x: record.time_values, y: record.baseline_values });
            }
        }, [record]);

        useEffect(() => {
            setSelectedPairs(
                IntegralPairs.map(pair => ({
                    start: { x: pair.start.x, y: pair.start.y },
                    end: pair.end ? { x: pair.end.x, y: pair.end.y } : undefined
                }))
            );
        }, [IntegralPairs]);

        const updatePairs = () => {
            const updatedPairs = getValues('integral_chosen_pairs');
            update('instrument_channels', {
                id: record.id,
                data: {
                    integral_chosen_pairs: updatedPairs
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

        if (!record) {
            return <Loading />;
        }
        if (!record.baseline_values || !record.time_values || record.baseline_values.length === 0) {
            return (
                <>
                    <Typography variant="h6">Filter the baseline first</Typography>
                    <EditButton
                        label="Click here to filter the baseline"
                        icon={false}
                        variant='contained'
                        color="success" />
                </>
            );
        }

        const MyRemoveButton = (props: Omit<ButtonProps, 'onClick'>) => {
            const handleClick = (index: any) => {
                const updatedPairs = [...IntegralPairs];
                updatedPairs.splice(index, 1);
                setValue('integral_chosen_pairs', updatedPairs);
                setUpdating(true);
            };
            return (
                <Button
                    onClick={(index: any) => handleClick(index)}
                    color="warning"
                    {...props}
                >
                    <Typography>Remove</Typography>
                </Button>
            );
        };


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



        return (
            <div>
                <Typography variant="h6">Baseline Data</Typography>
                <Typography variant="body">Click a point on the plot to select the start of the integral, then the second click to define the end.</Typography><br />
                <Typography variant="body">Repeat the same to define further regions.</Typography>
                <br />

                <Plot
                    data={[
                        {
                            x: baselineData.x,
                            y: baselineData.y,
                            type: 'scattergl',
                            mode: 'lines+markers',
                            marker: { color: 'blue' },
                            name: 'Baseline Data',
                        },
                        ...selectedPairs.map((pair, index) => ({
                            x: [pair.start.x, pair.end?.x].filter(Boolean),
                            y: [pair.start.y, pair.end?.y].filter(Boolean),
                            type: 'scattergl',
                            mode: 'markers',
                            marker: { color: 'blue', size: 20, opacity: 0.8 },
                            name: `Selected Pair ${index + 1}`,
                        })),
                        ...selectedPairs.map((pair, index) => (
                            pair.end ? {
                                x: [pair.start.x, pair.end.x, pair.end.x, pair.start.x],
                                y: [Math.min(...record.baseline_values), Math.min(...record.baseline_values), Math.max(...record.baseline_values), Math.max(...record.baseline_values)],
                                type: 'scatter',
                                fill: 'toself',
                                fillcolor: 'rgba(0, 0, 255, 0.2)',
                                line: { width: 0 },
                                name: pair.sample_name,
                            } : null
                        )).filter(Boolean),
                    ]}
                    layout={layout}
                    onClick={handlePlotClick}
                    onRelayout={handleRelayout}
                />
                <Button align="right" variant="contained" onClick={() => setUpdating(true)}>Update sample names</Button><br />

                <ArrayInput source="integral_chosen_pairs" label="Integral Pairs">
                    <SimpleFormIterator
                        inline
                        disableAdd
                        disableReordering
                        disableClear
                        removeButton={<MyRemoveButton />}
                    >
                        <TextInput source="start.x" label="Start X" readOnly />
                        <TextInput source="start.y" label="Start Y" readOnly />
                        <TextInput source="end.x" label="End X" readOnly />
                        <TextInput source="end.y" label="End Y" readOnly />
                        <TextInput source="sample_name" label="Sample Name" defaultValue={`Sample ${record.integral_chosen_pairs.length + 1}`} />
                    </SimpleFormIterator>
                </ArrayInput>
                <Typography variant="h6">Integral Results</Typography>
                <ArrayField source="integral_results">
                    <Datagrid isRowSelectable={false} bulkActionButtons={false}>
                        <TextField source="start" />
                        <TextField source="end" />
                        <TextField source="area" label="Electrons Transferred [mol]" />
                        <TextField source="sample_name" />
                    </Datagrid>
                </ArrayField>
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
