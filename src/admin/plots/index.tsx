import PlotCreate from './Create';
import PlotEdit from './Edit';
import PlotList from './List';
import PlotShow from './Show';
import PlotSampleCreate from './samples/Create';
import PlotSampleEdit from './samples/Edit';
import PlotSampleList from './samples/List';
import PlotSampleShow from './samples/Show';
import YardOutlinedIcon from '@mui/icons-material/YardOutlined';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const Plot = {
    create: PlotCreate,
    edit: PlotEdit,
    list: PlotList,
    show: PlotShow,
    recordRepresentation: 'name',
    icon: YardOutlinedIcon
};

const Sample = {
    create: PlotSampleCreate,
    edit: PlotSampleEdit,
    list: PlotSampleList,
    show: PlotSampleShow,
    recordRepresentation: 'name',
    icon: LibraryBooksIcon,
    options: {
        label: 'Samples',
    },

};

export default {
    plot: Plot,
    sample: Sample,
};