import { Menu } from 'react-admin';
import SubMenu from "./SubMenu";
import LabelIcon from '@mui/icons-material/Label';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ExpandMore from "@mui/icons-material/ExpandMore";
import sensors from '../sensors';

export const MyMenu = () => (
    <Menu>
        <Menu.DashboardItem primaryText="Welcome" />
        <hr style={{ width: '70%' }} />
        <SubMenu text="Fieldwork" icon={<ExpandMore />}>
            <Menu.ResourceItem name="projects" />
            <Menu.ResourceItem name="areas" />
            <Menu.ResourceItem name="plots" />
            <Menu.ResourceItem name="plot_samples" />
            <Menu.ResourceItem name="transects" />
            <Menu.ResourceItem name="gnss" />
        </SubMenu>
        {/* <Menu.ResourceItem name="sensor_profiles" /> */}
        {/* <Menu.ResourceItem name="soil_profiles" /> */}
        {/* </SubMenu> */}
        <SubMenu text="Soil" icon={<ExpandMore />}>
            <Menu.ResourceItem name="soil_classifications" />
            <Menu.ResourceItem name="soil_profiles" />
            <Menu.ResourceItem name="soil_types" />
            {/* <Menu.ResourceItem name="sensors" /> */}
            {/* <Menu.ResourceItem name="sensor_profile_assignments" /> */}
        </SubMenu>
        <SubMenu text="Sensors" icon={<ExpandMore />}>
            <Menu.ResourceItem name="sensor_profile_assignments" />
            <Menu.ResourceItem name="sensors" />
            <Menu.ResourceItem name="sensor_profiles" />
        </SubMenu>

        <hr style={{ width: '70%' }} />
        <Menu.ResourceItem name="instruments" />
    </Menu>
);