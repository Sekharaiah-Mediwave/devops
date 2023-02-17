### BASE
FROM node:14.17.0-alpine AS base
# new group and user
RUN addgroup -S mindwave && \
    adduser -S -s /bin/false -g mindwave mindwave
# args
ARG BUILD_DATE
ARG PHR_VERSION
ARG APP_RELEASE
ARG APP_ENV
# Lables
LABEL maintainer="Ramesh Murugesan <info@mindwaveventures.com>"
LABEL name="PHR"
LABEL servicename="problem"
LABEL description="problem service"
LABEL version=$PHR_VERSION
LABEL vcs-url="https://github.com/mindwaveventures/PHR/"
LABEL build-date=$BUILD_DATE
LABEL release=$APP_RELEASE
LABEL environment=$APP_ENV
LABEL tier="backend"
LABEL company="Mindwave Ventures LTD"
# Set the working directory
WORKDIR /app
# Copy project specification and dependencies lock files
COPY package.json ./


### DEPENDENCIES
FROM base AS dependencies

RUN apk --no-cache add --virtual builds-deps build-base python git

# Install Node.js dependencies (only production)
RUN npm install --production

RUN npm rebuild bcrypt --build-from-source

# Copy production dependencies aside
RUN cp -R node_modules /tmp/node_modules
RUN apk add --no-cache python2 g++ make
# Install ALL Node.js dependencies
#RUN yarn


### TEST
FROM dependencies AS test
# Copy app sources
COPY . .
# Run linters and tests
# RUN yarn lint && yarn test


### RELEASE
FROM base AS release
# Copy production dependencies
COPY --from=dependencies /tmp/node_modules ./node_modules
# Copy app sources
COPY . .
# Expose application port
EXPOSE 3011
# In production environment
ENV NODE_ENV production
# change ownership of /app dir
RUN chown -R mindwave:mindwave /app
# change user
USER mindwave
# Run
ENTRYPOINT ["node", "app"]
