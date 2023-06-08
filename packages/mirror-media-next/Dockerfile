RUN set -e; \
    apt-get update -y && apt-get install -y \
    tini; \
    && apt-get clean

ARG NODE_VERSION=14.17.3

FROM node:${NODE_VERSION} AS build

WORKDIR /build

COPY package.json yarn.lock /build/

RUN yarn install

COPY . /build/

RUN yarn build


FROM node:${NODE_VERSION}

WORKDIR /app

ENV NODE_ENV=production
COPY --from=build /build/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=build /build/.next/standalone ./
COPY --from=build /build/.next/static ./.next/static

## Use tini to manage zombie processes and signal forwarding
## https://github.com/krallin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["/app/run.sh"]
