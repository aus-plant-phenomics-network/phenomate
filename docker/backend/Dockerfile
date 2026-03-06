# syntax=docker/dockerfile:1.6   # enables modern BuildKit features if you need them later
FROM alpine:3.20 AS fetch
RUN apk add --no-cache git

# Pin to a specific tag/branch/commit for reproducibility
ARG EXT_REPO=https://github.com/aus-plant-phenomics-network/appn-project-manager.git
# ARG EXT_REF=v0.2.1   # could be 'main' but pinning a tag/commit is better
# RUN git clone --depth 1 --branch "$EXT_REF" "$EXT_REPO" /tmp/ext
RUN git clone --depth 1 --branch master "$EXT_REPO" /tmp/ext

RUN ls -l /tmp/ext/examples/
# Optional: validate the file exists early (will fail the build if missing)
RUN test -f /tmp/ext/examples/template_appn_default.yaml


FROM python:3.12-slim

# Install make and build essentials
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    make \
    wget \
    gpg \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*
    
RUN pip install opencv-contrib-python-headless

# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Create the app directory and logfile mount position directory
RUN mkdir -p /app/phenomate/log



# Copy in template_appn_default.yaml file from examples directory 
# Make sure target dir exists
RUN mkdir -p /opt/phenomate/templates
# Copy only the needed file from the fetch stage
COPY --from=fetch /tmp/ext/examples/template_appn_default.yaml /opt/phenomate/templates/template.yaml

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEFAULT_ROOT_FOLDER="/home"
ENV DJANGO_ALLOWED_HOST="127.0.0.1,.localhost,frontend,backend,[::1],0.0.0.0"
ENV CELERY_BROKER_URL="amqp://guest:guest@localhost"

# Copy the Django project  and install dependencies
COPY backend /app/backend
COPY Makefile uv.lock pyproject.toml manage.py /app

# Set the working directory
WORKDIR /app

# Install all dependencies
RUN make install-backend
RUN make install-libjpeg-turbo

# List what ended up installed
RUN  pip list 

# Expose the Django port
EXPOSE 8000

# Run Django’s development server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
