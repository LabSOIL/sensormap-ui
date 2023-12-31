// import fakeRestProvider from 'ra-data-fakerest';
import { DataProvider } from 'react-admin';
import get from 'lodash/get';
import Keycloak from 'keycloak-js';
import addUploadFeature from './addUploadFeature';


const addTagsSearchSupport = (dataProvider: DataProvider) => ({
    ...dataProvider,
    getList: (resource, params) => {
        if (resource === 'comments') {
            // partial pagination
            return dataProvider
                .getList(resource, params)
                .then(({ data, total }) => ({
                    data,
                    pageInfo: {
                        hasNextPage:
                            params.pagination.perPage * params.pagination.page <
                            total,
                        hasPreviousPage: params.pagination.page > 1,
                    },
                }));
        }
        if (resource === 'tags') {
            const matchSearchFilter = Object.keys(params.filter).find(key =>
                key.endsWith('_q')
            );
            if (matchSearchFilter) {
                const searchRegExp = new RegExp(
                    params.filter[matchSearchFilter],
                    'i'
                );

                return dataProvider.getList(resource, {
                    ...params,
                    filter: item => {
                        const matchPublished =
                            item.published == params.filter.published; // eslint-disable-line eqeqeq

                        const fieldName = matchSearchFilter.replace(
                            /(_q)$/,
                            ''
                        );
                        return (
                            matchPublished &&
                            get(item, fieldName).match(searchRegExp) !== null
                        );
                    },
                });
            }
        }

        return dataProvider.getList(resource, params);
    },
});

const uploadCapableDataProvider = addUploadFeature(
    addTagsSearchSupport(dataProvider)
);

const sometimesFailsDataProvider = new Proxy(uploadCapableDataProvider, {
    get: (target, name) => (resource, params) => {
        if (typeof name === 'symbol' || name === 'then') {
            return;
        }
        // set session_ended=true in localStorage to trigger an API auth error
        if (localStorage.getItem('session_ended')) {
            const error = new Error('Session ended') as ResponseError;
            error.status = 403;
            return Promise.reject(error);
        }
        // add rejection by type or resource here for tests, e.g.
        // if (name === 'delete' && resource === 'posts') {
        //     return Promise.reject(new Error('deletion error'));
        // }
        if (
            resource === 'posts' &&
            params.data &&
            params.data.title === 'f00bar'
        ) {
            return Promise.reject(new Error('this title cannot be used'));
        }
        return uploadCapableDataProvider[name](resource, params);
    },
});

const delayedDataProvider = new Proxy(sometimesFailsDataProvider, {
    get: (target, name) => (resource, params) => {
        if (typeof name === 'symbol' || name === 'then') {
            return;
        }
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve(sometimesFailsDataProvider[name](resource, params)),
                300
            )
        );
    },
});

export const keyCloakTokenDataProviderBuilder = (
    dataProvider: DataProvider,
    keycloak: Keycloak
) =>
    new Proxy(dataProvider, {
        get: (target, name) => (resource, params) => {
            if (typeof name === 'symbol' || name === 'then') {
                return;
            }
            console.log(
                `Simulating call to dataprovider.${name}() with keycloak token: ${keycloak.token}`
            );
            return dataProvider[name](resource, params);
        },
    });

interface ResponseError extends Error {
    status?: number;
}

export default delayedDataProvider;
