import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { useDataProvider, useRecordContext } from 'react-admin';
import { useWatch, useFormContext } from 'react-hook-form';

const SensorPlotWithOverlay = ({ interactive = false, onDateChange }) => {
    const dataProvider = useDataProvider();
    const [sensorData, setSensorData] = useState(null);
    const [fullRange, setFullRange] = useState(null);
    const [assignments, setAssignments] = useState([]);

    // Declare variables that differ between interactive and non-interactive modes
    let sensorId, sensorprofileId, dateFrom, dateTo, setValue, handleRelayout;
    if (interactive) {
        const formContext = useFormContext();
        setValue = formContext.setValue;
        sensorId = useWatch({ control: formContext.control, name: 'sensor_id' });
        sensorprofileId = useWatch({ control: formContext.control, name: 'sensorprofile_id' });
        dateFrom = useWatch({ control: formContext.control, name: 'date_from' });
        dateTo = useWatch({ control: formContext.control, name: 'date_to' });
        // When a relayout event occurs, the interactive (blue) shape is the last shape.
        handleRelayout = (event) => {
            const interactiveShapeIndex = assignments.length; // blue shape appended after assignment overlays
            if (event[`shapes[${interactiveShapeIndex}].x0`] && event[`shapes[${interactiveShapeIndex}].x1`]) {
                const newDateFrom = new Date(event[`shapes[${interactiveShapeIndex}].x0`]).toISOString();
                const newDateTo = new Date(event[`shapes[${interactiveShapeIndex}].x1`]).toISOString();
                setValue('date_from', newDateFrom);
                setValue('date_to', newDateTo);
                if (onDateChange) {
                    onDateChange(newDateFrom, newDateTo);
                }
            }
        };
    } else {
        const record = useRecordContext();
        sensorId = record.sensor_id;
        sensorprofileId = record.sensorprofile_id;
        dateFrom = record.date_from;
        dateTo = record.date_to;
        handleRelayout = undefined;
    }

    // Fetch sensor data when sensorId changes
    useEffect(() => {
        if (sensorId) {
            dataProvider.getOne('sensors', { id: sensorId })
                .then(({ data }) => {
                    setSensorData(data);
                    if (data && data.data && data.data.length > 0) {
                        const times = data.data.map(d => new Date(d.time_utc));
                        const minTime = new Date(Math.min(...times));
                        const maxTime = new Date(Math.max(...times));
                        const minISO = minTime.toISOString();
                        const maxISO = maxTime.toISOString();
                        setFullRange([minISO, maxISO]);
                        if (interactive && (!dateFrom || !dateTo)) {
                            setValue('date_from', minISO);
                            setValue('date_to', maxISO);
                        }
                    }
                })
                .catch(err => console.error(err));
        }
    }, [sensorId, dataProvider, interactive, dateFrom, dateTo, setValue]);

    // Fetch assignments when sensorprofileId changes
    useEffect(() => {
        if (sensorprofileId) {
            dataProvider.getList('sensor_profile_assignments', {
                filter: { sensorprofile_id: sensorprofileId },
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'date_from', order: 'ASC' },
            })
                .then(({ data }) => setAssignments(data))
                .catch(err => console.error(err));
        } else {
            setAssignments([]);
        }
    }, [sensorprofileId, dataProvider]);

    // Build non-movable assignment overlays (red)
    const assignmentShapes = assignments.map(assignment => {
        const isCurrent = !interactive && dateFrom && dateTo && assignment.date_from === dateFrom && assignment.date_to === dateTo;
        return {
            type: 'rect',
            xref: 'x',
            yref: 'paper',
            x0: assignment.date_from,
            x1: assignment.date_to,
            y0: 0,
            y1: 1,
            fillcolor: isCurrent ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.2)',
            line: { width: 0 },
            layer: 'below'
        };
    });

    // Define the draggable selection region (blue) only for interactive mode
    const selectionShape = interactive ? {
        type: 'rect',
        xref: 'x',
        yref: 'paper',
        x0: dateFrom,
        x1: dateTo,
        y0: 0,
        y1: 1,
        fillcolor: 'rgba(0, 0, 255, 0.2)',
        line: { width: 2, color: 'blue' },
        layer: 'above'
    } : null;

    // Compose shapes array: if interactive, add the blue selection shape; otherwise, only the red overlays.
    const shapes = interactive ? [...assignmentShapes, selectionShape] : [...assignmentShapes];

    if (!sensorId) return <p>Please select a sensor to load plot data.</p>;
    if (!sensorData || !sensorData.data || !fullRange) return <p>Loading sensor data…</p>;

    const times = sensorData.data.map(d => d.time_utc);
    const temperatures = sensorData.data.map(d => d.temperature_1);

    return (
        <Plot
            data={[
                {
                    x: times,
                    y: temperatures,
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Temperature',
                }
            ]}
            layout={{
                title: { text: 'Sensor Data' },
                xaxis: {
                    range: fullRange,
                    type: 'date',
                    title: "Time",
                },
                yaxis: {
                    title: 'Temperature (°C)',
                },
                shapes: shapes,
            }}
            config={{ editable: interactive, displayModeBar: true }}
            style={{ width: '100%', height: '400px' }}
            onRelayout={interactive ? handleRelayout : undefined}
            useResizeHandler
        />
    );
};

export default SensorPlotWithOverlay;
