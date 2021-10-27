import configure, { BccService } from '../../../src/server/services/bcc-services';
import { EraAddressType } from '../../../src/server/utils/constants';
const minKeyDeposit = 2000000;
const poolDeposit = 500000000;

describe('Bcc Service', () => {
  let bccService: BccService;

  beforeAll(() => {
    bccService = configure({ keyDeposit: minKeyDeposit, poolDeposit });
  });

  describe('Address type detection', () => {
    it('Should detect a valid bech32 Sophie mainnet address', () => {
      const addressType = bccService.getEraAddressType(
        'addr1q9ccruvttlfsqwu47ndmapxmk5xa8cc9ngsgj90290tfpysc6gcpmq6ejwgewr49ja0kghws4fdy9t2zecvd7zwqrheqjze0c7'
      );
      expect(addressType).toBe(EraAddressType.Sophie);
    });

    it('Should properly detect a valid bech32 Sophie testnet address', () => {
      const addressType = bccService.getEraAddressType(
        'addr_test1vru64wlzn85v7fecg0mz33lh00wlggqtquvzzuhf6vusyes32jz9w'
      );
      expect(addressType).toBe(EraAddressType.Sophie);
    });

    it('Should detect a valid Cole address', () => {
      const addressType = bccService.getEraAddressType(
        'DdzFFzCqrht9fvu17fiXwiuP82kKEhiGsDByRE7PWfMktrd8Jc1jWqKxubpz21mWjUMh8bWsKuP5JUF9CgUefyABDBsq326ybHrEhB7M'
      );
      expect(addressType).toBe(EraAddressType.Cole);
    });

    it('Should detect a valid Icarus address', () => {
      const addressType = bccService.getEraAddressType(
        'Ae2tdPwUPEZGvXJ3ebp4LDgBhbxekAH2oKZgfahKq896fehv8oCJxmGJgLt'
      );
      expect(addressType).toBe(EraAddressType.Cole);
    });

    it('Should return null if address is wrong', () => {
      const addressType = bccService.getEraAddressType('WRONG');
      expect(addressType).toBe(null);
    });
  });
});
