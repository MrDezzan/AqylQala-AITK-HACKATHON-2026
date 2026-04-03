import { isDate } from 'jet-validators';
import { transform } from 'jet-validators/utils';

/**
 * Преобразование входящего аргумента в объект Date с последующей валидацией.
 * Используется для корректной обработки временных меток в API.
 */
export const transformIsDate = transform(
  (arg) => new Date(arg as string),
  (arg) => isDate(arg),
);
