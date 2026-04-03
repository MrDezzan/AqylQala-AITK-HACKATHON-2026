import prisma from './prisma';

// Пишем важное событие в журнал аудита (кто, когда и что натворил)
export async function logAction(action: string, userId?: string, userEmail?: string, details?: string) {
  try {
    const entry = await prisma.auditLog.create({
      data: {
        action,
        userId: userId || null,
        userEmail: userEmail || null,
        details: details || null,
      }
    });
    // Дублируем в консоль для удобства отладки в реалтайме
    console.log(`[LOG]: ${action} от юзера: ${userEmail || 'system'}`);
    return entry;
  } catch (err: any) {
    console.error('!!! Ошибка при записи в лог застряла:', err.message);
  }
}
