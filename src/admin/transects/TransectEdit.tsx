import {
    Edit,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    TextInput,
    required,
    ArrayInput,
    SimpleFormIterator,
    useRedirect,
    useUpdate,
    SaveContextProvider,
    useNotify,
    useRecordContext,
    Toolbar,
    SaveButton,
} from 'react-admin';
import TransectCreateMap from '../maps/Transects';
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

const TransectArrayInput = ({ setNodes }) => {
    const { watch } = useFormContext();
    const selectedNodes = watch('nodes');
    useEffect(() => {
        if (selectedNodes) {
            setNodes(
                selectedNodes.map((node, index) => ({
                    plot_id: node.plot.id,
                    order: index,
                }))
            );
        }
    }, [selectedNodes, setNodes]);
    return (
        <ArrayInput source="nodes">
            <SimpleFormIterator getItemLabel={(index) => `#${index + 1}`} inline>
                <TextInput source="plot.name" readOnly />
            </SimpleFormIterator>
        </ArrayInput>
    );
};
const MyToolbar = () => (
    <Toolbar>
        <SaveButton alwaysEnable />
    </Toolbar>
);

const TransectEditForm = () => {
    const record = useRecordContext();
    const [update, { isPending }] = useUpdate();
    if (!record) { return null; }
    const [selectedArea, setSelectedArea] = useState(record?.area_id);
    const [nodes, setNodes] = useState([]);

    const redirect = useRedirect();
    const notify = useNotify();

    const save = (data) => {
        update(
            'transects',
            {
                id: record.id,
                data: {
                    name: data.name,
                    description: data.description,
                    area_id: data.area_id,
                    nodes: nodes,
                },
                previousData: record,
            },
            {
                onSuccess: () => {
                    redirect('show', 'transects', record.id);
                },
                onError: (error) => {
                    console.error("Update error", error);
                    notify("Error updating transect", { type: 'warning' });
                },
            }
        );
    };
    
    const saving = false;
    const mutationMode = "pessimistic";
    
    return (
        <SaveContextProvider value={{ save, saving, mutationMode }}>
        <SimpleForm onSubmit={save}>
                <TextInput source="id" disabled />
                <TextInput source="name" validate={[required()]} />
                <ReferenceInput source="area_id" reference="areas">
                    <SelectInput
                        optionText={(record) => `${record.name} (${record.plots.length} plots)`}
                        validate={[required()]}
                        onChange={(record) => setSelectedArea(record.target.value)}
                    />
                </ReferenceInput>
                {selectedArea ? <TransectCreateMap area_id={selectedArea} /> : null}
                <TransectArrayInput setNodes={setNodes} />
            </SimpleForm>
        </SaveContextProvider>
        
    );
};

const TransectEdit = (props) => (
    <Edit {...props}>
        <TransectEditForm />
    </Edit>
);

export default TransectEdit;
