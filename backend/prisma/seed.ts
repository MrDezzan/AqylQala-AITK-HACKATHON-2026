import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const CATEGORIES = ['дороги', 'мусор', 'освещение', 'безопасность', 'экология', 'ЖКХ', 'другое'];
const STATUSES = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const ALMATY_PROBLEMS = [
  { lat: 43.2375, lng: 76.9457, cat: 'дороги', desc: 'Большая яма на проспекте Достык возле дома 120. Опасно для транспорта.', addr: 'пр. Достык 120' },
  { lat: 43.2565, lng: 76.9285, cat: 'мусор', desc: 'Переполненные мусорные контейнеры на ул. Жандосова. Мусор рассыпан по тротуару.', addr: 'ул. Жандосова 58' },
  { lat: 43.2220, lng: 76.8516, cat: 'освещение', desc: 'Не работают уличные фонари на протяжении 200м по ул. Тимирязева.', addr: 'ул. Тимирязева 42' },
  { lat: 43.2510, lng: 76.9150, cat: 'безопасность', desc: 'Сломанная ограда у школы №145. Дети могут выбежать на дорогу.', addr: 'ул. Розыбакиева 250' },
  { lat: 43.2680, lng: 76.9590, cat: 'экология', desc: 'Незаконная вырубка деревьев в парке возле ТРЦ Мега. Уничтожено более 10 деревьев.', addr: 'мкр. Самал-2' },
  { lat: 43.2400, lng: 76.9100, cat: 'ЖКХ', desc: 'Прорыв водопроводной трубы на пересечении Абая-Сейфуллина. Вода заливает тротуар.', addr: 'пр. Абая / Сейфуллина' },
  { lat: 43.2330, lng: 76.9540, cat: 'дороги', desc: 'Разрушенный тротуар возле остановки Бальзака. Пешеходы обходят по проезжей части.', addr: 'ул. Бальзака 10' },
  { lat: 43.2590, lng: 76.9350, cat: 'мусор', desc: 'Стихийная свалка строительного мусора во дворе жилого комплекса на Навои.', addr: 'пр. Аль-Фараби 77' },
];

async function main() {
  console.log(' Заливаем начальные данные в базу...');

  await prisma.aIAnalysis.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.user.deleteMany();

  // Создаем админа для управления системой
  const adminHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: { name: 'Администратор', email: 'admin@aqylqala.kz', password: adminHash, role: 'ADMIN', city: 'Алматы' },
  });

  // Создаем обычного жителя для тестов
  const userHash = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: { name: 'Тестовый Пользователь', email: 'user@test.kz', password: userHash, role: 'USER', city: 'Алматы', phone: '+77001234567' },
  });

  // Создаем сотрудника акимата (через ИИН)
  const officialHash = await bcrypt.hash('official123', 10);
  const official = await prisma.user.create({
    data: { name: 'Ахметов Ерлан Сериккалиевич', iin: '123456789012', password: officialHash, role: 'OFFICIAL', city: 'Алматы', department: 'Управление ЖКХ' },
  });

  // Генерируем пачку проблем с разным временем создания для тестов фильтров
  for (let i = 0; i < ALMATY_PROBLEMS.length; i++) {
    const p = ALMATY_PROBLEMS[i];
    const creatorId = i % 2 === 0 ? user.id : official.id;
    
    let createdAt = new Date();
    let updatedAt = new Date();
    let status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

    if (i === 0) {
      // Решенная проблема (старая, должна скрыться через 6 часов)
      status = 'RESOLVED';
      createdAt.setHours(createdAt.getHours() - 48);
      updatedAt.setHours(updatedAt.getHours() - 10);
    } else if (i === 1) {
      // Свежая решенная проблема (должна быть видна)
      status = 'RESOLVED';
      createdAt.setHours(createdAt.getHours() - 24);
      updatedAt.setHours(updatedAt.getHours() - 1);
    } else if (i === 2) {
      // Висит уже давно (5 дней назад) — ИИ должен ругаться
      status = 'NEW';
      createdAt.setDate(createdAt.getDate() - 5);
    }

    const problem = await prisma.problem.create({
      data: {
        category: p.cat,
        description: p.desc,
        address: p.addr,
        lat: p.lat,
        lng: p.lng,
        status: status,
        userId: creatorId,
        createdAt,
        updatedAt,
      },
    });

    // Добавляем вердикт ИИ сразу
    await prisma.aIAnalysis.create({
      data: {
        problemId: problem.id,
        category: p.cat,
        priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
        summary: `Обнаружена проблема: ${p.cat}. Зафиксировано по адресу ${p.addr}.`,
        recommendation: `Провести осмотр и устранить в течение 48 часов.`,
      },
    });
  }

  console.log('База успешно засеяна тестовыми данными!');
}

main()
  .catch((e) => {
    console.error('!!! Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
