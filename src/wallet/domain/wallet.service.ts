import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { EthereumService } from '../adapter/ethereum/ethereum.service';
import { WALLETS_ENUM } from './constants';
import { CreateWalletUseCase } from './create-wallet.use-case';
import { SubscribeAddressUseCase } from './subscribe-address.use-case';
import { TransactionType } from './TransactionType';
import { WalletType } from './wallet.type';
import { BitcoinService } from '../adapter/bitcoin/bitcoin.service';
import { TronService } from '../adapter/tron/tron.service';
import { TonService } from '../adapter/ton/ton.service';

@Injectable()
export class WalletService {
  providers: Record<
    WALLETS_ENUM,
    CreateWalletUseCase & SubscribeAddressUseCase
  >;

  constructor(
    private readonly ethereumService: EthereumService,
    private readonly bitcoinService: BitcoinService,
    private readonly tronService: TronService,
    private readonly tonService: TonService,
    private readonly httpService: HttpService,
  ) {
    this.providers = {
      [WALLETS_ENUM.ETHEREUM]: ethereumService,
      [WALLETS_ENUM.BITCOIN]: bitcoinService,
      [WALLETS_ENUM.TRON]: tronService,
      [WALLETS_ENUM.TON]: tonService,
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
    console.log(address, webhook, provider);

    return this.providers[provider].subscribe(
      address,
      (data: TransactionType) => this.hook(webhook, address, data),
    );
  }

  hook(webhook: string, address: string, data: TransactionType, retries = 0) {
    console.log(webhook, address, data);

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
