import SensorCreate from './SensorCreate';
import SensorEdit from './SensorEdit';
import SensorList from './SensorList';
import SensorShow from './SensorShow';
import SensorDataCreate from './SensorDataCreate';
import SensorDataEdit from './SensorDataEdit';
import SensorDataShow from './SensorDataShow';
import SensorsIcon from '@mui/icons-material/Sensors';

const sensor = {
    create: SensorCreate,
    edit: SensorEdit,
    list: SensorList,
    show: SensorShow,
    icon: SensorsIcon
};


const sensordata = {
    create: SensorDataCreate,
    edit: SensorDataEdit,
    show: SensorDataShow,
};

export default {
    sensor,
    sensordata,
};