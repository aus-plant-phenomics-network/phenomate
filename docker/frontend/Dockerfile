


FROM node:20-bullseye-slim AS build

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i -g serve

COPY . .
RUN rm -rf backend

RUN npm run build

# Copy in template_appn_default.yaml file from examples directory 
# Make sure target dir exists
# RUN mkdir -p /opt/phenomate/templates/
# Copy only the needed file from the fetch stage
# COPY --from=fetch /tmp/ext/examples/template_appn_default.yaml /opt/phenomate/templates/template.yaml


EXPOSE 3000

CMD [ "serve", "-s", "dist" ]
