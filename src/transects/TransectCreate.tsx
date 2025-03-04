import {
    Create,
    ReferenceInput,
    SelectInput,
    SimpleForm,
    required,
    ArrayInput,
    SimpleFormIterator,
    TextInput,
    SaveContextProvider,
    useCreate,
    useRedirect,
} from 'react-admin';
import TransectCreateMap from '../maps/Transects';
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

const TransectArrayInput = ({ setNodes }) => {
    const { watch } = useFormContext();
    const selectedNodes = watch('nodes');
    useEffect(() => {
        if (selectedNodes) {
            setNodes(selectedNodes.map((node, index) => {
                return {
                    plot_id: node.plot.id,
                    order: index
                }
            }));
        }
    }, [selectedNodes]);

    return (
        <>
            <ArrayInput source="nodes" >
                <SimpleFormIterator getItemLabel={index => `#${index + 1}`} inline >
                    <TextInput source="plot.name" readOnly />
                </SimpleFormIterator>
            </ArrayInput >
        </>
    )
};
const TransectCreate = () => {
    const [selectedArea, setSelectedArea] = useState(null);
    const [create, { data: createData, isPending, error }] = useCreate();
    const [nodes, setNodes] = useState([]);
    const redirect = useRedirect();
    const save = data => {
        create('transects', {
            data: {
                name: data.name,
                description: data.description,
                area_id: data.area_id,
                nodes: nodes
            }
        });
    }
    
    useEffect(() => {
        if (createData && !isPending && !error) {
            redirect('show', 'transects', createData.id);
        }
        
    }, [createData]);
    
    const saving = false;
    const mutationMode = "pessimistic";
    
    return (
        <SaveContextProvider value={{ save, saving, mutationMode }}>
            <SimpleForm>
                <TextInput source="name" validate={[required()]} />
                <ReferenceInput source="area_id" reference="areas" >
                    <SelectInput
                        optionText={(record) => `${record.name} (${record.plots.length} plots)`}
                        validate={[required()]}
                        onChange={(record) => { setSelectedArea(record.target.value) }} />
                </ReferenceInput>
                {selectedArea ? <TransectCreateMap area_id={selectedArea} /> : null}
                <TransectArrayInput setNodes={setNodes} />
            </SimpleForm>
        </SaveContextProvider>
    );
}


export default TransectCreate;
