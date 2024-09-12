import { WALLETS_ENUM } from '../domain/constants';

export type SubscribeRequestDTO = {
  address: string;
  provider: WALLETS_ENUM;
  web_hook: string;
};

export type SubscribeResponseDTO = {
  hash: string;
  confirmations: number;
  from: string;
  to: string;
  value: bigint;
};
