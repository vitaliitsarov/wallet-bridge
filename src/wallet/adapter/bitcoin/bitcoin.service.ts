import { TransactionResponse } from '@ethersproject/providers';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateWalletUseCase } from '../../domain/create-wallet.use-case';
import { SubscribeAddressUseCase } from '../../domain/subscribe-address.use-case';
import { TransactionType } from '../../domain/TransactionType';
import { WalletType } from '../../domain/wallet.type';
import * as bip39 from 'bip39';
import { BIP32Factory } from 'bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { WALLETS_ENUM } from 'src/wallet/domain/constants';

@Injectable()
export class BitcoinService
  implements CreateWalletUseCase, SubscribeAddressUseCase, OnModuleInit
{
  provider: any;
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
    this.provider.on(eventSymbol, (block: TransactionResponse) => {
      this.provider.off(eventSymbol);
      callback(this.parse(block));
    });
  }

  async create(recoveryPhrase: string): Promise<WalletType> {
    const bip32 = BIP32Factory(ecc);
    // Генерация seed из сид-фразы синхронно
    const seed = bip39.mnemonicToSeedSync(recoveryPhrase);

    // Создание корневого ключа
    const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);

    // Получение кошелька по пути derivation (стандартно используется m/44'/0'/0'/0/0 для основной сети)
    const path = "m/44'/0'/0'/0/0";
    const child = root.derivePath(path);

    // Генерация адреса кошелька
    const { address } = bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: bitcoin.networks.bitcoin,
    });

    return {
      network: WALLETS_ENUM.BITCOIN,
      address: address,
      privateKey: child.toWIF(),
    };
  }
}
