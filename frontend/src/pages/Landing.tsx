import { 
  ChevronRight, ArrowRight,
  Users, Building2, Menu, X, LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NewsSection from '../components/Landing/NewsSection';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Обработчик кнопки "Начать"
  const handleStart = () => {
    if (user) navigate('/map');
    else navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* Шапка сайта - тут вся навигация */}
      <nav className="h-20 border-b border-slate-300 flex items-center justify-between px-6 sm:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-[5000]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 border border-primary/20">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight">AqylQala <span className="text-slate-400 font-medium text-sm hidden sm:inline">| {t('common.city_name')}</span></span>
        </div>
        
        {/* Меню для компов */}
         <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors">{t('nav.overview')}</a>
            {(user?.role === 'ADMIN' || user?.role === 'OFFICIAL') && (
              <a href="#analytics" className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors">{t('nav.analytics')}</a>
            )}
            <LanguageSwitcher />
            
             {user ? (
               <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigate('/map')}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primaryHover transition-all active:scale-95"
                  >
                    {t('nav.goToMap')}
                  </button>
                  <button 
                    onClick={() => useAuthStore.getState().logout()}
                    className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                    title={t('nav.logout')}
                  >
                    <LogOut size={18} />
                  </button>
               </div>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/auth')} className="text-sm font-bold text-slate-600 hover:text-primary px-4">{t('nav.login')}</button>
                <button onClick={() => navigate('/auth')} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primaryHover transition-all active:scale-95">
                  {t('nav.join')}
                </button>
              </div>
            )}
        </div>

        {/* Бургер для мобилок */}
        <div className="lg:hidden flex items-center gap-4">
           <LanguageSwitcher />
           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
           </button>
        </div>

        {/* Мобильное меню (выезжалка) */}
        {isMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 p-8 flex flex-col gap-6 lg:hidden shadow-2xl animate-fade-in-up z-[4000]">
             <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900">{t('nav.overview')}</a>
             {(user?.role === 'ADMIN' || user?.role === 'OFFICIAL') && (
                <a href="#analytics" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900">{t('nav.analytics')}</a>
             )}
             <hr className="border-slate-100" />
             {user ? (
                <div className="flex flex-col gap-4">
                   <button onClick={() => navigate('/map')} className="w-full bg-primary text-white py-4 rounded-2xl font-bold">{t('nav.goToMap')}</button>
                   <button onClick={() => useAuthStore.getState().logout()} className="w-full py-4 border border-red-200 text-red-500 rounded-2xl font-bold">{t('nav.logout')}</button>
                </div>
             ) : (
                <div className="flex flex-col gap-4">
                   <button onClick={() => navigate('/auth')} className="w-full py-4 border border-slate-200 rounded-2xl font-bold">{t('nav.login')}</button>
                   <button onClick={() => navigate('/auth')} className="w-full bg-primary text-white py-4 rounded-2xl font-bold">{t('nav.join')}</button>
                </div>
             )}
          </div>
        )}
      </nav>

      {/* Главный блок - привлекаем внимание */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-50 sm:opacity-100">
          <div className="absolute top-0 right-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-primary/5 rounded-full blur-[120px] -mr-48 sm:-mr-96 -mt-48 sm:-mt-96"></div>
          <div className="absolute bottom-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-accent/5 rounded-full blur-[100px] -ml-24 sm:-ml-48 -mb-24 sm:-mb-48"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-8 sm:space-y-10 animate-fade-in-up">
          <h1 className="text-4xl sm:text-7xl font-bold tracking-tight text-slate-900 leading-[1.2] sm:leading-[1.1]">
            {t('hero.title_p1')} <br className="hidden sm:block" />
            <span className="text-primary italic"> {t('hero.title_p2')}</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pt-4">
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-primary hover:bg-primaryHover text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              {t('hero.start')}
              <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-white border border-slate-300 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              Как это работает?
            </button>
          </div>
          
          {/* Плашки со статой */}
          <div className="pt-12 sm:pt-16 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
             <div className="flex flex-col items-center gap-1">
                <span className="text-2xl sm:text-3xl font-black tabular-nums">2.1M</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Жителей</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-2xl sm:text-3xl font-black tabular-nums">100%</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Цифровизация</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-2xl sm:text-3xl font-black tabular-nums">24/7</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Мониторинг</span>
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-2xl sm:text-3xl font-black tabular-nums">AI</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">Прогнозы</span>
             </div>
          </div>
        </div>
      </section>

      {/* Фишки системы */}
      <section id="features" className="py-20 sm:py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('features.title')}</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FeatureCard 
              icon={<Users size={28} className="text-blue-600" />}
              title={t('features.citizen')}
              description={t('features.citizen_desc')}
            />
            <FeatureCard 
              icon={<Building2 size={28} className="text-accent" />}
              title={t('features.official')}
              description={t('features.official_desc')}
            />
          </div>
        </div>
      </section>

      {/* Городская повестка - Вертикальная лента новостей */}
      <NewsSection />

      {/* Подвал сайта */}
      <footer className="bg-white border-t border-slate-300 pt-16 sm:pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden border border-white/20">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover brightness-0 invert" />
              </div>
              <span className="text-lg font-bold tracking-tight">AqylQala</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Цифровая экосистема Алматы. Делаем город лучше вместе с помощью данных и ИИ.
            </p>
          </div>

          <div>
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">{t('footer.services')}</h4>
             <ul className="space-y-4 text-sm font-semibold text-slate-600">
                <li><a href="#" className="hover:text-primary">{t('footer.map_link')}</a></li>
                <li><a href="#" className="hover:text-primary">{t('footer.analytics_link')}</a></li>
                <li><a href="#" className="hover:text-primary">{t('footer.reports_link')}</a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">{t('footer.info')}</h4>
             <ul className="space-y-4 text-sm font-semibold text-slate-600">
                <li><a href="#" className="hover:text-primary">{t('footer.about_link')}</a></li>
                <li><a href="#" className="hover:text-primary">{t('footer.security_link')}</a></li>
                <li><a href="#" className="hover:text-primary">{t('footer.media_link')}</a></li>
             </ul>
          </div>

          <div>
             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">{t('footer.contact')}</h4>
             <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-primary hover:border-primary transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© {t('footer.rights')}</p>
          <div className="flex gap-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            <a href="#" className="hover:text-slate-900">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-slate-900">{t('footer.terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Карточка с фишками
function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="p-8 sm:p-10 bg-white border border-slate-200 rounded-[32px] space-y-6 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-6">
        <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500">
          {icon}
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-slate-900 leading-none">{title}</h3>
          <p className="text-base text-slate-500 leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>
      <div className="pt-6 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-60">
           Доступно в системе <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}
