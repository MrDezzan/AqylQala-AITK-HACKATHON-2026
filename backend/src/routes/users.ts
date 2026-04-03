import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth';
import { logAction } from '../lib/logger';

const router = Router();

// Выгружаем список всех юзеров (только для админа)
router.get('/', authMiddleware, requireRole('ADMIN'), async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    // Чистим пароли перед отправкой, безопасность превыше всего
    const safeUsers = users.map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    });
    res.json(safeUsers);
  } catch (err: any) {
    console.error('!!! Ошибка при получении юзеров:', err);
    res.status(500).json({ error: 'Ошибка получения списка пользователей' });
  }
});

import bcrypt from 'bcrypt';

// Создание нового пользователя (Админ панель)
router.post('/', authMiddleware, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, role, city, department, iin } = (req.body || {});

    if (!name || (!email && !iin) || !password) {
      return res.status(400).json({ error: 'Имя, логин (email/ИИН) и пароль обязательны' });
    }

    // Проверяем, не занят ли уже такой логин или почта
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(iin ? [{ iin }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Пользователь с такими данными уже существует' });
    }

    const hash = await bcrypt.hash(password, 10);
    
    // Подметаем хвосты: пустые строки превращаем в null для базы
    const data: any = {
      name,
      email: email?.trim() === '' ? null : email?.trim() || null,
      phone: phone?.trim() === '' ? null : phone?.trim() || null,
      password: hash,
      role: role || 'USER',
      city: city || 'Алматы',
      department: department?.trim() === '' ? null : department?.trim() || null,
      iin: iin?.trim() === '' ? null : iin?.trim() || null
    };

    const user = await prisma.user.create({ data });

    await logAction('CREATE_USER', req.user?.id, req.user?.email || 'admin', `Создан пользователь: ${user.name} (${user.role})`);

    const { password: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err: any) {
    console.error('!!! Не удалось создать юзера:', err.message);
    res.status(500).json({ 
      error: 'Ошибка при создании пользователя',
      details: err.message,
    });
  }
});

// Удаление пользователя
router.delete('/:id', authMiddleware, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Запрещаем самоликвидацию: админ не может удалить сам себя
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Вы не можете удалить самого себя' });
    }

    await prisma.user.delete({ where: { id } });
    
    await logAction('DELETE_USER', req.user?.id, req.user?.email || 'admin', `Удален пользователь ID: ${id}`);

    res.json({ success: true, message: 'Пользователь успешно удален' });
  } catch (err: any) {
    console.error('!!! Ошибка удаления юзера:', err);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

export default router;
