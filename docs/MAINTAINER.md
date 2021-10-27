## Internal Software
- [bcc-node]
- [bcc-db-sync]
- [PostgreSQL]

## Pinning Ubuntu Dev Dependencies
Run an auto-removing container of the base image:
``` console
docker run --rm -t -i ubuntu:20.04 /bin/bash
```
Lookup available versions in the container:
``` console
$ apt-get update
$ apt list -a automake
Listing... Done
automake/focal 1:1.16.1-4ubuntu6 all
```
## Process Management
[PM2] is used to manage Bcc Rosetta 
processes within the container.

## Libsodium fork
TBCO maintains a [fork of libsodium], which is built from source in the Dockerfile. To determine 
`TBCO_LIBSODIUM_GIT_REV`: 
1. Locate the git rev of `tbco-nix` in the `bcc-node` repo for the targeted version.
2. Go to that rev and review /overlays/crypto/libsodium.nix
#TODOfix sha below
For example, `bcc-node@1.19.0` has [`tbco-nix@b22d8da9dd38c971ad40d9ad2d1a60cce53995fb`][1] pinned, 
so the version of libsodium is [known to be 66f017f16633f2060db25e17c170c2afa0f2a8a1][2]

## Continuous deployment to Docker Hub 
Docker builds are pushed to Docker Hub in both the [post-integration workflow], and 
[post-release workflow]. The former maintains the build cache source and can be useful during 
testing, and the latter delivers versioned builds that also takes the `latest` tag.

## Bcc Configurations
`/config` is a squashed git subtree from the master branch of 
[The-Blockchain-Company/bcc-configurations].

### Setup remote
```console
git remote add -f bcc-configurations https://github.com/The-Blockchain-Company/bcc-configurations.git
```
### Update to latest
```console
git subtree pull --prefix config bcc-configurations master --squash
```

[bcc-node]: https://github.com/The-Blockchain-Company/bcc-node/releases
[bcc-db-sync]: https://github.com/The-Blockchain-Company/bcc-db-sync/releases
[PostgreSQL]: https://www.postgresql.org/
[PM2]: https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/
[fork of libsodium]: https://github.com/The-Blockchain-Company/libsodium
[1]: https://github.com/The-Blockchain-Company/bcc-node/blob/1.19.0/nix/sources.json#L44
[2]: https://github.com/The-Blockchain-Company/tbco-nix/blob/91b67f54420dabb229c58d16fb1d18e74f9e3c9e/overlays/crypto/libsodium.nix#L9
[post-integration workflow]: ../.github/workflows/post_integration.yml
[post-release workflow]: ../.github/workflows/post_release.yml
[The-Blockchain-Company/bcc-configurations]: https://github.com/The-Blockchain-Company/bcc-configurations
