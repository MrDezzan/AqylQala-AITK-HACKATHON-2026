import jetEnv, { num } from 'jet-env';
import tspo from 'tspo';

// Список доступных сред выполнения
export const NodeEnvs = {
  DEV: 'development',
  TEST: 'test',
  PRODUCTION: 'production',
} as const;

// Настройка переменных окружения из файла .env
const EnvVars = jetEnv({
  NodeEnv: (v) => tspo.isValue(NodeEnvs, v),
  Port: num,
});

export default EnvVars;
