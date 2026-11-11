# ---- runtime: the API, which also serves the prebuilt editor in web/ ----
FROM node:22-bookworm-slim
# git: saving runs `git status` in the mounted zmk-config repo.
RUN apt-get update \
 && apt-get install -y --no-install-recommends git \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /srv
COPY package.json package-lock.json ./
# --ignore-scripts skips the root postinstall, which installs the app's
# dev dependencies; the runtime needs only the API's.
RUN npm ci --omit=dev --ignore-scripts
COPY index.js ./
COPY api ./api
COPY web ./web
# compose runs this as the host user so files written to zmk-config stay
# yours; git then needs a home and to trust the mounted repo.
ENV HOME=/tmp \
    HOST=0.0.0.0 \
    PORT=8080 \
    ZMK_CONFIG_PATH=/zmk-config \
    GIT_CONFIG_COUNT=1 \
    GIT_CONFIG_KEY_0=safe.directory \
    GIT_CONFIG_VALUE_0=/zmk-config
USER node
EXPOSE 8080
CMD ["node", "index.js"]
