import SoilTypeCreate from './SoilTypeCreate';
import SoilTypeEdit from './SoilTypeEdit';
import SoilTypeList from './SoilTypeList';
import SoilTypeShow from './SoilTypeShow';
import SoilProfileCreate from './SoilProfileCreate';
import SoilProfileEdit from './SoilProfileEdit';
import SoilProfileList from './SoilProfileList';
import SoilProfileShow from './SoilProfileShow';
import FilterHdrIcon from '@mui/icons-material/FilterHdr';
import TerrainIcon from '@mui/icons-material/Terrain';
import GrassIcon from '@mui/icons-material/Grass';

const SoilProfile = {
    create: SoilProfileCreate,
    edit: SoilProfileEdit,
    list: SoilProfileList,
    show: SoilProfileShow,
    recordRepresentation: 'name.en',
    icon: FilterHdrIcon
};

const SoilType = {
    create: SoilTypeCreate,
    edit: SoilTypeEdit,
    list: SoilTypeList,
    show: SoilTypeShow,
    recordRepresentation: 'name.en',
    icon: GrassIcon
};

export default {
    profile: SoilProfile,
    type: SoilType,
};