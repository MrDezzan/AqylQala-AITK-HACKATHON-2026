import { PrismaClient } from '@prisma/client';

// Подключение к основной базе PostgreSQL (прокидываем клиента по всему приложению)
const prismaClient = new PrismaClient();

const prisma: any = prismaClient;

export default prisma;
export { prismaClient as db };
