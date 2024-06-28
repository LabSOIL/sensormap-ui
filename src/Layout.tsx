// in src/Layout.js
import { Layout } from 'react-admin';
import { CustomMenu } from './Menu';

export const CustomLayout = ({ children }) => (
    <Layout menu={CustomMenu}>
        {children}
    </Layout>
);

export default CustomLayout;