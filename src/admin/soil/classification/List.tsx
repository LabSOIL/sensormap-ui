import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    ReferenceField,
} from "react-admin";
import { postFilters } from "../../filters/list";

const SoilClassificationListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
};

export const SoilClassificationList = () => {
    return (
        <List
            filters={postFilters}
            actions={<SoilClassificationListActions />}
            storeKey={false}
        >
            <Datagrid rowClick="show">
                <DateField source="created_on" label="Date Created" />
                <DateField source="sample_date" label="Sample Date" />
                <ReferenceField
                    source="soil_type_id"
                    reference="soil_types"
                    label="Soil Type"
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceField
                    source="area_id"
                    reference="areas"
                    label="Area"
                    link="show"
                >
                    <TextField source="name" />
                </ReferenceField>
                <NumberField source="depth_upper_cm" label="Depth Upper (cm)" />
                <NumberField source="depth_lower_cm" label="Depth Lower (cm)" />
                <NumberField
                    source="fe_abundance_g_per_cm3"
                    label="Fe Abundance (g/cm³)"
                />
            </Datagrid>
        </List>
    );
};

export default SoilClassificationList;
