import {
    Create,
    SimpleForm,
    useDataProvider,
    SaveContextProvider,
    FileInput,
    FileField,
    useRedirect,
} from 'react-admin';
import { Typography } from '@mui/material';
import { useState } from 'react';

const PlotCreateMany = () => {
    const dataProvider = useDataProvider();
    const [errors, setErrors] = useState([]);
    const redirect = useRedirect();
    const save = async (data) => {
        try {
            const response = await dataProvider.createMany(
                'plots', { data }
            );
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error) {
            if (onFailure) {
                onFailure(error);
            }
        }
    };

    const onFailure = (error) => {
        setErrors(error.body.detail.errors);
    }
    const onSuccess = () => {
        redirect('list', 'plots');
    }
    return (
        <><Create redirect="list" >
            <SaveContextProvider value={{ save: save }} >
                <SimpleForm >
                    Upload a CSV containing the plot data:
                    <FileInput
                        label="Plot sample data (.csv)"
                        accept=".csv"
                        source="attachment"
                        multiple={false}
                    >
                        <FileField source="src" title="title" />
                    </FileInput>

                    {errors ? (
                        <><Typography variant='h6'>Validation errors:</Typography>
                            <Typography variant='caption'>No changes have been made. Fix the below errors before resubmitting. </Typography>
                            <ul>
                                {errors?.map((error, i) => (
                                    <li key={i}>
                                        Line {error.csv_line + 1}: {error.message}
                                    </li>
                                ))}
                            </ul>
                        </>) : <></>}
                </SimpleForm>
            </SaveContextProvider>
        </Create >
        </>
    )
};

export default PlotCreateMany;
