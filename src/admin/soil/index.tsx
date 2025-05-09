import SoilTypeCreate from './type/Create';
import SoilTypeEdit from './type/Edit';
import SoilTypeList from './type/List';
import SoilTypeShow from './type/Show';
import SoilProfileCreate from './profile/Create';
import SoilProfileEdit from './profile/Edit';
import SoilProfileList from './profile/List';
import SoilProfileShow from './profile/Show';
import FilterHdrIcon from '@mui/icons-material/FilterHdr';
import TerrainIcon from '@mui/icons-material/Terrain';
import GrassIcon from '@mui/icons-material/Grass';
import SoilClassificationCreate from './classification/Create';
import SoilClassificationEdit from './classification/Edit';
import SoilClassificationList from './classification/List';
import SoilClassificationShow from './classification/Show';
import SearchIcon from '@mui/icons-material/Search';


const SoilProfile = {
    create: SoilProfileCreate,
    edit: SoilProfileEdit,
    list: SoilProfileList,
    show: SoilProfileShow,
    recordRepresentation: 'name',
    icon: FilterHdrIcon,
    options: {
        label: 'Profiles',
    },
};

const SoilType = {
    create: SoilTypeCreate,
    edit: SoilTypeEdit,
    list: SoilTypeList,
    show: SoilTypeShow,
    recordRepresentation: 'name',
    icon: GrassIcon,
    options: {
        label: 'Types',
    },
};

const SoilClassification = {
    create: SoilClassificationCreate,
    edit: SoilClassificationEdit,
    list: SoilClassificationList,
    show: SoilClassificationShow,
    recordRepresentation: 'name',
    icon: SearchIcon,
    options: {
        label: 'Classifications',
    },
};

export default {
    profile: SoilProfile,
    type: SoilType,
    classification: SoilClassification,
};