import {
    Create,
    SimpleForm,
    useDataProvider,
    SaveContextProvider,
    FileInput,
    FileField,
    useRedirect,
    useNotify,
} from 'react-admin';
import { Typography } from '@mui/material';
import { useState } from 'react';

const PlotCreateMany = () => {
    const dataProvider = useDataProvider();
    const [errors, setErrors] = useState([]);
    const redirect = useRedirect();
    const notify = useNotify();
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
        // If 400 or 500 error, show error message
        // If the body detail is str and not list), it means that the error is
        // not a validation error and simply provide notification
        if (typeof error.body.detail === 'string') {
            notify(`Error: ${error.body.detail}`, 'error');
        }

        if (error.body) {
            setErrors(error.body.detail.errors);
        }
    }
    const onSuccess = () => {
        redirect('list', 'plots');
    }
    return (
        <><Create redirect="list" >
            <SaveContextProvider value={{ save: save }} >
                <SimpleForm >
                    <Typography variant="h6">Upload a CSV containing the plot data</Typography>
                    <Typography variant="body3">The CSV must contain the following header:</Typography>
                    <Typography variant="caption"><i>project_name,id,area_name,gradient,date,coord_z,coord_x,coord_y,slope,aspect,weather,topography,vegetation_type,lithology</i></Typography>
                    <Typography variant="caption">Where <i>project_name</i> refers to the name of the Project that the plot will be assigned to. Duplicates are not allowed, and any errors will be shown after uploading.</Typography>
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
