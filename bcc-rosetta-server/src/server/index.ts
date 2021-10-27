/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import createPool from './db/connection';
import * as Repostories from './db/repositories';
import buildServer from './server';
import * as Services from './services/services';
import * as BccCli from './utils/bcc/cli/bccnode-cli';
import * as BccNode from './utils/bcc/cli/bcc-node';
import { Environment, parseEnvironment } from './utils/environment-parser';
import { DepositParameters } from './services/bcc-services';

// FIXME: validate the following paraemeters when implementing (2)
// https://github.com/The-Blockchain-Company/bcc-rosetta/issues/101
const genesis = JSON.parse(fs.readFileSync(path.resolve(process.env.GENESIS_SOPHIE_PATH)).toString());
const networkMagic = genesis.networkMagic;
const networkId = genesis.networkId.toLowerCase();

const depositParameters: DepositParameters = {
  keyDeposit: genesis.protocolParams.keyDeposit,
  poolDeposit: genesis.protocolParams.poolDeposit
};

const start = async (databaseInstance: Pool) => {
  let server;
  try {
    const environment: Environment = parseEnvironment();
    const repository = Repostories.configure(databaseInstance);
    // FIXME: validate the following paraemeters when implementing (2)
    // https://github.com/The-Blockchain-Company/bcc-rosetta/issues/101
    const bccNode = BccNode.configure(environment.BCC_NODE_PATH);
    const bccCli = BccCli.configure(environment.BCC_CLI_PATH, networkMagic);
    const services = Services.configure(
      repository,
      networkId,
      networkMagic,
      environment.TOPOLOGY_FILE,
      environment.DEFAULT_RELATIVE_TTL,
      depositParameters
    );
    server = buildServer(services, bccCli, bccNode, environment.LOGGER_LEVEL, {
      networkId,
      pageSize: environment.PAGE_SIZE
    });

    server.addHook('onClose', (_, done) => databaseInstance.end(done));
    // eslint-disable-next-line no-magic-numbers
    await server.listen(environment.PORT, environment.BIND_ADDRESS);
    server.blipp();
  } catch (error) {
    server?.log.error(error);
    await databaseInstance?.end();
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }
};

process.on('uncaughtException', error => {
  console.error(error);
});
process.on('unhandledRejection', error => {
  console.error(error);
});

// FIXME this function call should be inside start() function, so process.env.DB_CONNECTION_STRING
// is validated through environment-parser, and for a better error handling too.
const connectDB = async () => await createPool(process.env.DB_CONNECTION_STRING);

connectDB()
  .then(databaseInstance => start(databaseInstance))
  .catch(console.error);
