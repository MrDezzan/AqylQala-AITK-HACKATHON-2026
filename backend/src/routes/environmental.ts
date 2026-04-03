import { Router, Request, Response } from 'express';

const router = Router();

// Статические координаты районов Алматы для демонстрации (Medeu, Almaly, etc.)
const ALMATY_STATIONS = [
  { id: 'ST-001', name: 'Медеуский район (Горы)', lat: 43.215, lng: 76.965, baseAqi: 25 },
  { id: 'ST-002', name: 'Алмалинский район (Центр)', lat: 43.250, lng: 76.915, baseAqi: 95 },
  { id: 'ST-003', name: 'Бостандыкский район', lat: 43.220, lng: 76.925, baseAqi: 65 },
  { id: 'ST-004', name: 'Ауэзовский район', lat: 43.225, lng: 76.845, baseAqi: 145 },
  { id: 'ST-005', name: 'Жетысуский район (Нижний город)', lat: 43.285, lng: 76.885, baseAqi: 185 },
  { id: 'ST-006', name: 'Турксибский район', lat: 43.325, lng: 76.945, baseAqi: 210 },
  { id: 'ST-007', name: 'Алатауский район', lat: 43.295, lng: 76.815, baseAqi: 170 },
  { id: 'ST-008', name: 'Наурызбайский район', lat: 43.215, lng: 76.805, baseAqi: 55 },
  { id: 'ST-009', name: 'Парк Первого Президента', lat: 43.185, lng: 76.885, baseAqi: 30 },
  { id: 'ST-010', name: 'Центральный Парк (ЦПКиО)', lat: 43.262, lng: 76.972, baseAqi: 85 },
];

/**
 * GET /api/environmental
 * Возвращает актуальные данные со всех "датчиков" города в реальном времени.
 * Значения колеблются вокруг базы для ощущения "живой" системы.
 */
router.get('/', (_req: Request, res: Response) => {
  const sensors = ALMATY_STATIONS.map(s => {
    // Небольшая флуктуация +/- 5-10 единиц для каждой станции
    const fluctuation = Math.floor(Math.random() * 15) - 7;
    const aqi = Math.max(10, s.baseAqi + fluctuation);
    
    return {
      ...s,
      aqi,
      pm25: (aqi * 0.7).toFixed(1), // PM2.5 обычно коррелирует с AQI
      noise: Math.floor(Math.random() * 30) + 40, // дБ (40-70)
      status: aqi <= 50 ? 'GOOD' : aqi <= 100 ? 'MODERATE' : aqi <= 150 ? 'UNHEALTHY' : 'DANGER',
      updatedAt: new Date().toISOString(),
    };
  });

  res.json(sensors);
});

/**
 * GET /api/environmental/stats
 * Среднее по городу для дашборда
 */
router.get('/stats', (_req: Request, res: Response) => {
  const avg = ALMATY_STATIONS.reduce((sum, s) => sum + s.baseAqi, 0) / ALMATY_STATIONS.length;
  res.json({
    avgAqi: Math.round(avg),
    dominantPollutant: 'PM2.5',
    activeStationCount: ALMATY_STATIONS.length,
  });
});

export default router;
