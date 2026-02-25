import { useState } from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    DateField,
    ReferenceField,
    EditButton,
    TopToolbar,
    DeleteButton,
    usePermissions,
    FunctionField,
    useRecordContext,
} from 'react-admin';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const RawReadingsTable = ({ data }: { data: Array<Record<string, number | null>> }) => (
    <TableContainer component={Paper} sx={{ maxHeight: 400, mt: 1 }}>
        <Table size="small" stickyHeader>
            <TableHead>
                <TableRow>
                    <TableCell>t (s)</TableCell>
                    <TableCell>CO₂ (ppm)</TableCell>
                    <TableCell>CH₄ (ppb)</TableCell>
                    <TableCell>H₂O (mmol/mol)</TableCell>
                    <TableCell>Temp (°C)</TableCell>
                    <TableCell>Press (kPa)</TableCell>
                    <TableCell>Soil P</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((row, idx) => (
                    <TableRow key={idx}>
                        <TableCell>{row.t}</TableCell>
                        <TableCell>{row.co2}</TableCell>
                        <TableCell>{row.ch4}</TableCell>
                        <TableCell>{row.h2o}</TableCell>
                        <TableCell>{row.temp}</TableCell>
                        <TableCell>{row.press}</TableCell>
                        <TableCell>{row.soilp ?? '—'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

const RawReadingsField = () => {
    const record = useRecordContext();
    const [showRaw, setShowRaw] = useState(false);

    if (!record) return null;

    return (
        <div style={{ marginTop: 16 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Raw Readings
            </Typography>
            {record.raw_readings ? (
                <>
                    <Typography variant="body2">
                        {record.raw_readings.length} data points available
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setShowRaw(!showRaw)}
                        sx={{ mt: 1 }}
                    >
                        {showRaw ? 'Hide Raw Data' : 'Show Raw Data'}
                    </Button>
                    {showRaw && <RawReadingsTable data={record.raw_readings} />}
                </>
            ) : (
                <Typography variant="body2" color="textSecondary">
                    No raw data
                </Typography>
            )}
        </div>
    );
};

const FluxDataShowActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && (
                <>
                    <EditButton />
                    <DeleteButton />
                </>
            )}
        </TopToolbar>
    );
};

const FluxDataShow = () => (
    <Show actions={<FluxDataShowActions />}>
        <SimpleShowLayout>
            <TextField source="id" />
            <ReferenceField source="sensorprofile_id" reference="sensor_profiles" link="show">
                <TextField source="name" />
            </ReferenceField>
            <DateField source="measured_on" showTime />
            <TextField source="replicate" />
            <TextField source="setting" />
            <NumberField source="flux_co2_umol_m2_s" label="CO2 flux (umol/m2/s)" />
            <NumberField source="flux_ch4_nmol_m2_s" label="CH4 flux (nmol/m2/s)" />
            <NumberField source="flux_h2o_umol_m2_s" label="H2O flux (umol/m2/s)" />
            <NumberField source="r2_co2" label="R2 CO2" />
            <NumberField source="r2_ch4" label="R2 CH4" />
            <NumberField source="r2_h2o" label="R2 H2O" />
            <NumberField source="swc" label="Soil Water Content" />
            <NumberField source="n_measurements" label="N Measurements" />
            <RawReadingsField />
        </SimpleShowLayout>
    </Show>
);

export default FluxDataShow;
