import BccWasm, { Address, ColeAddress, StakeCredential } from 'bcc-serialization-lib';
import { Logger } from 'fastify';
import {
  NetworkIdentifier,
  EraAddressType,
  AddressPrefix,
  StakeAddressPrefix,
  NonStakeAddressPrefix
} from '../constants';

/**
 * Returns the bech-32 address prefix based on the netowrkId
 * Prefix according to: https://github.com/the-blockchain-company/CIPs/blob/master/CIP-0005/CIP-0005.md
 * @param network number
 * @param addressPrefix the corresponding prefix enum. Defaults to non stake address prefixes
 */
export const getAddressPrefix = (network: number, addressPrefix: AddressPrefix = NonStakeAddressPrefix): string =>
  network === NetworkIdentifier.BCC_MAINNET_NETWORK ? addressPrefix.MAIN : addressPrefix.TEST;

/**
 * Creates a new Reward address
 * @param logger
 * @param network
 * @param paymentCredential
 */
export const generateRewardAddress = (
  logger: Logger,
  network: NetworkIdentifier,
  paymentCredential: StakeCredential
): string => {
  logger.info('[generateRewardAddress] Deriving bcc reward address from valid public staking key');
  const rewardAddress = BccWasm.RewardAddress.new(network, paymentCredential);
  const bech32address = rewardAddress.to_address().to_bech32(getAddressPrefix(network, StakeAddressPrefix));
  logger.info(`[generateRewardAddress] reward address is ${bech32address}`);
  return bech32address;
};

/**
 * Creates a new Base address
 * @param logger
 * @param network
 * @param paymentCredential
 * @param stakingCredential
 */
export const generateBaseAddress = (
  logger: Logger,
  network: NetworkIdentifier,
  paymentCredential: StakeCredential,
  stakingCredential: StakeCredential
): string => {
  logger.info('[generateAddress] Deriving bcc address from valid public key and staking key');
  const baseAddress = BccWasm.BaseAddress.new(network, paymentCredential, stakingCredential);
  const bech32address = baseAddress.to_address().to_bech32(getAddressPrefix(network));
  logger.info(`[generateAddress] base address is ${bech32address}`);
  return bech32address;
};

/**
 * Creates a new Enterprise Address
 * @param logger
 * @param network
 * @param paymentCredential
 */
export const generateEnterpriseAddress = (
  logger: Logger,
  network: NetworkIdentifier,
  paymentCredential: StakeCredential
): string => {
  // Enterprise address - default scenario
  logger.info('[generateAddress] Deriving bcc enterprise address from valid public key');
  const enterpriseAddress = BccWasm.EnterpriseAddress.new(network, paymentCredential);
  const bech32enterpriseAddress = enterpriseAddress.to_address().to_bech32(getAddressPrefix(network));
  logger.info(`[generateAddress] enterprise address is ${bech32enterpriseAddress}`);
  return bech32enterpriseAddress;
};

/**
 * Returns either Cole or Sophie address type or it throws an error
 * @param address
 */
export const getEraAddressType = (address: string): EraAddressType => {
  if (BccWasm.ColeAddress.is_valid(address)) {
    return EraAddressType.Cole;
  }
  BccWasm.Address.from_bech32(address);
  return EraAddressType.Sophie;
};

/**
 * Returns either a Sophie or a Cole Address
 * @param address base58 for Cole or bech32 for Sophie
 */
export const generateAddress = (address: string): Address => {
  const addressType = getEraAddressType(address);

  if (addressType === EraAddressType.Cole) {
    const coleAddress = ColeAddress.from_base58(address);
    return coleAddress.to_address();
  }
  return Address.from_bech32(address);
};

/**
 * Returns either a base58 string for Cole or a bech32 for Sophie
 * @param address base58 for Cole or bech32 for Sophie
 * @param addressPrefix
 */
export const parseAddress = (address: Address, addressPrefix?: string): string => {
  const coleAddress = ColeAddress.from_address(address);
  return coleAddress ? coleAddress.to_base58() : address.to_bech32(addressPrefix);
};

/**
 * Returns Reward Address type from bech32
 * @param address reward address as bech32
 */
export const parseToRewardAddress = (address: string): BccWasm.RewardAddress | undefined => {
  const wasmAddress = BccWasm.Address.from_bech32(address);
  return BccWasm.RewardAddress.from_address(wasmAddress);
};
