import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'mnemonicLength', async: false })
export class MnemonicLengthValidator implements ValidatorConstraintInterface {
  validate(recoveryPhrase: string) {
    // Убираем лишние пробелы в начале и конце, затем разбиваем строку на слова по одному пробелу
    const words = recoveryPhrase.trim().split(/\s+/);
    return words.length === 24; // Проверяем, что количество слов ровно 24
  }

  defaultMessage() {
    return 'Recovery phrase must consist of exactly 24 words';
  }
}
