# Stage 1: Base build stage
FROM python:3.13-slim AS builder

# Install make and build essentials 
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    make \
    && rm -rf /var/lib/apt/lists/*

# Download the latest installer
ADD https://astral.sh/uv/install.sh /uv-installer.sh

# Run the installer then remove it
RUN sh /uv-installer.sh && rm /uv-installer.sh

# Ensure the installed binary is on the `PATH`
ENV PATH="/root/.local/bin/:$PATH"

# Create the app directory
RUN mkdir /app
 
# Set the working directory
WORKDIR /app
 
# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 
 
# Copy the Django project  and install dependencies
COPY Makefile uv.lock pyproject.toml ./
 
# Install all dependencies 
RUN make install-backend
 
# Stage 2: Production stage
FROM python:3.13-slim

# Install open-cv deps 
RUN apt-get update && apt-get install curl wget make gpg -y
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6 -y
RUN pip install opencv-contrib-python-headless

# Install libjpeg turbo 
COPY Makefile . 
RUN make install-libjpeg-turbo

# Set user 
RUN useradd -m -r appuser && \
   mkdir /app && \
   chown -R appuser /app

USER appuser

 # Copy backend 
COPY backend /app/backend
WORKDIR /app 

# Copy the Python dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.13/site-packages/ /usr/local/lib/python3.13/site-packages/
COPY --from=builder /usr/local /usr/local

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1 

# Expose the Django port
EXPOSE 8000
 
# Run Django’s development server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.wsgi:application"]
