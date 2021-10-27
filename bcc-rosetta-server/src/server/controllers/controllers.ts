import { Services } from '../services/services';
import blockController, { BlockController } from './block-controller';
import accountController, { AccountController } from './account-controller';
import networkController, { NetworkController } from './network-controller';
import constructionController, { ConstructionController } from './construction-controller';
import { BccCli } from '../utils/bcc/cli/bccnode-cli';
import { BccNode } from '../utils/bcc/cli/bcc-node';

export interface Controllers extends BlockController, AccountController, NetworkController, ConstructionController {}

/**
 * Configures all the controllers required by the app
 *
 * @param services App services
 */
export const configure = (
  services: Services,
  bccCli: BccCli,
  bccNode: BccNode,
  networkId: string,
  pageSize: number
): Controllers => ({
  ...blockController(services.blockService, services.bccService, pageSize, services.networkService),
  ...accountController(services.blockService, services.bccService, services.networkService),
  ...networkController(services.networkService, bccNode),
  ...constructionController(
    services.constructionService,
    services.bccService,
    bccCli,
    services.networkService,
    services.blockService
  )
});
