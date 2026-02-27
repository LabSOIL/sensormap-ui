import React, { useEffect, useState, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import { useDataProvider, useRecordContext, useTheme } from 'react-admin';
import { useWatch, useFormContext } from 'react-hook-form';

const TOOLTIP_STYLE = {
    position: 'absolute',
    display: 'none',
    background: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'system-ui, sans-serif',
    pointerEvents: 'none',
    zIndex: '100',
    lineHeight: '1.5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
};

const SensorPlotWithOverlay = ({ interactive = false, onDateChange }) => {
    const dataProvider = useDataProvider();
    const [themeMode] = useTheme();
    const [sensorData, setSensorData] = useState(null);
    const [assignments, setAssignments] = useState([]);

    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const tooltipRef = useRef(null);
    const dateFromRef = useRef(null);
    const dateToRef = useRef(null);
    const assignmentsRef = useRef([]);

    // Declare variables that differ between interactive and non-interactive modes
    let sensorId, sensorprofileId, dateFrom, dateTo, setValue;
    if (interactive) {
        const formContext = useFormContext();
        setValue = formContext.setValue;
        sensorId = useWatch({ control: formContext.control, name: 'sensor_id' });
        sensorprofileId = useWatch({ control: formContext.control, name: 'sensorprofile_id' });
        dateFrom = useWatch({ control: formContext.control, name: 'date_from' });
        dateTo = useWatch({ control: formContext.control, name: 'date_to' });
    } else {
        const record = useRecordContext();
        sensorId = record?.sensor_id;
        sensorprofileId = record?.sensorprofile_id;
        dateFrom = record?.date_from;
        dateTo = record?.date_to;
    }

    // Keep refs in sync for draw hook closures
    dateFromRef.current = dateFrom;
    dateToRef.current = dateTo;
    assignmentsRef.current = assignments;

    const isDark = themeMode === 'dark';

    // Fetch sensor data when sensorId changes
    useEffect(() => {
        if (sensorId) {
            dataProvider.getOne('sensors', { id: sensorId })
                .then(({ data }) => {
                    setSensorData(data);
                    if (interactive && (!dateFrom || !dateTo) && data?.data?.length > 0) {
                        const times = data.data.map(d => new Date(d.time_utc).getTime());
                        const minISO = new Date(Math.min(...times)).toISOString();
                        const maxISO = new Date(Math.max(...times)).toISOString();
                        setValue('date_from', minISO);
                        setValue('date_to', maxISO);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [sensorId, dataProvider]);

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

    // Create tooltip element once
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const tt = document.createElement('div');
        Object.assign(tt.style, TOOLTIP_STYLE);
        el.appendChild(tt);
        tooltipRef.current = tt;
        return () => { tt.remove(); };
    }, []);

    // Create/recreate chart when data or theme changes
    useEffect(() => {
        if (!sensorData?.data?.length || !containerRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        const sorted = [...sensorData.data].sort(
            (a, b) => new Date(a.time_utc).getTime() - new Date(b.time_utc).getTime()
        );
        const aligned = [
            sorted.map(d => new Date(d.time_utc).getTime() / 1000),
            sorted.map(d => d.temperature_1),
        ];

        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const fontColor = isDark ? '#fff' : '#000';

        const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        const assignmentLabel = (a) => {
            const name = a.sensor?.name || a.sensor?.serial_number || a.sensor_id?.slice(0, 8);
            return `${name}: ${fmtDate(a.date_from)} – ${fmtDate(a.date_to)}`;
        };

        const cursorHook = (u) => {
            const container = containerRef.current;
            if (!container) return;
            // Lazy tooltip creation — handles race when container wasn't ready
            if (!tooltipRef.current) {
                const el = document.createElement('div');
                Object.assign(el.style, TOOLTIP_STYLE);
                container.appendChild(el);
                tooltipRef.current = el;
            }
            const tt = tooltipRef.current;
            const { left, top, idx } = u.cursor;
            if (idx == null) { tt.style.display = 'none'; return; }
            const ts = u.data[0][idx];
            let html = `<b>${new Date(ts * 1000).toLocaleString()}</b>`;
            for (let i = 1; i < u.series.length; i++) {
                if (!u.series[i].show) continue;
                const val = u.data[i][idx];
                html += `<br><span style="display:inline-block;width:12px;height:4px;background:${u.series[i].stroke(u, i)};margin:0 4px 2px;vertical-align:middle;border-radius:1px"></span> ${u.series[i].label}: ${val != null ? Number(val).toFixed(2) : '\u2014'}`;
            }
            // Show assignment overlaps at cursor position
            assignmentsRef.current.forEach(a => {
                const ts0 = new Date(a.date_from).getTime() / 1000;
                const ts1 = new Date(a.date_to).getTime() / 1000;
                if (ts >= ts0 && ts <= ts1) {
                    const isCurrent = !interactive
                        && dateFromRef.current && dateToRef.current
                        && a.date_from === dateFromRef.current
                        && a.date_to === dateToRef.current;
                    const color = isCurrent ? 'rgba(0,200,0,0.7)' : 'rgba(255,80,80,0.7)';
                    const label = isCurrent ? 'Current' : 'Other';
                    html += `<br><span style="display:inline-block;width:12px;height:4px;background:${color};margin:0 4px 2px;vertical-align:middle;border-radius:1px"></span> ${label}: ${assignmentLabel(a)}`;
                }
            });
            tt.innerHTML = html;
            tt.style.display = 'block';
            const overRect = u.over.getBoundingClientRect();
            const cRect = container.getBoundingClientRect();
            const cx = overRect.left - cRect.left + left;
            const cy = overRect.top - cRect.top + top;
            const ttW = tt.offsetWidth;
            tt.style.left = (cx + ttW + 20 > cRect.width ? cx - ttW - 10 : cx + 15) + 'px';
            tt.style.top = Math.max(cy - tt.offsetHeight / 2, 0) + 'px';
        };

        const drawHook = (u) => {
            const ctx = u.ctx;
            const { left, top, width, height } = u.bbox;
            ctx.save();

            // Draw assignment overlays
            assignmentsRef.current.forEach(a => {
                const ts0 = new Date(a.date_from).getTime() / 1000;
                const ts1 = new Date(a.date_to).getTime() / 1000;
                const x0 = Math.max(u.valToPos(ts0, 'x', true), left);
                const x1 = Math.min(u.valToPos(ts1, 'x', true), left + width);
                if (x1 <= x0) return;

                // In non-interactive mode, highlight current assignment green
                const isCurrent = !interactive
                    && dateFromRef.current && dateToRef.current
                    && a.date_from === dateFromRef.current
                    && a.date_to === dateToRef.current;
                ctx.fillStyle = isCurrent ? 'rgba(0,255,0,0.3)' : 'rgba(255,0,0,0.2)';
                ctx.fillRect(x0, top, x1 - x0, height);
            });

            // Draw interactive selection range (blue)
            if (interactive && dateFromRef.current && dateToRef.current) {
                const ts0 = new Date(dateFromRef.current).getTime() / 1000;
                const ts1 = new Date(dateToRef.current).getTime() / 1000;
                const x0 = Math.max(u.valToPos(ts0, 'x', true), left);
                const x1 = Math.min(u.valToPos(ts1, 'x', true), left + width);
                if (x1 > x0) {
                    ctx.fillStyle = 'rgba(0,0,255,0.2)';
                    ctx.fillRect(x0, top, x1 - x0, height);
                    ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x0, top, x1 - x0, height);
                }
            }

            ctx.restore();
        };

        const setSelectHook = (u) => {
            if (u.select.width < 1) return;
            const min = u.posToVal(u.select.left, 'x');
            const max = u.posToVal(u.select.left + u.select.width, 'x');

            if (interactive) {
                // Drag means "set assignment range"
                const newDateFrom = new Date(min * 1000).toISOString();
                const newDateTo = new Date(max * 1000).toISOString();
                setValue('date_from', newDateFrom);
                setValue('date_to', newDateTo);
                if (onDateChange) onDateChange(newDateFrom, newDateTo);
            }
            // Clear the native selection box (we draw our own overlay)
            u.setSelect({ left: 0, width: 0, top: 0, height: 0 }, false);
        };

        const opts = {
            width: containerRef.current.clientWidth,
            height: 400,
            title: 'Sensor Data',
            cursor: {
                drag: { x: true, y: false },
                points: {
                    fill: (u, si) => u.series[si].stroke(u, si),
                    stroke: (u, si) => '#fff',
                    size: (u, si) => 7,
                    width: (u, si, size) => 2,
                },
            },
            scales: { x: { time: true } },
            series: [
                { label: 'Time' },
                {
                    label: 'Temperature',
                    stroke: 'rgb(31, 119, 180)',
                    width: 1.5,
                    spanGaps: false,
                },
            ],
            axes: [
                { stroke: fontColor, grid: { stroke: gridColor } },
                {
                    label: 'Temperature (\u00B0C)',
                    size: 60,
                    stroke: fontColor,
                    grid: { stroke: gridColor },
                },
            ],
            legend: {
                show: true,
                live: false,
                markers: {
                    width: 0,
                    fill: (u, si) => u.series[si].stroke(u, si),
                },
            },
            hooks: {
                setSelect: [setSelectHook],
                setCursor: [cursorHook],
                draw: [drawHook],
            },
        };

        chartRef.current = new uPlot(opts, aligned, containerRef.current);
    }, [sensorData, isDark]);

    // Update legend entries and redraw when assignments or date range changes
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        // Remove old custom legend entries
        const legend = chart.root.querySelector('.u-legend');
        if (legend) {
            legend.querySelectorAll('.u-assign-legend').forEach(el => el.remove());
            // Add a legend entry per assignment
            assignments.forEach(a => {
                const isCurrent = !interactive
                    && dateFrom && dateTo
                    && a.date_from === dateFrom
                    && a.date_to === dateTo;
                const color = isCurrent ? 'rgba(0,200,0,0.5)' : 'rgba(255,80,80,0.4)';
                const label = isCurrent ? 'Current' : 'Other';
                const name = a.sensor?.name || a.sensor?.serial_number || a.sensor_id?.slice(0, 8);
                const from = new Date(a.date_from).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                const to = new Date(a.date_to).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

                const tr = document.createElement('tr');
                tr.className = 'u-series u-assign-legend';
                tr.innerHTML =
                    `<th><span class="u-marker" style="background:${color}; border-color:${color}"></span></th>` +
                    `<td class="u-label">${label}: ${name} (${from} – ${to})</td>`;
                legend.appendChild(tr);
            });
        }

        chart.redraw();
    }, [assignments, dateFrom, dateTo]);

    // Double-click to reset zoom (non-interactive only)
    useEffect(() => {
        if (interactive) return;
        const el = containerRef.current;
        if (!el) return;
        const handler = () => {
            if (chartRef.current && sensorData?.data?.length) {
                const sorted = [...sensorData.data].sort(
                    (a, b) => new Date(a.time_utc).getTime() - new Date(b.time_utc).getTime()
                );
                const aligned = [
                    sorted.map(d => new Date(d.time_utc).getTime() / 1000),
                    sorted.map(d => d.temperature_1),
                ];
                chartRef.current.setData(aligned);
            }
        };
        el.addEventListener('dblclick', handler);
        return () => el.removeEventListener('dblclick', handler);
    }, [interactive, sensorData]);

    // Cleanup on unmount
    useEffect(() => () => {
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }
    }, []);

    // Resize handling
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(() => {
            if (chartRef.current) chartRef.current.setSize({ width: el.clientWidth, height: 400 });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    if (!sensorId) return <p>Please select a sensor to load plot data.</p>;
    if (!sensorData?.data?.length) return <p>Loading sensor data…</p>;

    return (
        <>
            <style>{`.sensor-chart .u-marker { height: 2px !important; width: 20px !important; border-radius: 1px !important; }`}</style>
            <div className="sensor-chart" ref={containerRef} style={{ position: 'relative' }} />
        </>
    );
};

export default SensorPlotWithOverlay;
