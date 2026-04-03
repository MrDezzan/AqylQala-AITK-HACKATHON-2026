import { Router, Request, Response } from 'express';

const router = Router();

// Статические новости Алматы для демонстрации с полной локализацией
const ALMATY_NEWS = [
  {
    id: 1,
    date: '2026-04-03',
    ru: { 
      title: 'В Алматы запущена интеллектуальная система управления трафиком', 
      summary: 'Новая система ИИ анализирует пробки в режиме реального времени и управляет 150 светофорами в центре города.',
      category: 'Цифровизация'
    },
    kk: { 
      title: 'Алматыда зияткерлік трафикті басқару жүйесі іске қосылды', 
      summary: 'Жаңа ЖИ жүйесі нақты уақыт режимінде кептелістерді талдайды және қала орталығындағы 150 бағдаршамды басқарады.',
      category: 'Цифрландыру'
    },
    en: { 
      title: 'A Smart Traffic Management System Launched in Almaty', 
      summary: 'A new AI system analyzes traffic congestion in real-time and controls 150 traffic lights in the city center.',
      category: 'Digitalization'
    },
    image: 'https://images.unsplash.com/photo-1545147986-a9d6f210df77?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 2,
    date: '2026-04-02',
    ru: { 
      title: 'Реконструкция набережной озера Сайран завершится к осени', 
      summary: 'Акимат утвердил план благоустройства западного берега, где появятся новые велосипедные дорожки и зоны отдыха.',
      category: 'Благоустройство'
    },
    kk: { 
      title: 'Сайран көлінің жағалауын қайта жаңарту күзде аяқталады', 
      summary: 'Әкімдік батыс жағалауды абаттандыру жоспарын бекітті, онда жаңа велосипед жолдары мен демалыс аймақтары пайда болады.',
      category: 'Абаттандыру'
    },
    en: { 
      title: 'Sairan Lake Waterfront Reconstruction to be Completed by Autumn', 
      summary: 'The Akimat has approved the beautification plan for the west bank, including new bike lanes and recreational areas.',
      category: 'Urban Renewal'
    },
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800'
  }
];

/**
 * GET /api/news
 * Возвращает последние новости города на нужном языке (через query или по умолчанию все)
 */
router.get('/', (_req: Request, res: Response) => {
  res.json(ALMATY_NEWS);
});

export default router;
