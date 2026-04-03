import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@aqylqala.kz' },
    update: { 
      password, 
      role: 'ADMIN', 
      name: 'Администратор',
      city: 'Алматы'
    },
    create: {
      email: 'admin@aqylqala.kz',
      password,
      role: 'ADMIN',
      name: 'Администратор',
      city: 'Алматы'
    }
  });
  console.log('Admin user created/updated:', user.email);
}

main()
  .catch(e => {
    console.error('Error creating admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
