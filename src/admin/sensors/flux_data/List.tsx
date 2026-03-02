import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    ReferenceField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    Button,
} from "react-admin";
import { useNavigate } from "react-router-dom";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FluxDataListActions = () => {
    const { permissions } = usePermissions();
    const navigate = useNavigate();
    return (
        <TopToolbar>
            {permissions === 'admin' && <CreateButton />}
            {permissions === 'admin' && (
                <Button label="Import" startIcon={<UploadFileIcon />} onClick={() => navigate('/flux_data/import')} />
            )}
            <ExportButton />
        </TopToolbar>
    );
};

const FluxDataList = () => {
    const { permissions } = usePermissions();

    return (
        <List
            storeKey={false}
            actions={<FluxDataListActions />}
            perPage={25}
            sort={{ field: 'measured_on', order: 'DESC' }}
        >
            <Datagrid
                bulkActionButtons={permissions === 'admin' ? undefined : false}
                rowClick="show"
            >
                <ReferenceField source="sensorprofile_id" reference="sensor_profiles" link="show" label="Profile">
                    <TextField source="name" />
                </ReferenceField>
                <DateField source="measured_on" showTime label="Measured On" />
                <TextField source="replicate" />
                <TextField source="setting" />
                <NumberField source="flux_co2_umol_m2_s" label="CO2 (umol/m2/s)" />
                <NumberField source="flux_ch4_nmol_m2_s" label="CH4 (nmol/m2/s)" />
            </Datagrid>
        </List>
    );
};

export default FluxDataList;
