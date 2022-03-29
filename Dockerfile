ARG UBUNTU_VERSION=20.04
FROM ubuntu:${UBUNTU_VERSION} as haskell-builder
ARG CABAL_VERSION=3.2.0.0
ARG BCC_NODE_VERSION=1.29
ARG BCC_DB_SYNC_VERSION=11.0.0
ARG GHC_VERSION=8.10.2
ARG THE-BLOCKCHAIN-COMPANY_LIBSODIUM_GIT_REV=66f017f16633f2060db25e17c170c2afa0f2a8a1
ENV DEBIAN_FRONTEND=nonintercative
RUN mkdir -p /app/src
WORKDIR /app
RUN apt-get update -y && apt-get install -y \
  automake=1:1.16.* \
  build-essential=12.* \
  g++=4:9.3.* \
  git=1:2.25.* \
  jq \
  libffi-dev=3.* \
  libghc-postgresql-libpq-dev=0.9.4.* \
  libgmp-dev=2:6.2.* \
  libncursesw5=6.* \
  libpq-dev=12.* \
  libssl-dev=1.1.* \
  libsystemd-dev=245.* \
  libtinfo-dev=6.* \
  libtool=2.4.* \
  make=4.2.* \
  pkg-config=0.29.* \
  tmux=3.* \
  wget=1.20.* \
  zlib1g-dev=1:1.2.*
RUN wget --secure-protocol=TLSv1_2 \
  https://downloads.haskell.org/~cabal/cabal-install-${CABAL_VERSION}/cabal-install-${CABAL_VERSION}-x86_64-unknown-linux.tar.xz &&\
  tar -xf cabal-install-${CABAL_VERSION}-x86_64-unknown-linux.tar.xz &&\
  rm cabal-install-${CABAL_VERSION}-x86_64-unknown-linux.tar.xz cabal.sig &&\
  mv cabal /usr/local/bin/
RUN cabal update
WORKDIR /app/ghc
RUN wget --secure-protocol=TLSv1_2 \
  https://downloads.haskell.org/~ghc/${GHC_VERSION}/ghc-${GHC_VERSION}-x86_64-deb9-linux.tar.xz &&\
  tar -xf ghc-${GHC_VERSION}-x86_64-deb9-linux.tar.xz &&\
  rm ghc-${GHC_VERSION}-x86_64-deb9-linux.tar.xz
WORKDIR /app/ghc/ghc-${GHC_VERSION}
RUN ./configure && make install
WORKDIR /app/src
RUN git clone https://github.com/The-Blockchain-Company/libsodium.git &&\
  cd libsodium &&\
  git fetch --all --tags &&\
  git checkout ${THE-BLOCKCHAIN-COMPANY_LIBSODIUM_GIT_REV}
WORKDIR /app/src/libsodium
RUN ./autogen.sh && ./configure && make && make install
ENV LD_LIBRARY_PATH="/usr/local/lib:$LD_LIBRARY_PATH"
ENV PKG_CONFIG_PATH="/usr/local/lib/pkgconfig:$PKG_CONFIG_PATH"
WORKDIR /app/src
RUN git clone https://github.com/The-Blockchain-Company/bcc-node.git &&\
  cd bcc-node &&\
  git fetch --all --tags &&\
  git checkout ${BCC_NODE_VERSION}
WORKDIR /app/src/bcc-node
RUN cabal install bcc-node \
  --install-method=copy \
  --installdir=/usr/local/bin \
  -f -systemd
RUN cabal install bcc-cli \
  --install-method=copy \
  --installdir=/usr/local/bin \
  -f -systemd
WORKDIR /app/src
RUN git clone https://github.com/The-Blockchain-Company/bcc-db-sync.git &&\
  cd bcc-db-sync &&\
  git fetch --all --tags &&\
  git checkout ${BCC_DB_SYNC_VERSION}
WORKDIR /app/src/bcc-db-sync
RUN cabal install bcc-db-sync \
  --install-method=copy \
  --installdir=/usr/local/bin
# Cleanup for runtiume-base copy of /usr/local/lib
RUN rm -rf /usr/local/lib/ghc-${GHC_VERSION} /usr/local/lib/pkgconfig

FROM ubuntu:${UBUNTU_VERSION} as ubuntu-nodejs
ARG NODEJS_MAJOR_VERSION=14
ENV DEBIAN_FRONTEND=nonintercative
RUN apt-get update && apt-get install curl -y &&\
  curl --proto '=https' --tlsv1.2 -sSf -L https://deb.nodesource.com/setup_${NODEJS_MAJOR_VERSION}.x | bash - &&\
  apt-get install nodejs -y

FROM ubuntu-nodejs as nodejs-builder
RUN curl --proto '=https' --tlsv1.2 -sSf -L https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - &&\
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list &&\
  apt-get update && apt-get install gcc g++ make gnupg2 yarn -y

FROM ubuntu-nodejs as runtime-base
RUN curl --proto '=https' --tlsv1.2 -sSf -L https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - &&\
  echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" | tee  /etc/apt/sources.list.d/pgdg.list &&\
  apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  jq \
  postgresql-12 \
  postgresql-client-12 &&\
  npm install pm2 -g
COPY --from=haskell-builder /usr/local/lib /usr/local/lib
COPY --from=haskell-builder /usr/local/bin/bcc-node /usr/local/bin/
COPY --from=haskell-builder /usr/local/bin/bcc-cli /usr/local/bin/
COPY --from=haskell-builder /usr/local/bin/bcc-db-sync /usr/local/bin/
COPY --from=haskell-builder /app/src/bcc-db-sync/schema /bcc-db-sync/schema
# easy step-down from root
# https://github.com/tianon/gosu/releases
ENV GOSU_VERSION 1.12
RUN set -eux; \
	savedAptMark="$(apt-mark showmanual)"; \
	rm -rf /var/lib/apt/lists/*; \
	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
	curl --proto '=https' --tlsv1.2 -sSf -L -o /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-${dpkgArch}"; \
	curl --proto '=https' --tlsv1.2 -sSf -L -o /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/${GOSU_VERSION}/gosu-${dpkgArch}.asc"; \
	export GNUPGHOME="$(mktemp -d)"; \
	gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
	gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
	gpgconf --kill all; \
	rm -rf "${GNUPGHOME}" /usr/local/bin/gosu.asc; \
	apt-mark auto '.*' > /dev/null; \
	[ -z "${savedAptMark}" ] || apt-mark manual ${savedAptMark} > /dev/null; \
	apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
	chmod +x /usr/local/bin/gosu; \
	gosu --version; \
	gosu nobody true
RUN mkdir /ipc
VOLUME /data
EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]

FROM nodejs-builder as rosetta-server-base
RUN mkdir -p /app/src
WORKDIR /app
COPY bcc-rosetta-server/packages-cache /app/packages-cache
COPY bcc-rosetta-server/package.json \
  bcc-rosetta-server/yarn.lock \
  bcc-rosetta-server/.yarnrc \
  /app/

FROM rosetta-server-base as rosetta-server-builder
COPY bcc-rosetta-server/tsconfig-dist.json \
  bcc-rosetta-server/tsconfig.json \
  /app/
RUN yarn --offline --frozen-lockfile --non-interactive
COPY bcc-rosetta-server/src /app/src
RUN yarn build

FROM rosetta-server-base as rosetta-server-production-deps
RUN yarn --offline --frozen-lockfile --non-interactive --production

FROM ubuntu-nodejs as bcc-rosetta-server
ARG NETWORK=mainnet
COPY --from=haskell-builder /usr/local/bin/bcc-cli \
  /usr/local/bin/bcc-node \
  /usr/local/bin/
COPY --from=rosetta-server-builder /app/dist /bcc-rosetta-server/dist
COPY --from=rosetta-server-production-deps /app/node_modules /bcc-rosetta-server/node_modules
COPY config/network/${NETWORK} /config/
EXPOSE 8080
CMD ["node", "/bcc-rosetta-server/dist/src/server/index.js"]

FROM runtime-base
ARG NETWORK=mainnet
ENV DEFAULT_RELATIVE_TTL=1000 LOGGER_MIN_SEVERITY=info PAGE_SIZE=25
COPY --from=rosetta-server-builder /app/dist /bcc-rosetta-server/dist
COPY --from=rosetta-server-production-deps /app/node_modules /bcc-rosetta-server/node_modules
COPY config/ecosystem.config.js .
COPY scripts/start_bcc-db-sync.sh /scripts/
COPY config/postgres/postgresql.conf /etc/postgresql/12/main/postgresql.conf
COPY config/network/${NETWORK} /config/
ENV PGPASSFILE=/config/bcc-db-sync/pgpass
RUN chmod 600 $PGPASSFILE && chown postgres:postgres $PGPASSFILE
COPY scripts/entrypoint.sh .
