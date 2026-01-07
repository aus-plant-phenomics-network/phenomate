## Setting up Phenomate

### Using docker

First, you should set up the docker-compose.yaml file, which mostly requires specifying the 
directory and creating it (on the host PC) the logging directory. If reinstalling the application
you may also want to reinitialise the database storage volume (see below).

Building services:

```bash
# stop containers ( add "--volumes --remove-orphans" to remove volume data from postgres volume
docker compose down 

# Rebuild all containers if they need updating
docker compose build --no-cache
docker compose up -d --force-recreate --build
# or, if only a particular image has changed 
docker compose up -d --force-recreate --build celery_worker

# start containers (or through the sudo make run-docker command)
docker compose up -d
```

Running the containers:

```bash
sudo make run-docker
```

Note running with privilege is required since we will need to kill rabbitmq process listening on 5672. Running the previous two commands should allow you to access Phenomate.

### Local development

The following instructions should work for local development on a Linux machine.

#### Installing local dependencies

Installing `libjpeg-turbo`:

```bash
make install-libjpeg-turbo
```

Installing `rabbitmq`:

```bash
make install-rabbitmq
```

Installing developer environment:

```bash
make install-dev
```

#### Running local phenomate application:

Set up the Celery server:

```bash
# First make sure Rabbitmq has started
sudo systemctl status rabbitmq-server
# If it is not started then start it:
sudo systemctl start rabbitmq-server

# Install dependencies appn-project-manager and pheonmate-core
# N.B. Ensure pyproject.toml has the [tool.uv.sources] section *uncommented*
make install-local-phenomate-core
make install-local-appm

# Now run the Celery workers
make run-celery
# uv run celery -A backend worker --loglevel=info --concurrency=4
```

Then open a new terminal and run:

```bash
make run-server
# uv run manage.py runserver
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
# npm run dev
```

Now open a browser and point to localhost:3000

To sync dto types between the frontend and backend, run

```bash
npm run sync-backend
```

You only need to run this if you have made any changes to any backend dto. Doing this helps eliminate the need to define types twice and is generally improves developer experience by a fair bit.

In development mode, Phenomate uses sqlite as the db. To quickly purge all data from the db, you can use the make utility:

```bash
make clear-db
```

## Accessing Phenomate

Once Phenomate is set up using either the docker version or the local version, you should be able to access Phenomate through the following URLs:

UI: `http://localhost:3000`

API: `http://localhost:8000/api/docs`

## Modifying Phenomate configurations

Environment variables for Phenomate can be found in the `.env` files. The local environment uses the `.env` file while the 
docker environment uses the `.env.production` file.

# Logging output and errors
 
Log output is redirected to files using the ```Celery``` logging system via ```Django```. What this means is that the logging system is 
configured in the ```backend/settings.py``` file.
  
For the docker application, the mapping of the logs is specified in the ```docker-compose.yaml``` ```volumes:``` section, 
currently as  ```- ${HOME}/phenomate/log:```. This directory should exist on the host system (the system where the docker app is running)
So make sure it is created:
  
```bash
mkdir -p - ${HOME}/phenomate/log
```

In the development environment, the log files can be controlled through setting the environemt variable LOG_DIR :
```
export LOG_DIR=${HOME}/phenomate/log_dev
```
otherwise they will be fond in ```/tmp/log/phenomete```

### Mounting directory

By default, both the backend and the celery services mount the host (local environment) file system as volume accessible
 at `/hostfs` within the service environment.

```yaml
volumes:
  - /:/hostfs
```

Check out the [official documentation](https://docs.docker.com/reference/compose-file/volumes/) to configure additional 
mounting points if needed.

# Removing and reinitialising the Docker volume database storage

```
# stop services and remove containers
docker compose down

# find and remove the compose-created pgdata volume
# docker volume ls | grep pgdata
docker volume rm phenomate_pgdata

# recreate images/containers
docker compose up -d --build
# run migrations after containers are up
docker compose exec backend python manage.py migrate
```

### Changing ports

All services aside from `frontend` and `backend` use their default port values. If modification is made, make sure to 
update the corresponding environment variables in the dotenv file. This will allow the services to discover and communicate with one another.

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
- `LOG_DIR` : the directory the the application should place the log files. Development and prodduction (e.g. docker) environments should specify different directories.

## Packages and Frameworks

Frontend:

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tanstack](https://tanstack.com/): router, query, table, form
- [Shadcn-ui](https://ui.shadcn.com/): for ui components
- [Tailwindcss](https://tailwindcss.com/): for styling
- [Openapi-react-query](https://openapi-ts.dev/openapi-react-query/): integrating with backend dto via tanstack router
- [Chonky](https://www.npmjs.com/package/@aperturerobotics/chonky): virtual file system. Note that the github uses the original chonky's [documentation](https://chonky.io/). When running `npm add` or `npm install`, you will see a wall of warning texts about version incompatibility. They are caused by differences in React versions (chonky uses React 16 while other packages React 19). This should still work and can safely be ignored.

Backend:

- [Django](https://www.djangoproject.com/): ORM and backend
- [Django-Ninja](https://django-ninja.dev/): routing
- [Celery](https://docs.celeryq.dev/en/stable/): task queue
- [Rabbitmq](https://www.rabbitmq.com/): celery broker
- [phenomate-core](https://github.com/aus-plant-phenomics-network/phenomate-core): data processing logic
- [appm](https://github.com/aus-plant-phenomics-network/appn-project-manager): template and project management logic
- Database: sqlite for local development and postgresql for production

## Contact

If you want to ask questions about this project, the best way is to create a [ticket](https://github.com/aus-plant-phenomics-network/phenomate/issues) addressing my github handle.
