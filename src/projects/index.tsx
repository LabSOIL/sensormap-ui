import ProjectCreate from './Create';
import ProjectEdit from './Edit';
import ProjectList from './List';
import ProjectShow from './Show';
import WorkIcon from '@mui/icons-material/Work';

export default {
    icon: WorkIcon,
    create: ProjectCreate,
    edit: ProjectEdit,
    list: ProjectList,
    show: ProjectShow,
    recordRepresentation: 'name',
};
