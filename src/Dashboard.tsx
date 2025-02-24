import { usePermissions } from 'react-admin';
import { Typography } from '@mui/material';
import FrontendMap from './maps/FrontendMap';
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
                <FrontendMap />
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