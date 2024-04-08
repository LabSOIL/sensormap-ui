import SoilTypeCreate from './SoilTypeCreate';
import SoilTypeEdit from './SoilTypeEdit';
import SoilTypeList from './SoilTypeList';
import SoilTypeShow from './SoilTypeShow';
import SoilProfileCreate from './SoilProfileCreate';
import SoilProfileEdit from './SoilProfileEdit';
import SoilProfileList from './SoilProfileList';
import SoilProfileShow from './SoilProfileShow';


const SoilProfile = {
    create: SoilProfileCreate,
    edit: SoilProfileEdit,
    list: SoilProfileList,
    show: SoilProfileShow,
    recordRepresentation: 'name.en',
};

const SoilType = {
    create: SoilTypeCreate,
    edit: SoilTypeEdit,
    list: SoilTypeList,
    show: SoilTypeShow,
    recordRepresentation: 'name.en',
};

export default {
    profile: SoilProfile,
    type: SoilType,
};