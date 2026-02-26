import WebsiteCreate from './Create';
import WebsiteEdit from './Edit';
import WebsiteList from './List';
import WebsiteShow from './Show';
import LanguageIcon from '@mui/icons-material/Language';

export default {
    icon: LanguageIcon,
    create: WebsiteCreate,
    edit: WebsiteEdit,
    list: WebsiteList,
    show: WebsiteShow,
    recordRepresentation: 'name',
};
