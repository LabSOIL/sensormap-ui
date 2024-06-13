import { Typography } from '@mui/material';
import { useMutation } from 'react-query';
/* eslint react/jsx-key: off */
import {
    Create,
    SimpleForm,
    useDataProvider,
    SaveContextProvider,
    FileInput,
    FileField,
    useRedirect,
} from 'react-admin';
import { useState } from 'react';

const PlotSampleCreateMany = () => {
    const dataProvider = useDataProvider();
    const [errors, setErrors] = useState([]);
    const redirect = useRedirect();
    const save = async (data) => {
        try {
            const response = await dataProvider.createMany(
                'plot_samples', { data }
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
        redirect('list', 'plot_samples');
    }
    return (
        <><Create redirect="list" >
            <SaveContextProvider value={{ save: save }} >
                <SimpleForm >
                    <Typography variant="h6">Upload a CSV containing the plot sample data</Typography>
                    <Typography variant="body3">The CSV must contain the following header:</Typography>
                    <Typography variant="caption"><i>project_name,fullname,plot_id,name,area_name,gradient,upper_depth_cm,lower_depth_cm,ph,rh,loi,c ,n,cn,clay_percent,silt_percent,sand_percent,fe_ug_per_g,na_ug_per_g,k_ug_per_g,ca_ug_per_g,mg_ug_per_g,al_ug_per_g,mn_ug_per_g,s_ug_per_g,cl_ug_per_g,p_ug_per_g,si_ug_per_g,sample_weight,subsample_weight,subsample_replica_weight
                    </i></Typography>
                    <Typography variant="caption">Where <i>project_name</i> and <i>area_name</i> refers to the name of the Projects and Areas that the plot samples will be assigned to respectively. Duplicates are not allowed, and any errors will be shown after uploading.</Typography>

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

export default PlotSampleCreateMany;
