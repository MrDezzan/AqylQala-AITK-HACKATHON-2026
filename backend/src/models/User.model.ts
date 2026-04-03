import { isNonEmptyString, isString, isUnsignedInteger } from 'jet-validators';
import { parseObject, Schema, testObject } from 'jet-validators/utils';

import { transformIsDate } from '@src/common/utils/validators';

import { Entity } from './common/types';

// Дефолтные значения для нового пользователя
const GetDefaults = (): IUser => ({
  id: 0,
  name: '',
  email: '',
  created: new Date(),
});

// Схема валидации данных (через jet-validators)
const schema: Schema<IUser> = {
  id: isUnsignedInteger,
  name: isString,
  email: isString,
  created: transformIsDate,
};

/**
 * Сущность пользователя (используется для типизации в системе)
 */
export interface IUser extends Entity {
  name: string;
  email: string;
}

// Инициализация парсера пользователя на основе схемы
const parseUser = parseObject<IUser>(schema);

// Проверка полноты данных для API (обязательные поля)
const isCompleteUser = testObject<IUser>({
  ...schema,
  name: isNonEmptyString,
  email: isNonEmptyString,
});

/**
 * Создание нового чистого объекта пользователя.
 */
function new_(user?: Partial<IUser>): IUser {
  return parseUser({ ...GetDefaults(), ...user }, (errors) => {
    throw new Error('Не удалось инициализировать пользователя: ' + JSON.stringify(errors, null, 2));
  });
}

// Экспорт функционала модели
export default {
  new: new_,
  isComplete: isCompleteUser,
} as const;
