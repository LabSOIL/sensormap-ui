import { stringify } from 'query-string';
import { fetchUtils, DataProvider } from 'ra-core';

const convertFileToBase64 = file =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file.rawFile);
    });

const handleImageUpload = async (resource, params) => {
    const { data } = params;

    if (resource === 'plots' && data.image && data.image.rawFile instanceof File) {
        data.image = await convertFileToBase64(data.image);
    }

    if (resource === 'soil_profiles') {
        const imagePromises = [];

        if (data.photo && data.photo.rawFile instanceof File) {
            imagePromises.push(
                convertFileToBase64(data.photo).then(base64 => {
                    data.photo = base64;
                })
            );
        }

        if (data.soil_diagram && data.soil_diagram.rawFile instanceof File) {
            imagePromises.push(
                convertFileToBase64(data.soil_diagram).then(base64 => {
                    data.soil_diagram = base64;
                })
            );
        }

        await Promise.all(imagePromises);
    }

    return params;
};

const dataProvider = (
    apiUrl: string,
    httpClient = fetchUtils.fetchJson,
    countHeader: string = 'Content-Range'
): DataProvider => ({
    getList: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const rangeStart = (page - 1) * perPage;
        const rangeEnd = page * perPage - 1;

        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([rangeStart, rangeEnd]),
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        const options =
            countHeader === 'Content-Range'
                ? {
                    // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
                    headers: new Headers({
                        Range: `${resource}=${rangeStart}-${rangeEnd}`,
                    }),
                }
                : {};

        return httpClient(url, options).then(({ headers, json }) => {
            if (!headers.has(countHeader)) {
                throw new Error(
                    `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
                );
            }
            return {
                data: json,
                total:
                    countHeader === 'Content-Range'
                        ? parseInt(
                            headers.get('content-range').split('/').pop(),
                            10
                        )
                        : parseInt(headers.get(countHeader.toLowerCase())),
            };
        });
    },

    getOne: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
            data: json,
        })),

    getMany: (resource, params) => {
        const query = {
            filter: JSON.stringify({ id: params.ids }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        return httpClient(url).then(({ json }) => ({ data: json }));
    },

    getManyReference: (resource, params) => {
        const { page, perPage } = params.pagination;
        const { field, order } = params.sort;

        const rangeStart = (page - 1) * perPage;
        const rangeEnd = page * perPage - 1;

        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        const options =
            countHeader === 'Content-Range'
                ? {
                    // Chrome doesn't return `Content-Range` header if no `Range` is provided in the request.
                    headers: new Headers({
                        Range: `${resource}=${rangeStart}-${rangeEnd}`,
                    }),
                }
                : {};

        return httpClient(url, options).then(({ headers, json }) => {
            if (!headers.has(countHeader)) {
                throw new Error(
                    `The ${countHeader} header is missing in the HTTP Response. The simple REST data provider expects responses for lists of resources to contain this header with the total number of results to build the pagination. If you are using CORS, did you declare ${countHeader} in the Access-Control-Expose-Headers header?`
                );
            }
            return {
                data: json,
                total:
                    countHeader === 'Content-Range'
                        ? parseInt(
                            headers.get('content-range').split('/').pop(),
                            10
                        )
                        : parseInt(headers.get(countHeader.toLowerCase())),
            };
        });
    },

    update: async (resource, params) => {
        params = await handleImageUpload(resource, params);
        return httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    },

    // simple-rest doesn't handle provide an updateMany route, so we fallback to calling update n times instead
    updateMany: (resource, params) =>
        Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(params.data),
                })
            )
        ).then(responses => ({ data: responses.map(({ json }) => json.id) })),

    create: async (resource, params) => {
        params = await handleImageUpload(resource, params);
        return httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({ data: json }));
    },

    delete: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
            headers: new Headers({
                'Content-Type': 'text/plain',
            }),
        }).then(({ json }) => ({ data: json })),

    // simple-rest doesn't handle filters on DELETE route, so we fallback to calling DELETE n times instead
    deleteMany: (resource, params) =>
        Promise.all(
            params.ids.map(id =>
                httpClient(`${apiUrl}/${resource}/${id}`, {
                    method: 'DELETE',
                    headers: new Headers({
                        'Content-Type': 'text/plain',
                    }),
                })
            )
        ).then(responses => ({
            data: responses.map(({ json }) => json.id),
        })),
    createMany: (resource, params) =>
        convertFileToBase64(params.data.attachment).then(base64Data => {
            return httpClient(`${apiUrl}/${resource}/batch`, {
                method: 'POST',
                body: JSON.stringify({
                    attachment: base64Data,
                }),
            }).then(({ json }) => ({ data: json }));
        }),
});

export default dataProvider;
