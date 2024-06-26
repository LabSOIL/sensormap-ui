import PlotCreate from './PlotCreate';
import PlotCreateMany from './PlotCreateMany';
import PlotEdit from './PlotEdit';
import PlotList from './PlotList';
import PlotShow from './PlotShow';
import PlotSampleCreate from './samples/PlotSampleCreate';
import PlotSampleCreateMany from './samples/PlotSampleCreateMany';
import PlotSampleEdit from './samples/PlotSampleEdit';
import PlotSampleList from './samples/PlotSampleList';
import PlotSampleShow from './samples/PlotSampleShow';
import LandscapeIcon from '@mui/icons-material/Landscape';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const Plot = {
    create: PlotCreate,
    createMany: PlotCreateMany,
    edit: PlotEdit,
    list: PlotList,
    show: PlotShow,
    recordRepresentation: 'name.en',
    icon: LandscapeIcon
};

const Sample = {
    create: PlotSampleCreate,
    createMany: PlotSampleCreateMany,
    edit: PlotSampleEdit,
    list: PlotSampleList,
    show: PlotSampleShow,
    recordRepresentation: 'name.en',
    icon: LibraryBooksIcon
};

export default {
    plot: Plot,
    sample: Sample,
};