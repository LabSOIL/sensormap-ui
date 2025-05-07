import { useRecordContext } from "react-admin";
import Plot from 'react-plotly.js';


const texturePolygons = [{
    name: 'Heavy Clay',
    geom: [[0, 100], [40, 60], [0, 60]],
},
{
    name: 'Clay',
    geom: [[0, 60], [40, 60], [45, 55], [45, 40], [20, 40]],
},
{
    name: 'Silty Clay',
    geom: [[0, 60], [0, 40], [20, 40]],
},
{
    name: 'Sandy Clay',
    geom: [[45, 55], [45, 35], [65, 35]],
},
{
    name: 'Silty Clay Loam',
    geom: [[0, 40], [0, 28], [20, 28], [20, 40]],
},
{
    name: 'Clay Loam',
    geom: [[20, 40], [20, 28], [45, 28], [45, 40]],
},
{
    name: 'Sandy Clay Loam',
    geom: [[45, 35], [45, 28], [52, 20], [80, 20], [65, 35]],
},
{
    name: 'Silt',
    geom: [[0, 0], [0, 12], [8, 12], [19, 0]],
},
{
    name: 'Silt Loam',
    geom: [[0, 12], [0, 28], [8, 12], [19, 0], [50, 0], [25, 28]],
},
{
    name: 'Loam',
    geom: [[25, 28], [45, 5], [52, 5], [52, 20], [45, 28]],
},
{
    name: 'Sandy Loam',
    geom: [[52, 20], [52, 5], [45, 5], [50, 0], [70, 0], [85, 15], [80, 20]],
},
{
    name: 'Loamy Sand',
    geom: [[70, 0], [85, 15], [90, 10], [83, 0]],
},
{
    name: 'Sand',
    geom: [[90, 10], [83, 0], [100, 0]],
}];

export const SedimentChart = () => {
    const record = useRecordContext();

    const clay = record.clay_percent;
    const silt = record.silt_percent;
    const sand = record.sand_percent;

    const soilSample = {
        type: 'scatterternary',
        mode: 'markers',
        a: [clay],
        b: [silt],
        c: [sand],
        text: ['Soil Sample'],
        marker: {
            symbol: 'circle',
            color: '#DB7365',
            size: 14,
            line: { width: 0 }
        }
    };

    const polygonTraces = texturePolygons.map((polygon) => ({
        type: 'scatterternary',
        mode: 'lines',
        a: polygon.geom.map((point) => point[1]),
        b: polygon.geom.map((point) => 100 - point[0] - point[1]),
        c: polygon.geom.map((point) => point[0]),
        name: polygon.name,
        line: {
            color: 'rgba(0,0,0,0.5)',
            width: 2
        },
        fill: 'toself',
        fillcolor: 'rgba(0,0,0,0.1)'
    }));

    const data = [soilSample, ...polygonTraces];

    const layout = {
        ternary: {
            sum: 100,
            aaxis: {
                title: 'Clay',
                min: 0.01,
                linewidth: 2,
                ticks: 'outside'
            },
            baxis: {
                title: 'Silt',
                min: 0.01,
                linewidth: 2,
                ticks: 'outside'
            },
            caxis: {
                title: 'Sand',
                min: 0.01,
                linewidth: 2,
                ticks: 'outside'
            }
        },
        showlegend: false,
        width: 500,
        height: 500,
        autosize: true,
        margin: {
            l: 50,
            r: 50,
            t: 50,
            b: 50
        },
        font: {
            size: 16
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Plot
                data={data}
                layout={layout}
            />
        </div>
    );
};

export const MicrobialPieChart = () => {
    const record = useRecordContext();
    const total = record.fungi_per_g + record.bacteria_per_g + record.archea_per_g;
    const fungiPercent = (record.fungi_per_g * 100 / total);
    const bacteriaPercent = (record.bacteria_per_g * 100 / total);
    const archaeaPercent = (record.archea_per_g * 100 / total);

    const data = [{
        labels: ['Fungi', 'Bacteria', 'Archaea'],
        values: [fungiPercent, bacteriaPercent, archaeaPercent],
        type: 'pie',
        hoverinfo: 'label+percent',
        textinfo: 'label+percent',
        textposition: 'inside',
        insidetextorientation: 'radial',

        marker: {
            colors: ['#6DB65D', '#5D9AB6', '#B65D87']
        }
    }];

    const layout = {
        showlegend: true,
        legend: {
            x: 10,
            y: 1
        },
        width: 500,
        height: 500,
        autosize: true,
        margin: {
            l: 0,
            r: 0,
            t: 0,
            b: 0
        },
        font: {
            size: 16
        }
    };

    return (
        // <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Plot
            data={data}
            layout={layout}
        />
        // </div>
    );
};