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

# Create the app directory
RUN mkdir /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEFAULT_ROOT_FOLDER="/home"
ENV DJANGO_ALLOWED_HOST="127.0.0.1,.localhost,[::1],0.0.0.0"
ENV CELERY_BROKER_URL="amqp://guest:guest@localhost"

# Copy the Django project  and install dependencies
COPY backend /app/backend
COPY Makefile uv.lock pyproject.toml manage.py /app

# Set the working directory
WORKDIR /app

# Install all dependencies
RUN make install-backend
RUN make install-libjpeg-turbo

# Expose the Django port
EXPOSE 8000

# Run Django’s development server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
