export interface CreateWalletUseCase {
  create(recoveryPhrase: string): WalletType
}
