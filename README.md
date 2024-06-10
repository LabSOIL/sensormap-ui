# SOIL Sensormap UI

The frontend application for the SOIL Sensormap project, a fullstack
application to assist in fieldwork for the
[Soil Biogeochemistry Laboratory](https://www.epfl.ch/labs/soil/) at
[EPFL](https://www.epfl.ch/).

The application is a map-based interface to visualise and manage soil samples
and profiles and is created with the following frameworks:

- [React-Admin](https://marmelab.com/react-admin/)
- [Leaflet](https://leafletjs.com/)

With backends in:

- [FastAPI](https://fastapi.tiangolo.com/)


## Application relationships

This frontend application requires the database and endpoints served by:

- [sensormap-bff](https://github.com/LabSOIL/sensormap-bff) - The
Backend-for-Frontend (BFF) to proxy requests between Keycloak and the SOIL-API.

- [soil-api](https://github.com/LabSOIL/soil-api) - The REST API for SOIL
related projects (including this one).

This application requires also the following services:

- [Keycloak](https://www.keycloak.org/) for authentication and authorisation.


## Development

### Quick start

There is a docker-compose file to start the application in development mode. To
start the application:

1. Clone the repositories above into the folder beneath thi one, as to have the
following structure:

```bash
.
├── sensormap-bff
├── sensormap-ui
└── soil-api
```

2. Setup a Keycloak instance with a realm and client suitable for development
for both the UI and the BFF independently, and then in this `sensormap-ui`
repository, create a `.env` file with the Keycloak configuration similar to
below:

```bash
KEYCLOAK_CLIENT_ID=sensormap-frontend-local
KEYCLOAK_BFF_ID=sensormap-frontend-local-bff
KEYCLOAK_BFF_SECRET=<BFF_CLIENT_SECRET>
KEYCLOAK_REALM=SOIL
KEYCLOAK_URL=https://<KEYCLOAK_ROOT_URL/
```

3. Start the application from within this repository (sensormap-ui) with the
following command (this will build the images and start the containers):

```bash
docker-compose up --build
```

4. In the default configuration, the application will be available at
`http://soil:88`. Therefore, you will need to add the following line to your
`/etc/hosts` file:

```bash
127.0.0.1 soil
```

If this is undesired, the hostname can be changed in the `docker-compose.yml`
file.
