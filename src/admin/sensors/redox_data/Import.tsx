import { useState } from 'react';
import { useDataProvider, useNotify, Title, useGetList } from 'react-admin';
import { useAuthProvider } from 'ra-core';
import {
    Card, CardContent, Typography, Button as MuiButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Alert, CircularProgress, Box, Chip,
    Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface RawRedoxRecord {
    date: string;
    position: number;
    channels: {
        ch1_5cm: number;
        ch2_15cm: number;
        ch3_25cm: number;
        ch4_35cm: number;
    };
    temp_c: number;
}

interface ParsedRedoxRecord {
    measured_on: string;
    position: number;
    ch1_5cm_mv: number;
    ch2_15cm_mv: number;
    ch3_25cm_mv: number;
    ch4_35cm_mv: number;
    temp_c: number;
    sensorprofile_id?: string;
}

const parseDDMMYYYY = (s: string): string => {
    const [datePart, timePart] = s.split(' ');
    const [dd, mm, yyyy] = datePart.split('.');
    return new Date(`${yyyy}-${mm}-${dd}T${timePart}:00Z`).toISOString();
};

const RedoxDataImport = () => {
    const dataProvider = useDataProvider();
    const authProvider = useAuthProvider();
    const notify = useNotify();
    const [areaId, setAreaId] = useState<string>('');
    const [profilesByPosition, setProfilesByPosition] = useState<Record<number, string>>({});
    const [parsedRecords, setParsedRecords] = useState<ParsedRedoxRecord[]>([]);
    const [matchWarnings, setMatchWarnings] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ inserted: number; errors: any[] } | null>(null);

    const { data: areas, isLoading: areasLoading } = useGetList('areas', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'name', order: 'ASC' },
    });

    const handleAreaChange = async (newAreaId: string) => {
        setAreaId(newAreaId);
        setParsedRecords([]);
        setMatchWarnings([]);
        setResult(null);
        if (!newAreaId) {
            setProfilesByPosition({});
            return;
        }
        try {
            const { data: profiles } = await dataProvider.getList('sensor_profiles', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'name', order: 'ASC' },
                filter: { profile_type: 'redox', area_id: newAreaId },
            });
            const map: Record<number, string> = {};
            for (const p of profiles) {
                if (p.position != null) {
                    map[p.position] = p.id;
                }
            }
            setProfilesByPosition(map);
        } catch (e) {
            notify('Failed to fetch sensor profiles', { type: 'error' });
            setProfilesByPosition({});
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setResult(null);
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const raw: RawRedoxRecord[] = JSON.parse(ev.target?.result as string);
                const warnings: string[] = [];
                const unmatchedPositions = new Set<number>();

                const records: ParsedRedoxRecord[] = raw.map((r) => {
                    const profileId = profilesByPosition[r.position];
                    if (!profileId) {
                        unmatchedPositions.add(r.position);
                    }
                    return {
                        measured_on: parseDDMMYYYY(r.date),
                        position: r.position,
                        ch1_5cm_mv: r.channels.ch1_5cm,
                        ch2_15cm_mv: r.channels.ch2_15cm,
                        ch3_25cm_mv: r.channels.ch3_25cm,
                        ch4_35cm_mv: r.channels.ch4_35cm,
                        temp_c: r.temp_c,
                        sensorprofile_id: profileId,
                    };
                });

                if (unmatchedPositions.size > 0) {
                    warnings.push(
                        `No redox profile found for position(s): ${Array.from(unmatchedPositions).sort((a, b) => a - b).join(', ')}. Those records will be skipped.`
                    );
                }

                setParsedRecords(records);
                setMatchWarnings(warnings);
            } catch (err) {
                notify('Failed to parse JSON file', { type: 'error' });
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = async () => {
        const matched = parsedRecords.filter((r) => r.sensorprofile_id);
        if (matched.length === 0) {
            notify('No matched records to submit', { type: 'warning' });
            return;
        }
        setSubmitting(true);
        setResult(null);
        try {
            const token = await (authProvider as any).getToken();
            const payload = matched.map(({ position: _position, ...rest }) => rest);

            const response = await fetch('/api/redox_data/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            setResult(data);
            notify(`Imported ${data.inserted} redox records`, { type: 'success' });
        } catch (err: any) {
            notify(`Import failed: ${err.message}`, { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const matchedCount = parsedRecords.filter((r) => r.sensorprofile_id).length;
    const unmatchedCount = parsedRecords.length - matchedCount;

    return (
        <div>
            <Title title="Import Redox Data" />
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Import Redox Data</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Upload a redox_processed.json file. Records are matched to sensor profiles by position number.
                    </Typography>

                    <FormControl fullWidth sx={{ mt: 2, mb: 2, maxWidth: 400 }}>
                        <InputLabel>Area</InputLabel>
                        <Select
                            value={areaId}
                            label="Area"
                            onChange={(e) => handleAreaChange(e.target.value as string)}
                            disabled={areasLoading}
                        >
                            {(areas || []).map((area: any) => (
                                <MenuItem key={area.id} value={area.id}>
                                    {area.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {areaId && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                Found {Object.keys(profilesByPosition).length} redox profile(s) with positions:{' '}
                                {Object.keys(profilesByPosition).sort((a, b) => Number(a) - Number(b)).join(', ') || 'none'}
                            </Typography>
                        </Box>
                    )}

                    {areaId && (
                        <Box sx={{ mb: 2 }}>
                            <MuiButton variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                                Select JSON File
                                <input type="file" accept=".json" hidden onChange={handleFileUpload} />
                            </MuiButton>
                        </Box>
                    )}

                    {matchWarnings.map((w, i) => (
                        <Alert severity="warning" key={i} sx={{ mb: 1 }}>{w}</Alert>
                    ))}

                    {parsedRecords.length > 0 && (
                        <>
                            <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                                <Chip label={`${parsedRecords.length} total`} />
                                <Chip label={`${matchedCount} matched`} color="success" />
                                {unmatchedCount > 0 && <Chip label={`${unmatchedCount} unmatched`} color="warning" />}
                            </Box>

                            <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Position</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Ch1 5cm</TableCell>
                                            <TableCell>Ch2 15cm</TableCell>
                                            <TableCell>Ch3 25cm</TableCell>
                                            <TableCell>Ch4 35cm</TableCell>
                                            <TableCell>Temp (C)</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {parsedRecords.slice(0, 100).map((r, i) => (
                                            <TableRow key={i} sx={!r.sensorprofile_id ? { backgroundColor: '#fff3e0' } : undefined}>
                                                <TableCell>{r.position}</TableCell>
                                                <TableCell>{new Date(r.measured_on).toLocaleString()}</TableCell>
                                                <TableCell>{r.ch1_5cm_mv}</TableCell>
                                                <TableCell>{r.ch2_15cm_mv}</TableCell>
                                                <TableCell>{r.ch3_25cm_mv}</TableCell>
                                                <TableCell>{r.ch4_35cm_mv}</TableCell>
                                                <TableCell>{r.temp_c}</TableCell>
                                                <TableCell>
                                                    {r.sensorprofile_id
                                                        ? <Chip label="Matched" color="success" size="small" />
                                                        : <Chip label="Unmatched" color="warning" size="small" />
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {parsedRecords.length > 100 && (
                                <Typography variant="caption" color="textSecondary">
                                    Showing first 100 of {parsedRecords.length} records
                                </Typography>
                            )}

                            <Box sx={{ mt: 2 }}>
                                <MuiButton
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={submitting || matchedCount === 0}
                                    startIcon={submitting ? <CircularProgress size={20} /> : undefined}
                                >
                                    {submitting ? 'Importing...' : `Import ${matchedCount} Records`}
                                </MuiButton>
                            </Box>
                        </>
                    )}

                    {result && (
                        <Box sx={{ mt: 2 }}>
                            {result.errors.length > 0 ? (
                                <Alert severity="error">
                                    Imported {result.inserted} records. {result.errors.length} error(s): {result.errors.map((e: any) => e.message || e).join(', ')}
                                </Alert>
                            ) : (
                                <Alert severity="success">
                                    Successfully imported {result.inserted} redox data records.
                                </Alert>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RedoxDataImport;
