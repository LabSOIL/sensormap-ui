import { useState, useCallback } from 'react';
import {
    Title,
    useDataProvider,
    useNotify,
    useGetList,
} from 'react-admin';
import { useAuthProvider } from 'ra-core';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    CircularProgress,
    Box,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface RawReading {
    t: number;
    co2: number;
    ch4: number;
    h2o: number;
    temp: number;
    press: number;
    soilp: number | null;
}

interface ParsedFluxRecord {
    collarName: string;
    sensorprofile_id: string | null;
    measured_on: string;
    replicate: string;
    setting: string;
    raw_readings: RawReading[];
}

const FluxDataImport = () => {
    const [areaId, setAreaId] = useState<string | null>(null);
    const [profilesById, setProfilesById] = useState<Record<string, string>>({});
    const [parsedRecords, setParsedRecords] = useState<ParsedFluxRecord[]>([]);
    const [matchWarnings, setMatchWarnings] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ inserted: number; errors: any[] } | null>(null);

    const dataProvider = useDataProvider();
    const authProvider = useAuthProvider();
    const notify = useNotify();

    const { data: areas, isLoading: areasLoading } = useGetList('areas', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'name', order: 'ASC' },
    });

    // Fetch chamber profiles for the selected area
    const handleAreaChange = useCallback(async (newAreaId: string) => {
        setAreaId(newAreaId);
        setParsedRecords([]);
        setMatchWarnings([]);
        setResult(null);

        try {
            const { data: profiles } = await dataProvider.getList('sensor_profiles', {
                pagination: { page: 1, perPage: 1000 },
                sort: { field: 'name', order: 'ASC' },
                filter: { area_id: newAreaId, profile_type: 'chamber' },
            });

            const byCollar: Record<string, string> = {};
            for (const p of profiles) {
                // Match collar names like "col_1" from profile name or chamber_id_external
                const ext = p.chamber_id_external || p.name || '';
                const match = ext.match(/col[_]?(\d+)/i) || ext.match(/BAL(\d+)/i);
                if (match) {
                    byCollar[`col_${match[1]}`] = p.id;
                }
            }
            setProfilesById(byCollar);
        } catch (e) {
            notify('Failed to load sensor profiles', { type: 'error' });
        }
    }, [dataProvider, notify]);

    // Parse uploaded JSON files
    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const records: ParsedFluxRecord[] = [];
        const warnings: string[] = [];

        for (const file of Array.from(files)) {
            try {
                const text = await file.text();
                const json = JSON.parse(text);

                for (const dataset of json.datasets || []) {
                    for (const [collarName, collarData] of Object.entries(dataset) as [string, any][]) {
                        const reps = collarData?.reps;
                        if (!reps) continue;

                        for (const [repKey, repData] of Object.entries(reps) as [string, any][]) {
                            const header = repData?.header;
                            const data = repData?.data;
                            if (!header || !data) continue;

                            const timestamps: number[] = data.timestamp || [];
                            if (timestamps.length === 0) continue;

                            const co2: number[] = data.co2 || [];
                            const ch4: number[] = data.ch4 || [];
                            const h2o: number[] = data.h2o || [];
                            const chamber_t: number[] = data.chamber_t || [];
                            const chamber_p: number[] = data.chamber_p || [];
                            const soilp_m: number[] = data.soilp_m || [];

                            const raw_readings: RawReading[] = timestamps.map((t, i) => ({
                                t,
                                co2: co2[i] ?? 0,
                                ch4: ch4[i] ?? 0,
                                h2o: h2o[i] ?? 0,
                                temp: chamber_t[i] ?? 0,
                                press: chamber_p[i] ?? 0,
                                soilp: soilp_m[i] === 9999 ? null : (soilp_m[i] ?? null),
                            }));

                            const setting = repKey === 'REP_1' ? 'uncovered' : 'covered';
                            const measured_on = new Date(
                                header.Date.replace(' ', 'T') + 'Z'
                            ).toISOString();

                            const profileId = profilesById[collarName] || null;
                            if (!profileId) {
                                warnings.push(`No profile match for "${collarName}" in ${file.name}`);
                            }

                            records.push({
                                collarName,
                                sensorprofile_id: profileId,
                                measured_on,
                                replicate: repKey,
                                setting,
                                raw_readings,
                            });
                        }
                    }
                }
            } catch (err) {
                warnings.push(`Failed to parse ${file.name}: ${err}`);
            }
        }

        setParsedRecords(records);
        setMatchWarnings(warnings);
        setResult(null);
    }, [profilesById]);

    // Submit batch
    const handleSubmit = useCallback(async () => {
        const validRecords = parsedRecords.filter(r => r.sensorprofile_id);
        if (validRecords.length === 0) {
            notify('No valid records to submit (all missing profile matches)', { type: 'warning' });
            return;
        }

        setSubmitting(true);
        try {
            const token = await (authProvider as any).getToken();
            const payload = validRecords.map(r => ({
                sensorprofile_id: r.sensorprofile_id,
                measured_on: r.measured_on,
                replicate: r.replicate,
                setting: r.setting,
                raw_readings: r.raw_readings,
            }));

            const response = await fetch('/api/flux_data/ingest_batch', {
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
            notify(`Imported ${data.inserted} flux records`, { type: 'success' });
        } catch (err: any) {
            notify(`Import failed: ${err.message}`, { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    }, [parsedRecords, authProvider, notify]);

    const validCount = parsedRecords.filter(r => r.sensorprofile_id).length;
    const unmatchedCount = parsedRecords.length - validCount;

    return (
        <Card>
            <Title title="Import Flux Data" />
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Import Raw LI-7810 Flux Data
                </Typography>

                {/* Area selector */}
                <FormControl fullWidth sx={{ mb: 2, maxWidth: 400 }}>
                    <InputLabel>Area</InputLabel>
                    <Select
                        value={areaId || ''}
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
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Matched collar profiles: {Object.keys(profilesById).length > 0
                            ? Object.entries(profilesById).map(([k, v]) => `${k}`).join(', ')
                            : 'None found — create chamber profiles first'}
                    </Typography>
                )}

                {/* File input */}
                {areaId && (
                    <Box sx={{ mb: 2 }}>
                        <input
                            type="file"
                            multiple
                            accept=".json"
                            onChange={handleFileChange}
                        />
                    </Box>
                )}

                {/* Warnings */}
                {matchWarnings.map((w, i) => (
                    <Alert key={i} severity="warning" sx={{ mb: 1 }}>
                        {w}
                    </Alert>
                ))}

                {/* Preview table */}
                {parsedRecords.length > 0 && (
                    <>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                            Preview ({parsedRecords.length} records, {validCount} matched, {unmatchedCount} unmatched)
                        </Typography>
                        <Table size="small" sx={{ mb: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Collar</TableCell>
                                    <TableCell>Profile</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Replicate</TableCell>
                                    <TableCell>Setting</TableCell>
                                    <TableCell>Readings</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {parsedRecords.map((r, i) => (
                                    <TableRow key={i} sx={!r.sensorprofile_id ? { backgroundColor: '#fff3e0' } : {}}>
                                        <TableCell>{r.collarName}</TableCell>
                                        <TableCell>{r.sensorprofile_id ? '✓' : '✗ missing'}</TableCell>
                                        <TableCell>{new Date(r.measured_on).toLocaleString()}</TableCell>
                                        <TableCell>{r.replicate}</TableCell>
                                        <TableCell>{r.setting}</TableCell>
                                        <TableCell>{r.raw_readings.length}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Submit */}
                        <Button
                            variant="contained"
                            startIcon={submitting ? <CircularProgress size={20} /> : <UploadFileIcon />}
                            onClick={handleSubmit}
                            disabled={submitting || validCount === 0}
                        >
                            {submitting ? 'Importing...' : `Import ${validCount} records`}
                        </Button>
                    </>
                )}

                {/* Result */}
                {result && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Successfully imported {result.inserted} records.
                        {result.errors.length > 0 && ` ${result.errors.length} errors occurred.`}
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default FluxDataImport;
