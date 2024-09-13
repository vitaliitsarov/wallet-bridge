import { IsString, Validate } from 'class-validator';
import { MnemonicLengthValidator } from '../validators/mnemonic-length.validator';

export class CreateWalletDto {
  @IsString({ message: 'Recovery phrase must be a string' })
  @Validate(MnemonicLengthValidator, {
    message: 'Recovery phrase must consist of exactly 24 words',
  })
  recoveryPhrase: string;
}
