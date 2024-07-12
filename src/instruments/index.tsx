import InstrumentCreate from './InstrumentCreate';
import InstrumentEdit from './InstrumentEdit';
import InstrumentList from './InstrumentList';
import InstrumentShow from './InstrumentShow';
import InstrumentChannelCreate from './channels/InstrumentChannelCreate';
import InstrumentChannelEdit from './channels/InstrumentChannelEdit';
import InstrumentChannelList from './channels/InstrumentChannelList';
import InstrumentChannelShow from './channels/InstrumentChannelShow';

import BuildIcon from '@mui/icons-material/Build';

const Instrument = {
    create: InstrumentCreate,
    edit: InstrumentEdit,
    list: InstrumentList,
    show: InstrumentShow,
    recordRepresentation: 'name',
    options: {
        label: 'Instrument Processing',
    },

    icon: BuildIcon,
};

const InstrumentChannel = {
    create: InstrumentChannelCreate,
    edit: InstrumentChannelEdit,
    // list: InstrumentChannelList,
    show: InstrumentChannelShow,
    recordRepresentation: 'name',
    parent: Instrument,
};

export default {
    instrument: Instrument,
    channels: InstrumentChannel,
};