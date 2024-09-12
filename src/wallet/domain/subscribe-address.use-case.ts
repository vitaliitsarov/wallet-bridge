import { TransactionType } from './TransactionType';

export interface SubscribeAddressUseCase {
  subscribe(address: string, callback: (block: TransactionType) => void): void
}
