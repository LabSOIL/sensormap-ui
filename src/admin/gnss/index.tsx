import GNSSCreate from './Create';
// import GNSSEdit from './GNSSEdit';
import GNSSList from './List';
import GNSSShow from './Show';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';

export default {
    create: GNSSCreate,
    // edit: GNSSEdit,
    list: GNSSList,
    show: GNSSShow,
    recordRepresentation: 'name.en',
    options: {
        label: "GNSS"
    },
    icon: SatelliteAltIcon
};
