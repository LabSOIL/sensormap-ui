import { Menu } from 'react-admin';
import SubMenu from "./SubMenu";
import LabelIcon from '@mui/icons-material/Label';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ExpandMore from "@mui/icons-material/ExpandMore";
import sensors from '../sensors';

export const MyMenu = () => (
    <Menu>
        <Menu.DashboardItem primaryText="Welcome"/>
        <hr style={{ width: '70%' }} />
        <Menu.ResourceItem name="projects" />
        <SubMenu text="Fieldwork" icon={<ExpandMore/>}>            
            <Menu.ResourceItem name="areas" />
            <Menu.ResourceItem name="plots" />
            <Menu.ResourceItem name="samples" />
            <Menu.ResourceItem name="sensor_profiles" />
            <Menu.ResourceItem name="soil_profiles" />
            <Menu.ResourceItem name="transects" />
        </SubMenu>
        <SubMenu text="Data & Definitions" icon={<ExpandMore/>}>
            <Menu.ResourceItem name="gnss" />
            <Menu.ResourceItem name="soil_types" />
            <Menu.ResourceItem name="sensors" />
        </SubMenu>
        <hr style={{ width: '70%' }} />
        <Menu.ResourceItem name="instruments" />
    </Menu>
);