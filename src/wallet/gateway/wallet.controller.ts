import { Body, Controller, Post } from '@nestjs/common';
import { WalletService } from '../domain/wallet.service';
import { SubscribeRequestDTO } from './dto';
import { WalletType } from '../domain/wallet.type';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/create')
  createWallets(
    @Body('recoveryPhrase') recoveryPhrase: string,
  ): Promise<WalletType[]> {
    return this.walletService.createWallets(recoveryPhrase);
  }

  @Post('/subscribe')
  subscribe(
    @Body() { address, web_hook, provider }: SubscribeRequestDTO,
  ): void {
    return this.walletService.subscribe(address, web_hook, provider);
  }
}
