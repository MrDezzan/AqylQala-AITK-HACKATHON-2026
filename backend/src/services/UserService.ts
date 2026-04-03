import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { RouteError } from '@src/common/utils/route-errors';
import { IUser } from '@src/models/User.model';
import UserRepo from '@src/repos/UserRepo';

// Константы для обработки ошибок в сервисе
const Errors = {
  USER_NOT_FOUND: 'Пользователь не найден в системе',
} as const;

// Основные функции бизнес-логики для работы с пользователями

// Получение полного списка всех зарегистрированных пользователей
function getAll(): Promise<IUser[]> {
  return UserRepo.getAll();
}

// Регистрация нового аккаунта в системе
function addOne(user: IUser): Promise<void> {
  return UserRepo.add(user);
}

// Обновление персональных данных пользователя
async function updateOne(user: IUser): Promise<void> {
  const persists = await UserRepo.persists(user.id);
  if (!persists) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  return UserRepo.update(user);
}

// Полное удаление профиля из базы по его уникальному ID
async function deleteOne(id: number): Promise<void> {
  const persists = await UserRepo.persists(id);
  if (!persists) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, Errors.USER_NOT_FOUND);
  }
  return UserRepo.delete(id);
}

// Экспорт всех методов сервиса
export default {
  Errors,
  getAll,
  addOne,
  updateOne,
  delete: deleteOne,
} as const;
