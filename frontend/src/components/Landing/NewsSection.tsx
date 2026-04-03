import { useState, useEffect } from 'react';
import { Newspaper, ArrowRight, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NewsSection = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/news');
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error('News Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-24 space-y-8">
      {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />)}
    </div>
  );

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="news">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-16">
          
          {/* Заголовок и вводный текст (Вертикальная колонка 1) */}
          <div className="md:w-1/3 space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-full text-primary">
              <Newspaper size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('footer.media_link')}</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              {t('dashboard.subtitle')}
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Актуальные городские новости Алматы, инициативы акимата и важные изменения в инфраструктуре мегаполиса.
            </p>
            <button 
              onClick={() => window.open('https://almaty.gov.kz', '_blank')}
              className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-sm hover:gap-5 transition-all group"
            >
              <span>Все новости города</span>
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          {/* Список новостей (Вертикальная колонка 2 - Список) */}
          <div className="md:w-2/3 space-y-8">
            {news.map((item) => {
              const content = item[i18n.language] || item.ru;
              return (
                <div 
                  key={item.id} 
                  className="group flex flex-col sm:flex-row gap-8 pb-8 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 p-4 -m-4 rounded-3xl transition-all duration-500"
                >
                  <div className="sm:w-48 h-48 sm:h-32 rounded-2xl overflow-hidden shrink-0 relative">
                    <img 
                      src={item.image} 
                      alt={content.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-primary">
                      {content.category}
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <Calendar size={12} />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-snug group-hover:text-primary transition-colors cursor-pointer">
                      {content.title}
                    </h3>
                    <p className="text-sm font-bold text-slate-400 line-clamp-2 leading-relaxed">
                      {content.summary}
                    </p>
                    <div className="pt-2">
                       <button 
                         onClick={() => alert('Полная статья скоро будет доступна!')}
                         className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primaryHover flex items-center gap-1 group/btn transition-colors"
                       >
                          Подробнее
                          <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                       </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default NewsSection;
