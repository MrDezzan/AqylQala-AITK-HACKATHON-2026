import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth';
import * as XLSX from 'xlsx';

const router = Router();

// Вытягиваем последние 500 событий аудита (только для админов)
router.get('/', authMiddleware, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: 'Ошибка получения логов', details: err.message });
  }
});

// Экспорт логов в Excel формат
router.get('/export', authMiddleware, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const data = logs.map(log => ({
      'Дата': log.createdAt.toLocaleString(),
      'Действие': log.action,
      'Email пользователя': log.userEmail || 'Система',
      'ID пользователя': log.userId || 'N/A',
      'Детали': log.details || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    // Собираем Excel книгу
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Логи аудита');

    // Выплевываем буфер файла
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=aqylqala_audit_logs.xlsx');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: 'Ошибка экспорта логов', details: err.message });
  }
});

export default router;
