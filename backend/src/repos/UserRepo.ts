import { getRandomInt } from '@src/common/utils/number-utils';
import { IUser } from '@src/models/User.model';

import orm from './MockOrm';

/******************************************************************************
                                Functions
******************************************************************************/

// Достаем юзера по почте
async function getOne(email: string): Promise<IUser | null> {
  const db = await orm.openDb();
  for (const user of db.users) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

// Проверяем, живой ли еще такой ID в базе
async function persists(id: number): Promise<boolean> {
  const db = await orm.openDb();
  for (const user of db.users) {
    if (user.id === id) {
      return true;
    }
  }
  return false;
}

// Список всех вообще
async function getAll(): Promise<IUser[]> {
  const db = await orm.openDb();
  return db.users;
}

// Закидываем нового человечка в список
async function add(user: IUser): Promise<void> {
  const db = await orm.openDb();
  user.id = getRandomInt();
  db.users.push(user);
  return orm.saveDb(db);
}

// Обновляем инфу (меняем имя/почту)
async function update(user: IUser): Promise<void> {
  const db = await orm.openDb();
  for (let i = 0; i < db.users.length; i++) {
    if (db.users[i].id === user.id) {
      const dbUser = db.users[i];
      db.users[i] = {
        ...dbUser,
        name: user.name,
        email: user.email,
      };
      return orm.saveDb(db);
    }
  }
}

// Удаляем по ID
async function delete_(id: number): Promise<void> {
  const db = await orm.openDb();
  for (let i = 0; i < db.users.length; i++) {
    if (db.users[i].id === id) {
      db.users.splice(i, 1);
      return orm.saveDb(db);
    }
  }
}

// **** Чисто для тестов **** //

// Грохаем вообще всех юзеров (полная зачистка)
async function deleteAllUsers(): Promise<void> {
  const db = await orm.openDb();
  db.users = [];
  return orm.saveDb(db);
}

// Заливаем пачку юзеров разом (файловая БД страдает, но терпит)
async function insertMultiple(
  users: IUser[] | readonly IUser[],
): Promise<IUser[]> {
  const db = await orm.openDb(),
    usersF = [...users];
  for (const user of usersF) {
    user.id = getRandomInt();
    user.created = new Date();
  }
  db.users = [...db.users, ...users];
  await orm.saveDb(db);
  return usersF;
}

export default {
  getOne,
  persists,
  getAll,
  add,
  update,
  delete: delete_,
  deleteAllUsers,
  insertMultiple,
} as const;
