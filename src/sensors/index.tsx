import SensorCreate from './SensorCreate';
import SensorEdit from './SensorEdit';
import SensorList from './SensorList';
import SensorShow from './SensorShow';
import SensorDataCreate from './SensorDataCreate';
import SensorDataEdit from './SensorDataEdit';
import SensorDataShow from './SensorDataShow';
import SensorsIcon from '@mui/icons-material/Sensors';
import SensorProfileCreate from './SensorProfileCreate';
import SensorProfileEdit from './SensorProfileEdit';
import SensorProfileShow from './SensorProfileShow';
import SensorProfileList from './SensorProfileList';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SensorAssignmentCreate from './assignments/Create';
import SensorAssignmentEdit from './assignments/Edit';
import SensorAssignmentList from './assignments/List';
import SensorAssignmentShow from './assignments/Show';
import SensorAssignmentIcon from '@mui/icons-material/Assignment';
const assignments = {
    create: SensorAssignmentCreate,
    edit: SensorAssignmentEdit,
    list: SensorAssignmentList,
    show: SensorAssignmentShow,
    icon: SensorAssignmentIcon,
    recordRepresentation: 'name',
    options: {
        label: 'Sensor assignments',
    },
}
const profile = {
    create: SensorProfileCreate,
    edit: SensorProfileEdit,
    list: SensorProfileList,
    show: SensorProfileShow,
    icon: DeviceThermostatIcon,
    // recordRepresentation: 'name',
};
const sensor = {
    create: SensorCreate,
    edit: SensorEdit,
    list: SensorList,
    show: SensorShow,
    icon: SensorsIcon,
    // recordRepresentation: 'name',
    options: {
        label: 'Sensor instruments',
    },
};

const sensordata = {
    create: SensorDataCreate,
    edit: SensorDataEdit,
    show: SensorDataShow,
};

export default {
    sensor,
    sensordata,
    profile,
    assignments,
};