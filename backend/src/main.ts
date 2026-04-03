import logger from 'jet-logger';

import EnvVars from './common/constants/env';
import server from './server';

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MESSAGE =
  'Express server started on port: ' + EnvVars.Port.toString();

/******************************************************************************
                                  Run
******************************************************************************/

// Запуск сервера Express
server.listen(EnvVars.Port, (err) => {
  if (!!err) {
    logger.err('!!! Ошибка при запуске сервера: ' + err.message);
  } else {
    logger.info('🚀 Сервер успешно запущен на порту: ' + EnvVars.Port.toString());
  }
});
