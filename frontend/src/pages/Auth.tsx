import { useState } from 'react';
import { 
  Mail, Lock, User, Fingerprint, AlertCircle, Building2, UserCircle2, 
  ChevronRight, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, registerOfficial } = useAuthStore();
  const { t } = useTranslation();
  
  // Состояния для переключения входа/реги и ошибок
  const [isLogin, setIsLogin] = useState(true);
  const [isOfficial, setIsOfficial] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Форма со всеми полями
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', phone: '', city: 'Алматы', iin: ''
  });

  // Обработчик входа/регистрации
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Логинимся либо по почте, либо по ИИН
        await login(isOfficial ? { iin: formData.iin, password: formData.password } : { email: formData.email, password: formData.password });
      } else {
        // Регаем либо обычного чела, либо сотрудника (если админ разрешил)
        if (isOfficial) {
           await registerOfficial(formData.iin, formData.password);
        } else {
           await register(formData);
        }
      }
      navigate('/map');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Че-то пошло не так, проверь че ввел');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Декор на фоне, чтоб красиво было */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-warning/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Навигация и выбор языка */}
        <div className="flex items-center justify-between mb-8">
           <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-400 hover:text-slate-900 transition-all font-black uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft size={16} /> На главную
          </button>
          <LanguageSwitcher />
        </div>

        {/* Лого и название */}
        <div className="text-center mb-10 space-y-2">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-[24px] mx-auto flex items-center justify-center shadow-xl shadow-slate-200/50 mb-4">
             <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden border border-primary/20 shadow-md">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
             </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AqylQala Portal</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Вход в систему</p>
        </div>

        {/* Сама карточка авторизации */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-300">
          {/* Вкладки Рега/Вход (только для жителей) */}
          {!isOfficial ? (
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
              <button 
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t('auth.login_tab')}
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t('auth.register_tab')}
              </button>
            </div>
          ) : (
            <div className="mb-8 text-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {t('auth.official_badge')}
               </p>
               {!isLogin && (
                 <p className="text-[9px] text-primary font-black uppercase mt-1 tracking-wider">
                   {t('auth.official_reg_notice')}
                 </p>
               )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Выбор - ты обычный юзер или из акимата */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-slate-50 rounded-xl">
               <button 
                type="button"
                className={`py-2.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!isOfficial ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                onClick={() => { setIsOfficial(false); setError(''); }}
               >
                 <UserCircle2 size={12} /> {t('auth.role_citizen')}
               </button>
               <button 
                type="button"
                className={`py-2.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isOfficial ? 'bg-warning text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                onClick={() => { setIsOfficial(true); setIsLogin(true); setError(''); }}
               >
                 <Building2 size={12} /> {t('auth.role_official')}
               </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                <AlertCircle size={18} />
                <p className="text-[10px] font-black uppercase">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Поле ИИНа для сотрудников */}
              {isOfficial ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.iin')}</label>
                  <div className="relative">
                    <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" required maxLength={12}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3.5 px-11 text-sm font-bold outline-none transition-all"
                      placeholder="Твой ИИН"
                      value={formData.iin}
                      onChange={e => setFormData({...formData, iin: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <>
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.name')}</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="text" required
                          className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3.5 px-11 text-sm font-bold outline-none transition-all"
                          placeholder="Имя Фамилия"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.email')}</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input 
                        type="email" required
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3.5 px-11 text-sm font-bold outline-none transition-all"
                        placeholder="test@mail.kz"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Пароль - нужен всем */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('auth.password')}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="password" required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3.5 px-11 text-sm font-bold outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Главная кнопка входа */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 disabled:opacity-50 mt-4 ${
                isOfficial ? 'bg-warning hover:bg-amber-600' : 'bg-primary hover:bg-primaryHover'
              }`}
            >
              {loading ? '...' : (isLogin ? t('auth.submit_login') : t('auth.submit_register'))}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
