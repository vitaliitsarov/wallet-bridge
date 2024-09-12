import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { EthService } from '../adapter/eth/eth.service';
import { WALLETS_ENUM } from './constants';
import { CreateWalletUseCase } from './create-wallet.use-case';
import { SubscribeAddressUseCase } from './subscribe-address.use-case';
import { TransactionType } from './TransactionType';

@Injectable()
export class WalletService {
  providers: Record<
    WALLETS_ENUM,
    CreateWalletUseCase & SubscribeAddressUseCase
  >;

  constructor(
    private readonly ethService: EthService,
    private readonly httpService: HttpService,
  ) {
    this.providers = {
      [WALLETS_ENUM.ETH]: ethService,
    };
  }

  createWallets(recoveryPhrase: string): Promise<WalletType[]> {
    return Promise.all(
      Object.values(this.providers).map((provider) =>
        provider.create(recoveryPhrase),
      ),
    );
  }

  subscribe(address: string, webhook: string, provider: WALLETS_ENUM) {
    return this.providers[provider].subscribe(
      address,
      (data: TransactionType) => this.hook(webhook, address, data),
    );
  }

  hook(webhook: string, address: string, data: TransactionType, retries = 0) {
    this.httpService
      .post(webhook, {
        address,
        data,
      })
      .subscribe({
        error: async (err) => {
          if (retries < 10) {
            await new Promise((r) => setTimeout(r, 100 * retries));
            return this.hook(webhook, address, data, ++retries);
          }
          throw err;
        },
      });
  }
}
