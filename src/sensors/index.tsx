import SensorCreate from './Create';
import SensorEdit from './Edit';
import SensorList from './List';
import SensorShow from './Show';
import SensorDataCreate from './data/SensorDataCreate';
import SensorDataEdit from './data/SensorDataEdit';
import SensorDataShow from './data/SensorDataShow';
import SensorsIcon from '@mui/icons-material/Sensors';
import SensorProfileCreate from './profiles/SensorProfileCreate';
import SensorProfileEdit from './profiles/SensorProfileEdit';
import SensorProfileShow from './profiles/SensorProfileShow';
import SensorProfileList from './profiles/SensorProfileList';
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