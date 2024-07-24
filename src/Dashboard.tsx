import { usePermissions } from 'react-admin';
import { Typography } from '@mui/material';

const Dashboard = () => {
    const { permissions } = usePermissions();

    return (
        <><Typography
            variant="h4"
            align='center'
            gutterBottom>
            Welcome to the SOIL Sensor Map
        </Typography>
            {(permissions && permissions === 'admin') ? (

                <Typography
                    variant="body"
                    align='center'
                    gutterBottom>
                    Use the menu to the left to navigate the site.
                </Typography>

            ) : (
                <Typography
                    variant="body"
                    align='center'
                    gutterBottom>
                    You do not have permission to view this page. Contact a member of the SOIL lab for access.
                </Typography>
            )
            }
        </>
    );
};





export default Dashboard;