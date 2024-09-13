import { WalletType } from './wallet.type';

export interface CreateWalletUseCase {
  create(recoveryPhrase: string): Promise<WalletType>;
}
