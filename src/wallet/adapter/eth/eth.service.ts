import { BaseProvider } from '@ethersproject/providers/src.ts/base-provider';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';
import { CreateWalletUseCase } from '../../domain/create-wallet.use-case';
import { SubscribeAddressUseCase } from '../../domain/subscribe-address.use-case';
import { TransactionResponse } from '@ethersproject/providers';
import { TransactionType } from '../../domain/TransactionType';

@Injectable()
export class EthService
  implements CreateWalletUseCase, SubscribeAddressUseCase, OnModuleInit
{
  private provider: BaseProvider;

  onModuleInit(): any {
    this.provider = ethers.getDefaultProvider('');
  }

  parse(block: TransactionResponse): TransactionType {
    return {
      to: block.to,
      from: block.from,
      hash: block.hash,
      confirmations: block.confirmations,
      value: block.value._hex,
    };
  }

  subscribe(address: string, callback: (block: TransactionType) => void) {
    let eventSymbol = { address };
    this.provider.on(eventSymbol, (block: TransactionResponse) => {
      this.provider.off(eventSymbol);
      callback(this.parse(block));
    });
  }

  create(recoveryPhrase: string): WalletType {
    const wallet = ethers.Wallet.fromMnemonic(recoveryPhrase);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }
}
