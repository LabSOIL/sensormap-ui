import {
    List,
    Datagrid,
    TextField,
    TextInput,
    useGetList,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    DateField,
    Link,
    useRecordContext,
    Loading,
    useCreatePath,
} from "react-admin";
import { stopPropagation } from "ol/events/Event";

const postFilters = [
    <TextInput label="Search" source="q" alwaysOn />,
];

const ListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /></>}
            <ExportButton />
        </TopToolbar>
    );
}

const AreaNameField = () => {
    const record = useRecordContext();
    const createPath = useCreatePath();
    const path = createPath({
        resource: 'areas',
        type: 'show',
        id: record.area.id,
    });

    return (
        <Link to={path} onClick={stopPropagation}>
            <TextField source="area.name" label="Area" />
        </Link>
    );
}

export const TransectList = () => {
    const FieldWrapper = ({ children, label }) => children;
    const { data, total, isLoading, error } = useGetList('areas', {});
    if (isLoading) return <Loading />;

    return (
        <List
            filters={postFilters}
            actions={<ListActions />}
            storeKey={false}
            perPage={25}
        >
            <Datagrid rowClick="show">
                <TextField source="id" />
                <FieldWrapper label="Area"><AreaNameField /></FieldWrapper>
                <TextField source="name" />
                <DateField source="last_updated" />
            </Datagrid>
        </List >
    );
};

export default TransectList;
