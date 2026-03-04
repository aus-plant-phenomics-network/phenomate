# syntax=docker/dockerfile:1.7

# --- build stage --- 
FROM node:22-bullseye-slim AS build
WORKDIR /app

# Copy manifest + lockfile so npm can install deterministically
COPY package.json package-lock.json ./

# Faster & reproducible installs
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the app
COPY . .

# If you don't need the backend inside the front-end image
RUN rm -rf backend

# Build (Vite + tsc) — this now has the right native @tailwindcss/oxide-* binary
RUN npm run build

# --- runtime stage ---
FROM node:22-bullseye-slim AS runner
RUN npm i -g serve@14
WORKDIR /app
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]