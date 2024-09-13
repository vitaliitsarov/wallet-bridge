import { TransactionResponse } from '@ethersproject/providers';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateWalletUseCase } from '../../domain/create-wallet.use-case';
import { SubscribeAddressUseCase } from '../../domain/subscribe-address.use-case';
import { TransactionType } from '../../domain/TransactionType';
import { WalletType } from '../../domain/wallet.type';
import { WALLETS_ENUM } from 'src/wallet/domain/constants';

import { mnemonicToWalletKey } from '@ton/crypto';
import { WalletContractV4 } from '@ton/ton';

@Injectable()
export class TonService
  implements CreateWalletUseCase, SubscribeAddressUseCase, OnModuleInit
{
  onModuleInit(): any {}

  parse(block: TransactionResponse): TransactionType {
    return {
      to: block.to,
      from: block.from,
      hash: block.hash,
      confirmations: block.confirmations,
      value: block.value._hex,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribe(address: string, callback: (block: TransactionType) => void) {
    const eventSymbol = { address };

    console.log(eventSymbol);
    // this.provider.on(eventSymbol, (block: TransactionResponse) => {
    //   this.provider.off(eventSymbol);
    //   callback(this.parse(block));
    // });
  }

  async create(recoveryPhrase: string): Promise<WalletType> {
    const key = await mnemonicToWalletKey(recoveryPhrase.split(' '));
    const wallet = WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0,
    });

    console.log(wallet.address);

    return {
      network: WALLETS_ENUM.TON,
      address: wallet.address.toString(),
      privateKey: null,
    };
  }
}
