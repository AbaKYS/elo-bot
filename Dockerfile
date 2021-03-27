# Build stage
FROM node:14.16-alpine AS builder
WORKDIR /tmp/build
ADD package.json package-lock.json tsconfig.json ./
ADD src ./src/
RUN npm ci && npm run build


# App stage
FROM node:14.16-alpine

ENV USER=elobot
ENV UID=901
ENV GID=901

RUN addgroup \
    -g "$GID" \
    --system  \
    "$USER" \
    && \
    adduser \
    --disabled-password \
    --gecos "" \
    --ingroup "$USER" \
    --uid "$UID" \
    --system \
    "$USER"

WORKDIR /opt/app
RUN chown "$USER":"$USER" . 
USER $USER
ENV NODE_ENV=production

ADD package.json package-lock.json ./
RUN npm ci --only=production
ADD .env .env.production ./
COPY --from=builder /tmp/build/out ./out/

CMD [ "node", "out/index.js" ]