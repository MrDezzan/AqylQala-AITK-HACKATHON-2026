import jsonfile from 'jsonfile';
import tspo from 'tspo';

import EnvVars, { NodeEnvs } from '@src/common/constants/env';
import { IUser } from '@src/models/User.model';

/******************************************************************************
                                Constants
******************************************************************************/

// Путь к файлу нашей псевдо-базы данных
const DATABASE_FILE_PATH =
  __dirname +
  '/common' +
  (EnvVars.NodeEnv === NodeEnvs.TEST
    ? '/database.test.json'
    : '/database.json');

// Структура нашей БД (пока только юзеры, но скоро будет больше)
type Database = {
  users: IUser[];
};

// Читаем JSON и превращаем в объект
async function openDb(): Promise<Database> {
  const db = await (jsonfile.readFile(DATABASE_FILE_PATH) as Promise<Database>);
  if (!('users' in db)) {
    return tspo.addEntry(db, ['users', []]);
  }
  return db;
}

// Перетираем файл новыми данными
function saveDb(db: Database): Promise<void> {
  return jsonfile.writeFile(DATABASE_FILE_PATH, db);
}

// Полная зачистка базы (внимательнее с этим!)
function cleanDb(): Promise<void> {
  return jsonfile.writeFile(DATABASE_FILE_PATH, {});
}

export default {
  openDb,
  saveDb,
  cleanDb,
} as const;
