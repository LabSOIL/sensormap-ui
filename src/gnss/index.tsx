import GNSSCreate from './GNSSCreate';
// import GNSSEdit from './GNSSEdit';
import GNSSList from './GNSSList';
import GNSSShow from './GNSSShow';
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
