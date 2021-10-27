import execa from 'execa';
import { Logger } from 'fastify';

export interface BccNode {
  /**
   * This function invokes `bcc-node --version`
   */
  getBccNodeVersion(logger: Logger): Promise<string>;
}

export const configure = (bccNodePath: string): BccNode => ({
  async getBccNodeVersion(logger): Promise<string> {
    logger.info(`[getBccNodeVersion] Invoking bcc-node --version at ${bccNodePath}`);
    const parameters = ['--version'];
    const { stdout, failed, stderr } = await execa(bccNodePath, parameters);
    if (failed) {
      throw new Error(stderr.toString());
    }
    return stdout;
  }
});
