/* eslint react/jsx-key: off */
import {
    Edit,
    TextInput,
    SimpleForm,
    SaveButton,
    Toolbar,
    useRecordContext,
} from 'react-admin';
import { Typography } from '@mui/material';
import Plot from 'react-plotly.js';
import { Loading } from 'react-admin';
import React, { useState, useCallback, useEffect } from 'react';

const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const LinePlotShow = () => {
    const record = useRecordContext();
    const [clickedPoints, setClickedPoints] = useState([]);
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

        setClickedPoints(prevPoints => {
            const updatedPoints = [...prevPoints];
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
            return updatedPoints;
        });
    };

    const handleRelayout = useCallback((eventData) => {
        setLayout((prevLayout) => ({
            ...prevLayout,
            ...eventData
        }));
    }, []);

    useEffect(() => {
        console.log("Clicked points:", clickedPoints);
    }, [clickedPoints]);

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
                        x: clickedPoints.map(point => point.x),
                        y: clickedPoints.map(point => point.y),
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
            <div>
                <Typography variant="h6">Clicked Points</Typography>
                <ul>
                    {clickedPoints.map((point, index) => (
                        <li key={index}>x: {point.x}, y: {point.y}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const InstrumentChannelEdit = () => {
    return (
        <Edit redirect="show">
            <SimpleForm toolbar={<MyToolbar />}>
                <TextInput source="id" disabled />
                <TextInput source="baseline_spline" disabled />
                <TextInput source="baseline_points" disabled />
                <LinePlotShow />
            </SimpleForm>
        </Edit>
    )
};

export default InstrumentChannelEdit;
