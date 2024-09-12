import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { EthService } from './adapter/eth/eth.service';
import { WalletService } from './domain/wallet.service';
import { WalletController } from './gateway/wallet.controller';

@Module({
  imports: [HttpModule],
  providers: [WalletService, EthService],
  controllers: [WalletController],
})
export class WalletModule {}
