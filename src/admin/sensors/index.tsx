import SensorCreate from './Create';
import SensorEdit from './Edit';
import SensorList from './List';
import SensorShow from './Show';
import SensorDataCreate from './data/Create';
import SensorDataEdit from './data/Edit';
import SensorDataShow from './data/Show';
import SensorsIcon from '@mui/icons-material/Sensors';
import SensorProfileCreate from './profiles/Create';
import SensorProfileEdit from './profiles/Edit';
import SensorProfileShow from './profiles/Show';
import SensorProfileList from './profiles/List';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import SensorAssignmentCreate from './assignments/Create';
import SensorAssignmentEdit from './assignments/Edit';
import SensorAssignmentList from './assignments/List';
import SensorAssignmentShow from './assignments/Show';
import SensorAssignmentIcon from '@mui/icons-material/Assignment';
import FluxDataCreate from './flux_data/Create';
import FluxDataEdit from './flux_data/Edit';
import FluxDataList from './flux_data/List';
import FluxDataShow from './flux_data/Show';
import RedoxDataCreate from './redox_data/Create';
import RedoxDataEdit from './redox_data/Edit';
import RedoxDataList from './redox_data/List';
import RedoxDataShow from './redox_data/Show';
import Co2Icon from '@mui/icons-material/Co2';
import ScienceIcon from '@mui/icons-material/Science';
const assignments = {
    create: SensorAssignmentCreate,
    edit: SensorAssignmentEdit,
    list: SensorAssignmentList,
    show: SensorAssignmentShow,
    icon: SensorAssignmentIcon,
    recordRepresentation: 'name',
    options: {
        label: 'Assignments',
    },
}
const profile = {
    create: SensorProfileCreate,
    edit: SensorProfileEdit,
    list: SensorProfileList,
    show: SensorProfileShow,
    icon: DeviceThermostatIcon,
    // recordRepresentation: 'name',
    options: {
        label: 'Profiles',
    },
};
const sensor = {
    create: SensorCreate,
    edit: SensorEdit,
    list: SensorList,
    show: SensorShow,
    icon: SensorsIcon,
    // recordRepresentation: 'name',
    options: {
        label: 'Instruments',
    },
};

const sensordata = {
    create: SensorDataCreate,
    edit: SensorDataEdit,
    show: SensorDataShow,
};

const flux_data = {
    create: FluxDataCreate,
    edit: FluxDataEdit,
    list: FluxDataList,
    show: FluxDataShow,
    icon: Co2Icon,
    options: { label: 'Flux Data' },
};

const redox_data = {
    create: RedoxDataCreate,
    edit: RedoxDataEdit,
    list: RedoxDataList,
    show: RedoxDataShow,
    icon: ScienceIcon,
    options: { label: 'Redox Data' },
};

export default {
    sensor,
    sensordata,
    profile,
    assignments,
    flux_data,
    redox_data,
};