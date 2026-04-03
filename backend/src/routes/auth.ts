import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logAction } from '../lib/logger';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Список ИИН госслужащих для проверки при регистрации (Mock база)
const MOCK_OFFICIALS: Record<string, { name: string; role: string; department: string }> = {
  '123456789012': { name: 'Ахметов Ерлан Сериккалиевич', role: 'OFFICIAL', department: 'Управление ЖКХ' },
  '234567890123': { name: 'Сейтказина Айжан Нурлановна', role: 'OFFICIAL', department: 'Управление благоустройства' },
  '345678901234': { name: 'Касымов Данияр Маратович', role: 'OFFICIAL', department: 'Управление дорог' },
  '456789012345': { name: 'Нурланова Мадина Ержановна', role: 'OFFICIAL', department: 'Экология и природопользование' },
};

// Регистрация обычного жителя (Citizen)
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'ФИО, email и пароль обязательны' });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });
    if (existing) {
      return res.status(409).json({ error: 'Пользователь с таким email или телефоном уже существует' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hash, city, role: 'USER' },
    });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city, department: user.department }
    });
  } catch (err: any) {
    console.error('!!! Ошибка при логине:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// Регистрация сотрудника Акимата по ИИН
router.post('/register-official', async (req: Request, res: Response) => {
  try {
    const { iin, password } = req.body;

    if (!iin || iin.length !== 12 || !/^\d{12}$/.test(iin)) {
      return res.status(400).json({ error: 'ИИН должен быть 12 цифр' });
    }

    const official = MOCK_OFFICIALS[iin];
    if (!official) {
      return res.status(404).json({ error: 'Госслужащий с данным ИИН не найден' });
    }

    const existing = await prisma.user.findUnique({ where: { iin } });
    if (existing) {
      return res.status(409).json({ error: 'Аккаунт с данным ИИН уже создан' });
    }

    const hash = await bcrypt.hash(password || '123456', 10);
    const user = await prisma.user.create({
      data: {
        name: official.name,
        iin,
        password: hash,
        role: 'OFFICIAL',
        department: official.department,
        city: 'Алматы',
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role, email: '' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, role: user.role, department: user.department },
    });
  } catch (err: any) {
    console.error('!!! Ошибка регистрации (гос):', err);
    res.status(500).json({ error: 'Ошибка регистрации госслужащего' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, iin, password } = req.body;

    let user;
    if (iin) {
      console.log(`>>> Попытка входа по ИИН: ${iin}`);
      user = await prisma.user.findUnique({ where: { iin } });
    } else if (email) {
      console.log(`>>> Попытка входа по Email: ${email}`);
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      return res.status(400).json({ error: 'Укажите email или ИИН' });
    }

    if (!user) {
      console.error(`!!! Пользователь не найден: ${email || iin}`);
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    if (!user.password) {
      console.error(`!!! У пользователя не задан пароль: ${email || iin}`);
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Пароль не подошел' });
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log(`>>> Статус пароля для ${user.email || user.iin}: ${valid ? 'Верно' : 'Неверно'}`);
    
    if (!valid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email || '' }, JWT_SECRET, { expiresIn: '7d' });

    await logAction('LOGIN', user.id, user.email || user.iin || 'user', `Успешный вход в систему`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        department: user.department,
      },
    });
  } catch (err: any) {
    console.error('!!! Ошибка входа:', err.message);
    res.status(500).json({ 
      error: 'Ошибка авторизации',
      details: err.message,
      stack: err.stack
    });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, city: true, department: true, phone: true },
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ 
      error: 'Server error', 
      details: err.message,
      stack: err.stack
    });
  }
});

export default router;
