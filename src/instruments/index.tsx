import InstrumentCreate from './Create';
import InstrumentEdit from './Edit';
import InstrumentList from './List';
import InstrumentShow from './Show';
import InstrumentChannelCreate from './channels/Create';
import InstrumentChannelEdit from './channels/Edit';
import InstrumentChannelShow from './channels/Show';
import InstrumentChannelIntegrate from './channels/Integrate';

import BuildIcon from '@mui/icons-material/Build';

const Instrument = {
    create: InstrumentCreate,
    edit: InstrumentEdit,
    list: InstrumentList,
    show: InstrumentShow,
    recordRepresentation: 'name',
    options: {
        label: 'Lab Processing',
    },

    icon: BuildIcon,
};

const InstrumentChannel = {
    create: InstrumentChannelCreate,
    edit: InstrumentChannelEdit,
    show: InstrumentChannelShow,
    integrate: InstrumentChannelIntegrate,
    recordRepresentation: 'name',
    parent: Instrument,
};

export default {
    instrument: Instrument,
    channels: InstrumentChannel,
};