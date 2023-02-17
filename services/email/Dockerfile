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
LABEL servicename="email"
LABEL description="email serivce"
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


ENV PHANTOMJS_VERSION=2.1.1
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
RUN apk update && apk add --no-cache fontconfig curl curl-dev && \
    cd /tmp && curl -Ls https://github.com/dustinblackman/phantomized/releases/download/${PHANTOMJS_VERSION}/dockerized-phantomjs.tar.gz | tar xz && \
    cp -R lib lib64 / && \
    cp -R usr/lib/x86_64-linux-gnu /usr/lib && \
    cp -R usr/share /usr/share && \
    cp -R etc/fonts /etc && \
    curl -k -Ls https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-${PHANTOMJS_VERSION}-linux-x86_64.tar.bz2 | tar -jxf - && \
    cp phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs
RUN apk add --update ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family && rm -rf /var/cache/apk/*

### DEPENDENCIES
FROM base AS dependencies
# Install Node.js dependencies (only production)
RUN yarn --production
# Copy production dependencies aside
RUN cp -R node_modules /tmp/node_modules
RUN apk add --no-cache python2 g++ make
# Install ALL Node.js dependencies
RUN yarn


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
EXPOSE 4000
# In production environment
ENV NODE_ENV production
# change ownership of /app dir
RUN chown -R mindwave:mindwave /app
# change user
USER mindwave
# Run
ENTRYPOINT ["node", "app"]
