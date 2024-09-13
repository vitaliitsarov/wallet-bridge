import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EthereumService } from './adapter/ethereum/ethereum.service';
import { WalletService } from './domain/wallet.service';
import { WalletController } from './gateway/wallet.controller';
import { BitcoinService } from './adapter/bitcoin/bitcoin.service';
import { TronService } from './adapter/tron/tron.service';
import { TonService } from './adapter/ton/ton.service';

@Module({
  imports: [HttpModule],
  providers: [
    WalletService,
    EthereumService,
    BitcoinService,
    TronService,
    TonService,
  ],
  controllers: [WalletController],
})
export class WalletModule {}
