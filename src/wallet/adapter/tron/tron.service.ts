import { TransactionResponse } from '@ethersproject/providers';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateWalletUseCase } from '../../domain/create-wallet.use-case';
import { SubscribeAddressUseCase } from '../../domain/subscribe-address.use-case';
import { TransactionType } from '../../domain/TransactionType';
import { WalletType } from '../../domain/wallet.type';
import { WALLETS_ENUM } from 'src/wallet/domain/constants';

import * as TronWeb from 'tronweb';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';

@Injectable()
export class TronService
  implements CreateWalletUseCase, SubscribeAddressUseCase, OnModuleInit
{
  private provider: any;

  onModuleInit(): any {
    const fullNode = 'https://api.trongrid.io'; // TRON full node
    const solidityNode = 'https://api.trongrid.io'; // TRON solidity node
    const eventServer = 'https://api.trongrid.io'; // TRON event server
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const apiKey = 'aff9514a-2561-4d23-8302-8d433b12267f';

    this.provider = new TronWeb(fullNode, solidityNode, eventServer);
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
    const bip32 = BIP32Factory(ecc);
    // Генерируем мастер ключ
    const seedBuffer = bip39.mnemonicToSeedSync(recoveryPhrase);
    const root = bip32.fromSeed(seedBuffer);

    // Создаем ключи
    const keyPair = root.derivePath("m/44'/195'/0'/0/0"); // TRON использует деривацию BIP44 с 195 для TRON
    const privateKey = keyPair.privateKey.toString('hex');

    // Создаем адрес TRON
    const address = this.provider.address.fromPrivateKey(privateKey);

    return {
      network: WALLETS_ENUM.TRON,
      address: address,
      privateKey: privateKey,
    };
  }
}
