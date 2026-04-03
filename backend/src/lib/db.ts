import bcrypt from 'bcrypt';

// Типизация для имитации Prisma (чтобы роуты работали прозрачно)
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  iin?: string;
  password?: string;
  role: 'USER' | 'OFFICIAL' | 'ADMIN';
  city: string;
  department?: string;
  createdAt: Date;
}

export interface Problem {
  id: string;
  category: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
  aiAnalysis?: AIAnalysis;
}

export interface AIAnalysis {
  id: string;
  problemId: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  recommendation: string;
  createdAt: Date;
}

// Полноценная заглушка БД в памяти для случаев, когда Prisma недоступна
class MockDB {
  users: User[] = [];
  problems: Problem[] = [];
  aiAnalyses: AIAnalysis[] = [];

  constructor() {
    this.seed();
  }

  // Наполнение базы начальными данными (сидирование)
  public async seed() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash = await bcrypt.hash('user123', 10);
    const officialHash = await bcrypt.hash('official123', 10);

    const admin: User = { id: 'admin-1', name: 'Администратор', email: 'admin@aqylqala.kz', password: adminHash, role: 'ADMIN', city: 'Алматы', createdAt: new Date() };
    const testUser: User = { id: 'user-1', name: 'Иванов Иван', email: 'user@test.kz', phone: '+77015554433', password: userHash, role: 'USER', city: 'Алматы', createdAt: new Date() };
    const official: User = { id: 'off-1', name: 'Ахметов Ерлан', iin: '123456789012', password: officialHash, role: 'OFFICIAL', city: 'Алматы', department: 'Управление ЖКХ', createdAt: new Date() };
    
    this.users.push(admin, testUser, official);

    const p1: Problem = {
      id: 'p-1', category: 'дороги', address: 'пр. Достык 120', lat: 43.2375, lng: 76.9457,
      status: 'NEW', userId: 'user-1', user: testUser, createdAt: new Date(), updatedAt: new Date(),
      description: 'Большая яма на проспекте Достык. Опасно для транспорта.'
    };

    const a1: AIAnalysis = {
      id: 'a-1', problemId: 'p-1', category: 'дороги', priority: 'HIGH',
      summary: 'Критическое разрушение дорожного покрытия на центральной магистрали.',
      recommendation: 'Срочный ремонт в течение 24 часов.',
      createdAt: new Date()
    };

    p1.aiAnalysis = a1;
    this.problems.push(p1);
    this.aiAnalyses.push(a1);
  }

  // Работа с пользователями (эмуляция Prisma methods)
  user = {
    findUnique: async ({ where }: any) => {
      return this.users.find(u => 
        (where.id && u.id === where.id) || 
        (where.email && u.email === where.email) || 
        (where.iin && u.iin === where.iin)
      );
    },
    findFirst: async ({ where }: any) => {
      if (where?.OR) {
        return this.users.find(u => {
          return where.OR.some((condition: any) => {
            const [key, value] = Object.entries(condition)[0];
            return (u as any)[key] === value;
          });
        });
      }
      return this.users.find(u => 
        (where.email && u.email === where.email) || 
        (where.iin && u.iin === where.iin) || 
        (where.id && u.id === where.id) ||
        (where.phone && u.phone === where.phone)
      );
    },
    create: async ({ data }: any) => {
      const newUser = { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date() };
      this.users.push(newUser);
      return newUser;
    },
    findMany: async () => this.users,
    delete: async ({ where }: any) => {
      const idx = this.users.findIndex(u => u.id === where.id);
      if (idx !== -1) return this.users.splice(idx, 1)[0];
      return null;
    }
  };

  // Работа с заявками/проблемами
  problem = {
    findMany: async (args: any = {}) => {
      let res = [...this.problems];
      if (args.where?.userId) res = res.filter(p => p.userId === args.where.userId);
      if (args.where?.status) res = res.filter(p => p.status === args.where.status);
      if (args.where?.category) res = res.filter(p => p.category === args.where.category);
      
      return res.map(p => ({
        ...p,
        user: args.include?.user ? this.users.find(u => u.id === p.userId) : undefined,
        aiAnalysis: args.include?.aiAnalysis ? this.aiAnalyses.find(a => a.problemId === p.id) : undefined,
      }));
    },
    findUnique: async ({ where, include }: any) => {
      const p = this.problems.find(p => p.id === where.id);
      if (!p) return null;
      return {
        ...p,
        user: include?.user ? this.users.find(u => u.id === p.userId) : undefined,
        aiAnalysis: include?.aiAnalysis ? this.aiAnalyses.find(a => a.problemId === p.id) : undefined,
      };
    },
    create: async ({ data }: any) => {
      const newP = { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date(), updatedAt: new Date(), status: 'NEW' };
      this.problems.push(newP);
      return newP;
    },
    update: async ({ where, data }: any) => {
      const idx = this.problems.findIndex(p => p.id === where.id);
      if (idx === -1) return null;
      this.problems[idx] = { ...this.problems[idx], ...data, updatedAt: new Date() };
      return this.problems[idx];
    },
    delete: async ({ where }: any) => {
      const idx = this.problems.findIndex(p => p.id === where.id);
      if (idx !== -1) return this.problems.splice(idx, 1)[0];
      return null;
    },
    deleteMany: async () => {
      this.problems = [];
      return { count: 0 };
    },
    count: async () => this.problems.length,
    groupBy: async ({ by }: any) => {
      if (by.includes('status')) {
        const counts: any = {};
        this.problems.forEach(p => counts[p.status] = (counts[p.status] || 0) + 1);
        return Object.entries(counts).map(([status, count]) => ({ status, _count: { _all: count } }));
      }
      if (by.includes('category')) {
        const counts: any = {};
        this.problems.forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
        return Object.entries(counts).map(([category, count]) => ({ category, _count: { _all: count } }));
      }
      return [];
    }
  };

  // Работа с нейросетевым анализом
  aIAnalysis = {
    findUnique: async ({ where }: any) => {
      return this.aiAnalyses.find(a => a.id === where?.id || a.problemId === where?.problemId);
    },
    create: async ({ data }: any) => {
      const newA = { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date() };
      this.aiAnalyses.push(newA);
      const p = this.problems.find(p => p.id === data.problemId);
      if (p) p.aiAnalysis = newA;
      return newA;
    },
    deleteMany: async () => {
      this.aiAnalyses = [];
      return { count: 0 };
    }
  };
}

export const db = new MockDB();
export default db;
