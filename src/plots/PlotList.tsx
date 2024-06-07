import {
    List,
    Datagrid,
    TextField,
    ReferenceManyCount,
    useGetList,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    useRedirect,
    ReferenceField,
    DateField,
    FunctionField,
    Button,
    Count,
    Link,
    useRecordContext,
    Loading,
    useCreatePath,
    BulkDeleteButton,
} from "react-admin";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import { stopPropagation } from "ol/events/Event";
import { Fragment } from "react/jsx-runtime";


const CreateManyButton = () => {
    const redirect = useRedirect();
    return (
        <Button
            label="Create Many"
            onClick={(event) => {
                redirect('/plots/createMany');
            }}
            startIcon={<LibraryAddIcon fontSize='inherit' />}
        />

    )
}
const PlotListActions = () => {
    const { permissions } = usePermissions();
    return (
        <TopToolbar>
            {permissions === 'admin' && <><CreateButton /><CreateManyButton /></>}
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

const PlotBulkActionButtons = props => (
    <Fragment>
        {/* <ResetViews label="Reset Views" {...props} /> */}
        {/* Add the default bulk delete action */}
        <BulkDeleteButton {...props} />
    </Fragment>
);
export const PlotList = () => {
    const FieldWrapper = ({ children, label }) => children;
    const { data, total, isLoading, error } = useGetList(
        'areas', {}
    );
    function toTitleCase(text) {
        return text.toLowerCase().replace(
            /(?<![^\s\p{Pd}])[^\s\p{Pd}]/ug, match => match.toUpperCase()
        );
    }
    if (isLoading) return <Loading />;

    return (
        <List
            actions={<PlotListActions />}
            storeKey={false}
            empty={false}
            perPage={25}
        >
            <Datagrid
                rowClick="show"
                bulkActionButtons={<PlotBulkActionButtons />}
            >
                <TextField source="name" />
                <FieldWrapper label="Area"><AreaNameField /></FieldWrapper>
                <FunctionField render={record => `${toTitleCase(record.gradient)}`} label="Gradient" />
                <TextField source="coord_x" label="X (m)" />
                <TextField source="coord_y" label="Y (m)" />
                <TextField source="coord_z" label="Elevation (m)" />
                <TextField source="slope" label="Slope (°)" />
                <DateField source="created_on" />
                <FunctionField render={record => `${record.samples.length}`} label="Samples" />
                <ReferenceField label="Soil Type" source="soil_type_id" reference="soil_types">
                    <TextField source="name" />
                </ReferenceField>
            </Datagrid>
        </List >
    );
};


// const link =
// resourceLinkPath === false ||
// (resourceLinkPath === 'edit' && !resourceDefinition.hasEdit) ||
// (resourceLinkPath === 'show' && !resourceDefinition.hasShow)
//     ? false
//     : createPath({
//           resource: reference,
//           id: referenceRecord.id,
//           type:
//               typeof resourceLinkPath === 'function'
//                   ? resourceLinkPath(referenceRecord, reference)
//                   : resourceLinkPath,
//       });

// let child = children || (
// <Typography component="span" variant="body2">
//     {getRecordRepresentation(referenceRecord)}
// </Typography>
// );

// if (link) {
// return (
//     <Root className={className} sx={sx}>
//         <RecordContextProvider value={referenceRecord}>
//             <Link
//                 to={link}
//                 className={ReferenceFieldClasses.link}
//                 onClick={stopPropagation}
//                 state={{ _scrollToTop: true }}
//             >
//                 {child}
//             </Link>
//         </RecordContextProvider>
//     </Root>
// );
// }

export default PlotList;
