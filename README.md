## Setting up Phenomate

### Using docker

Building services:

```bash
docker compose up
```

Running the containers:

```bash
sudo make run-docker
```

Note running with privilege is required since we will need to kill rabbitmq process listening on 5672. Running the previous two commands should allow you to access Phenomate.

### Local development

#### Installing local dependencies

Installing `libjpeg-turbo`:

```bash
make install-libjpeg-turbo
```

Installing developer environment:

```bash
make install-dev
```

#### Running local phenomate application:

Run the celery server:

```bash
make run-celery
```

Then open a new terminal and run:

```bash
make run-server
```

Note that you may need to apply migration the first time running the server. To do this, you can do either:

```bash
uv run manage.py makemigrations activity project organisation researcher && uv run manage.py migrate
```

or

```bash
make clear-db
```

Then open another terminal and run:

```bash
make run-ui
```

In development mode, Phenomate uses sqlite as the db. To quickly purge all data from the db, you can use the make utility:

```bash
make clear-db
```

## Accessing Phenomate

If you manage to set up Phenomate using either the docker version or the local version, you should be able to access Phenomate through the following URLs:

UI: `http://localhost:3000`

API: `http://localhost:8000/api/docs`

## Modifying Phenomate configurations

Environment variables for Phenomate can be found in the `.env` files. The local environment uses the `.env` file while the docker environment uses the `.env.production` file.

### Mounting directory

By default, both the backend and the celery services mount the host (local environment) file system as volume accessible at `/hostfs` within the service environment.

```yaml
volumes:
  - /:/hostfs
```

Check out the [official documentation](https://docs.docker.com/reference/compose-file/volumes/) to configure additional mounting points if needed.

### Changing ports

All services aside from `frontend` and `backend` use their default port values. If modification is made, make sure to update the corresponding environment variables in the dotenv file. This will allow the services to discover and communicate with one another.

### Environment variables:

- `VITE_BASEURL`: the backend api url. By default, the backend server uses port 8000. If the `docker-compose.yaml` file is modified such that the backend port is no longer 8000, this value must also be changed to match the modification.
- `VITE_VFS_BASE_ADDR`: the default address that the virtual file system (file browser) will open to.
- `CELERY_BROKER_URL`: broker url of celery. By default, celery uses `rabbitmq` at port 5672, with username and password both being `guest`. If any value is modified, make sure to update this variable in the environment file.
- `DEFAULT_ROOT_FOLDER`: directory where the Phenomate project folder (which contains children projects) is stored.
- `PRODUCTION_MODE`: don't change this value in the dotenv file.
- `RABBITMQ_DEFAULT_USER`: rabbitmq image parameters
- `RABBITMQ_DEFAULT_PASS`: rabbitmq image parameters
- `POSTGRES_USER`: postgresql image parameters
- `POSTGRES_PASSWORD`: postgresql image parameters
- `POSTGRES_DB`: postgresql image parameters
- `POSTGRES_HOST`: postgresql image parameters
- `POSTGRES_PORT`: postgresql image parameters
