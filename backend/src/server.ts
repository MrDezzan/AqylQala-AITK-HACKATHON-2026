import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import problemRoutes from './routes/problems';
import aiRoutes from './routes/ai';
import userRoutes from './routes/users';
import logRoutes from './routes/logs';
import environmentalRoutes from './routes/environmental';
import newsRoutes from './routes/news';

const app = express();
const PORT = process.env.PORT || 3001;

// Накидываем стандартный фарш: корсы и парсинг жосона
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Простой логгер для отладки входящих запросов
app.use((req, res, next) => {
  console.log(`[REQ]: ${req.method} ${req.originalUrl}`);
  next();
});

// Регистрируем ручки API
console.log('>>> Загружаем логику приложения...');
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/news', newsRoutes);
console.log('>>> Все ручки успешно подцеплены.');

// Проверка здоровья (для докера или мониторинга)
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Глобальный перехватчик ошибок, чтобы сервак не грохнулся
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('!!! Поймана критическая ошибка:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`🚀 AqylQala взлетел на порту ${PORT}`);
});

export default app;
