/* eslint react/jsx-key: off */
import { useState, useRef, useEffect } from 'react';
import {
    Admin,
    Resource,
    AuthProvider,
    DataProvider,
} from 'react-admin';
import { Route } from 'react-router-dom';
import simpleRestProvider from './dataProvider/index'
import Keycloak, {
    KeycloakTokenParsed,
    KeycloakInitOptions,
} from 'keycloak-js';
import { httpClient } from 'ra-keycloak';
import { keycloakAuthProvider } from './authProvider';
import MyLayout from './Layout';
import users from './users';
import sensors from './sensors';
import areas from "./areas";
import plots from './plots';
import soil from './soil';
import projects from './projects';
import transects from './transects';
import gnss from './gnss';
import axios from 'axios';
import instruments from './instruments';
import dashboard from './Dashboard';
import Dashboard from './Dashboard';


const initOptions: KeycloakInitOptions = { onLoad: 'login-required' };

const getPermissions = (decoded: KeycloakTokenParsed) => {
    const roles = decoded?.realm_access?.roles;
    if (!roles) {
        return false;
    }
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('user')) return 'user';
    return false;
};


const UIConfigUrl = '/api/config';
export const apiUrl = '/api';

const App = () => {
    const [keycloak, setKeycloak] = useState();
    const initializingPromise = useRef<Promise<Keycloak>>(undefined);
    const authProvider = useRef<AuthProvider>();
    const dataProvider = useRef<DataProvider>();
    const [deployment, setDeployment] = useState(undefined);

    useEffect(() => {
        const initKeyCloakClient = async () => {
            const response = await axios.get(UIConfigUrl);
            const keycloakConfig = response.data.keycloak;
            setDeployment(response.data.deployment);

            // Initialize Keycloak here, once you have the configuration
            const keycloakClient = new Keycloak({
                url: keycloakConfig.url,
                realm: keycloakConfig.realm,
                clientId: keycloakConfig.client_id,
            });
            await keycloakClient.init(initOptions);

            authProvider.current = keycloakAuthProvider(keycloakClient, {
                onPermissions: getPermissions,
            });
            dataProvider.current = simpleRestProvider(
                apiUrl,
                httpClient(keycloakClient)
            );
            return keycloakClient;
        };

        if (!initializingPromise.current) {
            initializingPromise.current = initKeyCloakClient();
        }

        initializingPromise.current.then(keycloakClient => {
            setKeycloak(keycloakClient);
        });
    }, [keycloak]);

    if (!keycloak) return <p>Loading...</p>;

    return (
        <Admin
            authProvider={authProvider.current}
            dataProvider={dataProvider.current}
            dashboard={Dashboard}
            title="SOIL Sensor Map"
            layout={(props) => <MyLayout {...props} deployment={deployment} />}
        >
            {permissions => (
                <>

                    {permissions ? (
                        <>
                            <Resource name="projects" {...projects} />
                            <Resource name="areas" {...areas} />
                            <Resource name="plots" {...plots.plot} />
                            <Resource name="plot_samples" {...plots.sample} />
                            <Resource name="sensors" {...sensors.sensor} />
                            <Resource name="sensordata" {...sensors.sensordata} />
                            <Resource name="soil_profiles" {...soil.profile} />
                            <Resource name="soil_types" {...soil.type} />
                            <Resource name="transects" {...transects} />
                            <Resource name="gnss" {...gnss} />
                            <Resource name="instruments" {...instruments.instrument} />
                            <Resource name="instrument_channels" {...instruments.channels} >
                                <Route path=":id/integrate" element={<instruments.channels.integrate />} />
                            </Resource>

                            {permissions === 'admin' ? (
                                <Resource name="users" {...users} />
                            ) : null}
                        </>
                    ) : null}
                </>
            )}
        </Admin>
    );
};
export default App;
