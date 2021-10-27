import { Pool } from 'pg';
import { FastifyInstance } from 'fastify';
import { setupDatabase, setupServer } from '../utils/test-utils';
import StatusCodes from 'http-status-codes';
import { BCC, MAINNET } from '../../../src/server/utils/constants';

// eslint-disable-next-line camelcase
const bccMainnet = { network_identifiers: [{ network: MAINNET, blockchain: BCC }] };

describe('/network/list endpoint', () => {
  let database: Pool;
  let server: FastifyInstance;
  beforeAll(async () => {
    database = setupDatabase();
    server = setupServer(database);
  });

  afterAll(async () => {
    await database.end();
  });

  // eslint-disable-next-line max-len
  test('if requested with an empty request body it should properly return an array of one element equal to bcc mainnet', async () => {
    const response = await server.inject({
      method: 'post',
      url: '/network/list',
      payload: {}
    });

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(response.json()).toEqual(bccMainnet);
  });
});
