import { ParseError } from 'jet-validators/utils';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

/**
 * Базовый класс для ошибок API.
 * Содержит статус-код и сообщение для фронтенда.
 */
export class RouteError extends Error {
  public status: HttpStatusCodes;

  public constructor(status: HttpStatusCodes, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Специализированная ошибка валидации данных (через parseObj).
 */
export class ValidationError extends RouteError {
  public static MESSAGE = 'Ошибка при парсинге объекта: обнаружены несоответствия схеме.';

  public constructor(errors: ParseError[]) {
    const msg = JSON.stringify({
      message: ValidationError.MESSAGE,
      errors,
    });
    super(HttpStatusCodes.BAD_REQUEST, msg);
  }
}
