import { TransactionResponse } from '@ethersproject/providers';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { CreateWalletUseCase } from '../../domain/create-wallet.use-case';
import { SubscribeAddressUseCase } from '../../domain/subscribe-address.use-case';
import { TransactionType } from '../../domain/TransactionType';
import { WalletType } from '../../domain/wallet.type';
import { WALLETS_ENUM } from 'src/wallet/domain/constants';

@Injectable()
export class EthereumService
  implements CreateWalletUseCase, SubscribeAddressUseCase, OnModuleInit
{
  private provider: ethers.providers.JsonRpcProvider;

  onModuleInit(): any {
    this.provider = new ethers.providers.JsonRpcProvider(
      'https://sepolia.infura.io/v3/e780d75a119444cabbf8d7ecfbd6df07',
    );
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
    const eventSymbol = { address };
    this.provider.on(eventSymbol, (block: TransactionResponse) => {
      this.provider.off(eventSymbol);
      callback(this.parse(block));
    });
  }

  async create(recoveryPhrase: string): Promise<WalletType> {
    const wallet = ethers.Wallet.fromMnemonic(recoveryPhrase);
    return {
      network: WALLETS_ENUM.ETHEREUM,
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }
}
