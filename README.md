# Bcc Rosetta
[![CI][img_src_CI]][workflow_CI] [![Nightly][img_src_Nightly]][workflow_Nightly] [![Postman Send Transaction Example](https://github.com/The-Blockchain-Company/bcc-rosetta/actions/workflows/postman_send_transaction_example.yml/badge.svg)](https://github.com/The-Blockchain-Company/bcc-rosetta/actions/workflows/postman_send_transaction_example.yml)

An implementation of [Rosetta] for [Bcc], targeting the version defined in the [OpenApi schema]
## Build

### [From anywhere]

```console
docker build -t bcc-rosetta:1.3.0 https://github.com/The-Blockchain-Company/bcc-rosetta.git#1.3.0
```
### With local source code
```
docker build -t bcc-rosetta .
```

**_Optionally_**  specify a [network] name, other than `mainnet`, using a build argument:

```console
  --build-arg NETWORK=testnet
```

**_Optionally_** use cached build layers to reduce the initialization time. Suits dev and demo 
use-cases:
```console
export DOCKER_BUILDKIT=1
docker build \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --cache-from=tbco/bcc-rosetta:master \
    -t bcc-rosetta:1.3.0 \
    https://github.com/The-Blockchain-Company/bcc-rosetta.git#1.3.0
```

## Run

Mount a single volume into the [standard storage location], mapping the server port to the host, 
and allocating a suitably-sized `/dev/shm`. See the complete [Docker run reference] for full 
control.

```console
docker run \
  --name bcc-rosetta \
  -p 8080:8080 \
  -v bcc-rosetta:/data \
  --shm-size=2g \
  bcc-rosetta:1.3.0
```
### Configuration

Set ENVs for optional runtime configuration
```console
-e MODE=offline
```

#### `MODE`
See Rosetta docs for information on [modes]
- `online` - default
- `offline`

#### `DEFAULT_RELATIVE_TTL`
Specify the TTL without needing to access an online method. Default: `1000`

#### `LOGGER_MIN_SEVERITY`
- `trace`
- `debug`
- `info` - default
- `warn`
- `error`
- `fatal`

#### `PAGE_SIZE`
Default: `25`

### Upgrading
As per the release notes, you **_may_** be required to refresh the state managed by 
`bcc-db-sync`. This can be achieved without requiring a network re-sync using the following 
command:

```console
docker stop bcc-rosetta && \
docker rm bcc-rosetta && \
docker run --rm -v bcc-rosetta:/data ubuntu rm -rf /data/postgresql /data/db-sync
```
Now create a new container using the run instructions above. Sync progress will be logged by the new container. 

## Documentation

| Link                               | Audience                                                     |
| ---                                | ---                                                          |
| [Construction API Documentation]   | Users of the Bcc Rosetta Construction API                |
| [Data API Documentation]           | Users of the Bcc Rosetta Data API                        |
| [Bcc Rosetta Docs]             | Bcc Rosetta specific documentation                       |
| [Developer]                        | Core or external developers of bcc-rosetta-server        |
| [Maintainer]                       | Solution maintainer                                          |
| [QA]                               | Quality Assurance Engineers                                  |

<hr/>

<p align="center">
  <a href="https://github.com/The-Blockchain-Company/bcc-rosetta/blob/master/LICENSE.md"><img src="https://img.shields.io/github/license/The-Blockchain-Company/bcc-rosetta.svg?style=for-the-badge" /></a>
</p>

[img_src_CI]: https://github.com/The-Blockchain-Company/bcc-rosetta/workflows/CI/badge.svg
[workflow_CI]: https://github.com/The-Blockchain-Company/bcc-rosetta/actions?query=workflow%3ACI
[img_src_Nightly]: https://github.com/The-Blockchain-Company/bcc-rosetta/workflows/Nightly/badge.svg
[workflow_Nightly]: https://github.com/The-Blockchain-Company/bcc-rosetta/actions?query=workflow%3ANightly
[Rosetta]: https://www.rosetta-api.org/docs/welcome.html
[Bcc]: https://bcc.org/
[OpenApi schema]: bcc-rosetta-server/src/server/openApi.json#L4
[From anywhere]: https://www.rosetta-api.org/docs/node_deployment.html#build-anywhere
[network]: config/network
[standard storage location]: https://www.rosetta-api.org/docs/standard_storage_location.html
[Docker run reference]: https://docs.docker.com/engine/reference/run/
[modes]: https://www.rosetta-api.org/docs/node_deployment.html#multiple-modes
[docs]: bcc-rosetta-server/README.md
[Construction API Documentation]: https://www.rosetta-api.org/docs/construction_api_introduction.html
[Data API Documentation]: https://www.rosetta-api.org/docs/data_api_introduction.html
[Bcc Rosetta Docs]: ./docs
[Developer]: bcc-rosetta-server/README.md
[Maintainer]: docs/MAINTAINER.md
[QA]: docs/QA.md
