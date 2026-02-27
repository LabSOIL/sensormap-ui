import {
    useRecordContext,
    useGetManyReference,
    useTheme,
    useDataProvider,
} from 'react-admin';
import { Grid, Switch, FormControlLabel } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

// --- Tooltip helpers ---

const TOOLTIP_STYLE: Record<string, string> = {
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

function makeCursorHook(
    tooltipRef: React.RefObject<HTMLDivElement | null>,
    containerRef: React.RefObject<HTMLDivElement | null>,
) {
    return (u: uPlot) => {
        const container = containerRef.current;
        if (!container) return;
        // Lazy tooltip creation — handles race when container wasn't ready
        if (!tooltipRef.current) {
            const el = document.createElement('div');
            Object.assign(el.style, TOOLTIP_STYLE);
            container.appendChild(el);
            (tooltipRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }
        const tt = tooltipRef.current!;
        if (!tt) return;
        const { left, top, idx } = u.cursor;
        if (idx == null) { tt.style.display = 'none'; return; }
        const ts = u.data[0][idx];
        let html = `<b>${new Date(ts * 1000).toLocaleString()}</b>`;
        for (let i = 1; i < u.series.length; i++) {
            if (!u.series[i].show) continue;
            const val = u.data[i][idx];
            html += `<br><span style="display:inline-block;width:12px;height:4px;background:${u.series[i].stroke(u, i)};margin:0 4px 2px;vertical-align:middle;border-radius:1px"></span> ${u.series[i].label}: ${val != null ? Number(val).toFixed(2) : '\u2014'}`;
        }
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
}

// --- Data conversion helpers ---

function sensorToAligned(data: any[]): (number | null)[][] | null {
    if (!data || !data.length) return null;
    // Sort by timestamp to guarantee monotonic x-axis
    const sorted = [...data].sort(
        (a, b) => new Date(a.time_utc).getTime() - new Date(b.time_utc).getTime()
    );
    return [
        sorted.map(d => new Date(d.time_utc).getTime() / 1000),
        sorted.map(d => d.temperature_1),
        sorted.map(d => d.temperature_2),
        sorted.map(d => d.temperature_3),
        sorted.map(d => d.temperature_average),
        sorted.map(d => d.soil_moisture_count),
    ];
}

function profileToAligned(record: any) {
    const tempByDepth = record.temperature_by_depth_cm || {};
    const vwcByDepth = record.moisture_vwc_by_depth_cm || {};
    const tempDepths = Object.keys(tempByDepth).sort((a, b) => Number(a) - Number(b));
    const vwcDepths = Object.keys(vwcByDepth).sort((a, b) => Number(a) - Number(b));

    if (!tempDepths.length && !vwcDepths.length) {
        return { aligned: null, tempDepths: [], vwcDepths: [] };
    }

    // Build union of all timestamps using Maps for correct alignment + sorting
    const tsSet = new Set<number>();
    const allMaps: Map<number, number>[] = [];

    tempDepths.forEach(depth => {
        const m = new Map<number, number>();
        tempByDepth[depth].forEach((p: any) => {
            const ts = Math.round(new Date(p.time_utc).getTime() / 1000);
            tsSet.add(ts);
            m.set(ts, p.y);
        });
        allMaps.push(m);
    });

    vwcDepths.forEach(depth => {
        const m = new Map<number, number>();
        vwcByDepth[depth].forEach((p: any) => {
            const ts = Math.round(new Date(p.time_utc).getTime() / 1000);
            tsSet.add(ts);
            m.set(ts, p.y);
        });
        allMaps.push(m);
    });

    const timestamps = Array.from(tsSet).sort((a, b) => a - b);
    const aligned: (number | null)[][] = [timestamps];
    allMaps.forEach(m => {
        aligned.push(timestamps.map(ts => m.get(ts) ?? null));
    });

    return { aligned, tempDepths, vwcDepths };
}

// --- SensorPlot ---

export const SensorPlot = () => {
    const [themeMode] = useTheme();
    const record = useRecordContext();
    const [showShapes, setShowShapes] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<uPlot | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(false);
    const [resolution, setResolution] = useState<string | undefined>(undefined);

    // Refs for draw hook closures
    const showShapesRef = useRef(showShapes);
    showShapesRef.current = showShapes;
    const assignmentsRef = useRef<any[]>([]);
    const initialAlignedRef = useRef<(number | null)[][] | null>(null);
    const prevThemeRef = useRef<string>('');
    const handleZoomRef = useRef<(start: string, end: string) => void>();

    if (!record) return null;

    const {
        data: sensorProfileAssignments,
        isPending: isPendingProfileAssignment,
    } = useGetManyReference(
        'sensor_profile_assignments',
        {
            target: 'sensor_id',
            id: record.id,
            pagination: { page: 1, perPage: 10 },
        }
    );

    // Update assignments ref
    useEffect(() => {
        assignmentsRef.current = sensorProfileAssignments || [];
    }, [sensorProfileAssignments]);

    // Initialize resolution from record
    useEffect(() => {
        setResolution(record.resolution);
    }, [record.resolution]);

    const isDark = themeMode === 'dark';

    // Self-contained zoom handler (via ref to avoid stale closure)
    handleZoomRef.current = async (start: string, end: string) => {
        setLoading(true);
        try {
            const { data } = await dataProvider.getOne('sensors', {
                id: record.id,
                meta: { start, end },
            });
            setResolution(data.resolution);
            const aligned = sensorToAligned(data.data);
            if (chartRef.current && aligned) {
                chartRef.current.setData(aligned);
            }
        } finally {
            setLoading(false);
        }
    };

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

    // Create or update chart
    useEffect(() => {
        if (!record?.data?.length || !containerRef.current) return;

        const aligned = sensorToAligned(record.data);
        if (!aligned) return;
        initialAlignedRef.current = aligned;

        const currentTheme = isDark ? 'dark' : 'light';

        // Same theme — in-place update
        if (chartRef.current && prevThemeRef.current === currentTheme) {
            chartRef.current.setData(aligned);
            return;
        }

        // Theme changed or first render — (re)create
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }
        prevThemeRef.current = currentTheme;

        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const fontColor = isDark ? '#fff' : '#000';
        const cursorHook = makeCursorHook(tooltipRef, containerRef);

        const opts: uPlot.Options = {
            width: containerRef.current.clientWidth,
            height: 400,
            cursor: {
                drag: { x: true, y: false },
                points: {
                    fill: (u, si) => u.series[si].stroke(u, si),
                    stroke: (u, si) => '#fff',
                    size: (u, si) => 7,
                    width: (u, si, size) => 2,
                },
            },
            scales: {
                x: { time: true },
                temperature: { auto: true },
                moisture: { auto: true },
            },
            series: [
                { label: 'Time' },
                { label: 'Temperature 1', stroke: 'rgb(31, 119, 180)', width: 1.5, scale: 'temperature', spanGaps: false },
                { label: 'Temperature 2', stroke: 'rgb(255, 127, 14)', width: 1.5, scale: 'temperature', spanGaps: false },
                { label: 'Temperature 3', stroke: 'rgb(44, 160, 44)', width: 1.5, scale: 'temperature', spanGaps: false },
                { label: 'Temperature Average', stroke: 'rgb(214, 39, 40)', width: 1.5, scale: 'temperature', spanGaps: false },
                { label: 'Soil Moisture', stroke: 'rgb(148, 103, 189)', width: 1.5, scale: 'moisture', spanGaps: false },
            ],
            axes: [
                { stroke: fontColor, grid: { stroke: gridColor } },
                {
                    scale: 'temperature',
                    label: 'Temperature (\u00B0C)',
                    labelFont: '12px system-ui',
                    stroke: 'rgb(31, 119, 180)',
                    ticks: { stroke: 'rgb(31, 119, 180)' },
                    grid: { stroke: gridColor },
                    side: 3,
                    size: 60,
                },
                {
                    scale: 'moisture',
                    label: 'Soil Moisture',
                    labelFont: '12px system-ui',
                    stroke: 'rgb(148, 103, 189)',
                    ticks: { stroke: 'rgb(148, 103, 189)' },
                    grid: { show: false },
                    side: 1,
                    size: 60,
                },
            ],
            legend: {
                show: true,
                live: false,
                markers: {
                    width: 0,
                    fill: (u: uPlot, si: number) => u.series[si].stroke(u, si),
                },
            },
            hooks: {
                setSelect: [(u: uPlot) => {
                    if (u.select.width < 1) return;
                    const min = u.posToVal(u.select.left, 'x');
                    const max = u.posToVal(u.select.left + u.select.width, 'x');
                    if (handleZoomRef.current) {
                        handleZoomRef.current(
                            new Date(min * 1000).toISOString(),
                            new Date(max * 1000).toISOString(),
                        );
                    }
                    u.setSelect({ left: 0, width: 0, top: 0, height: 0 }, false);
                }],
                setCursor: [cursorHook],
                draw: [(u: uPlot) => {
                    if (!showShapesRef.current || !assignmentsRef.current.length) return;
                    const ctx = u.ctx;
                    const { left, top, width, height } = u.bbox;
                    ctx.save();
                    assignmentsRef.current.forEach((a: any) => {
                        const ts0 = new Date(a.date_from).getTime() / 1000;
                        const ts1 = new Date(a.date_to).getTime() / 1000;
                        const x0 = Math.max(u.valToPos(ts0, 'x', true), left);
                        const x1 = Math.min(u.valToPos(ts1, 'x', true), left + width);
                        if (x1 <= x0) return;
                        ctx.fillStyle = 'rgba(255,0,0,0.2)';
                        ctx.fillRect(x0, top, x1 - x0, height);
                        // Label
                        const labelX = (x0 + x1) / 2;
                        const labelY = top + height / 2;
                        ctx.fillStyle = isDark ? '#fff' : '#000';
                        ctx.font = '10px system-ui';
                        ctx.textAlign = 'center';
                        ctx.fillText(`Assignment: ${a.sensor_profile?.name || ''}`, labelX, labelY);
                    });
                    ctx.restore();
                }],
            },
        };

        chartRef.current = new uPlot(opts, aligned, containerRef.current);
    }, [record?.data, isDark]);

    // Double-click to reset
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handler = () => {
            if (chartRef.current && initialAlignedRef.current) {
                chartRef.current.setData(initialAlignedRef.current);
                setResolution(record.resolution);
            }
        };
        el.addEventListener('dblclick', handler);
        return () => el.removeEventListener('dblclick', handler);
    }, [record?.resolution]);

    // Redraw when showShapes toggles
    useEffect(() => {
        if (chartRef.current) chartRef.current.redraw();
    }, [showShapes]);

    // Redraw when assignments load
    useEffect(() => {
        if (chartRef.current) chartRef.current.redraw();
    }, [sensorProfileAssignments]);

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

    if (isPendingProfileAssignment) return <p>Loading...</p>;

    return (
        <>
            <style>{`.sensor-chart .u-marker { height: 2px !important; width: 20px !important; border-radius: 1px !important; }`}</style>
            <div className="sensor-chart" style={{ position: 'relative' }}>
                {loading && (
                    <CircularProgress
                        size={24}
                        style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                    />
                )}
                <div ref={containerRef} style={{ position: 'relative' }} />
            </div>
            <Grid container justifyContent="flex-start" alignItems="center" spacing={2} mt={2}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showShapes}
                            onChange={() => setShowShapes(!showShapes)}
                            name="showShapes"
                            color="primary"
                        />
                    }
                    label={
                        <Typography variant="body2">
                            Show sensor profile
                        </Typography>
                    }
                />
                {resolution && (
                    <Grid item>
                        <Typography variant="body2" color="textSecondary">
                            Resolution: {resolution}
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </>
    );
}


// --- SensorProfilePlot ---

export const SensorProfilePlot = ({ visibleAssignments }: { visibleAssignments: any }) => {
    const record = useRecordContext();
    const [themeMode] = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<uPlot | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(false);
    const [resolution, setResolution] = useState<string | undefined>(undefined);

    // Refs for draw hook closures
    const visibleAssignmentsRef = useRef(visibleAssignments);
    visibleAssignmentsRef.current = visibleAssignments;
    const initialAlignedRef = useRef<(number | null)[][] | null>(null);
    const prevStructureRef = useRef<string>('');
    const prevThemeRef = useRef<string>('');
    const handleZoomRef = useRef<(start: string, end: string) => void>();

    if (!record) return null;
    const assignments = record.assignments || [];

    const isDark = themeMode === 'dark';

    // Initialize resolution from record
    useEffect(() => {
        setResolution(record.resolution);
    }, [record.resolution]);

    // Self-contained zoom handler (via ref to avoid stale closure)
    handleZoomRef.current = async (start: string, end: string) => {
        setLoading(true);
        try {
            const { data } = await dataProvider.getOne('sensor_profiles', {
                id: record.id,
                meta: { start, end },
            });
            setResolution(data.resolution);
            const { aligned } = profileToAligned(data);
            if (chartRef.current && aligned) {
                chartRef.current.setData(aligned);
            }
        } finally {
            setLoading(false);
        }
    };

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

    // Create or update chart
    useEffect(() => {
        if (!containerRef.current) return;

        const { aligned, tempDepths, vwcDepths } = profileToAligned(record);
        if (!aligned) return;
        initialAlignedRef.current = aligned;

        const structureKey = `${tempDepths.join(',')}_${vwcDepths.join(',')}`;
        const currentTheme = isDark ? 'dark' : 'light';

        // Same structure & theme — in-place update
        if (chartRef.current && prevStructureRef.current === structureKey && prevThemeRef.current === currentTheme) {
            chartRef.current.setData(aligned);
            return;
        }

        // Structure or theme changed — (re)create
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }
        prevStructureRef.current = structureKey;
        prevThemeRef.current = currentTheme;

        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const fontColor = isDark ? '#fff' : '#000';
        const hasMoistureData = vwcDepths.length > 0;
        const cursorHook = makeCursorHook(tooltipRef, containerRef);

        const seriesDefs: uPlot.Series[] = [
            { label: 'Time' },
            ...tempDepths.map((depth) => ({
                label: `Temp ${depth}cm`,
                stroke: `hsl(${(parseInt(depth) * 30) % 360}, 70%, 50%)`,
                width: 1.5,
                scale: 'temperature',
                spanGaps: false,
            })),
            ...vwcDepths.map((depth) => ({
                label: `VWC ${depth}cm`,
                stroke: `hsl(${(parseInt(depth) * 30 + 180) % 360}, 70%, 50%)`,
                width: 1.5,
                scale: 'vwc',
                spanGaps: false,
            })),
        ];

        const opts: uPlot.Options = {
            width: containerRef.current.clientWidth,
            height: 400,
            title: 'Sensor Data Grouped by Depth',
            cursor: {
                drag: { x: true, y: false },
                points: {
                    fill: (u, si) => u.series[si].stroke(u, si),
                    stroke: (u, si) => '#fff',
                    size: (u, si) => 7,
                    width: (u, si, size) => 2,
                },
            },
            scales: {
                x: { time: true },
                temperature: { auto: true },
                vwc: hasMoistureData ? { auto: false, range: [0, 1] } : { auto: true },
            },
            series: seriesDefs,
            axes: [
                { stroke: fontColor, grid: { stroke: gridColor } },
                {
                    scale: 'temperature',
                    label: 'Temperature (\u00B0C)',
                    labelFont: '12px system-ui',
                    stroke: 'rgb(31, 119, 180)',
                    ticks: { stroke: 'rgb(31, 119, 180)' },
                    grid: { stroke: gridColor },
                    side: 3,
                    size: 60,
                },
                ...(hasMoistureData ? [{
                    scale: 'vwc' as const,
                    label: 'Volumetric Water Content (VWC)',
                    labelFont: '12px system-ui',
                    stroke: 'rgb(148, 103, 189)',
                    ticks: { stroke: 'rgb(148, 103, 189)' },
                    grid: { show: false },
                    side: 1 as const,
                    size: 60,
                }] : []),
            ],
            legend: {
                show: true,
                live: false,
                markers: {
                    width: 0,
                    fill: (u: uPlot, si: number) => u.series[si].stroke(u, si),
                },
            },
            hooks: {
                setSelect: [(u: uPlot) => {
                    if (u.select.width < 1) return;
                    const min = u.posToVal(u.select.left, 'x');
                    const max = u.posToVal(u.select.left + u.select.width, 'x');
                    if (handleZoomRef.current) {
                        handleZoomRef.current(
                            new Date(min * 1000).toISOString(),
                            new Date(max * 1000).toISOString(),
                        );
                    }
                    u.setSelect({ left: 0, width: 0, top: 0, height: 0 }, false);
                }],
                setCursor: [cursorHook],
                draw: [(u: uPlot) => {
                    if (!assignments.length) return;
                    const ctx = u.ctx;
                    const { left, top, width, height } = u.bbox;
                    ctx.save();
                    assignments
                        .filter((a: any) => visibleAssignmentsRef.current[a.id])
                        .forEach((a: any) => {
                            const ts0 = new Date(a.date_from).getTime() / 1000;
                            const ts1 = new Date(a.date_to).getTime() / 1000;
                            const x0 = Math.max(u.valToPos(ts0, 'x', true), left);
                            const x1 = Math.min(u.valToPos(ts1, 'x', true), left + width);
                            if (x1 <= x0) return;
                            ctx.fillStyle = 'rgba(204, 179, 179, 0.2)';
                            ctx.fillRect(x0, top, x1 - x0, height);
                        });
                    ctx.restore();
                }],
            },
        };

        chartRef.current = new uPlot(opts, aligned, containerRef.current);
    }, [record?.temperature_by_depth_cm, record?.moisture_vwc_by_depth_cm, isDark]);

    // Double-click to reset
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handler = () => {
            if (chartRef.current && initialAlignedRef.current) {
                chartRef.current.setData(initialAlignedRef.current);
                setResolution(record.resolution);
            }
        };
        el.addEventListener('dblclick', handler);
        return () => el.removeEventListener('dblclick', handler);
    }, [record?.resolution]);

    // Redraw when visibleAssignments changes
    useEffect(() => {
        if (chartRef.current) chartRef.current.redraw();
    }, [visibleAssignments]);

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

    const hasMoistureData = record.moisture_vwc_by_depth_cm && Object.keys(record.moisture_vwc_by_depth_cm).length > 0;

    return (
        <>
            <style>{`.sensor-chart .u-marker { height: 2px !important; width: 20px !important; border-radius: 1px !important; }`}</style>
            <div className="sensor-chart" style={{ position: 'relative' }}>
                {loading && (
                    <CircularProgress
                        size={24}
                        style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
                    />
                )}
                <div ref={containerRef} style={{ position: 'relative' }} />
            </div>
            <Grid container justifyContent="flex-start" alignItems="center" spacing={2} mt={2}>
                {resolution && (
                    <Grid item>
                        <Typography variant="body2" color="textSecondary">
                            Resolution: {resolution}
                        </Typography>
                    </Grid>
                )}
                <Grid item>
                    <Typography variant="body2" color="textSecondary">
                        {hasMoistureData ?
                            'Showing temperature and VWC data grouped by depth' :
                            'Showing temperature data grouped by depth'
                        }
                    </Typography>
                </Grid>
            </Grid>
        </>
    );
};



export default SensorPlot;
