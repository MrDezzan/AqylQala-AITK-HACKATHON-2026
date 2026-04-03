import { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, 
  ScaleControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { 
  Navigation, Plus, X, Camera, 
  RefreshCcw, Search,
  ChevronRight, ArrowLeft, User as UserIcon,
  AlertCircle, BrainCircuit, LayoutDashboard, LogOut, Wind
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TrafficLayer from '../components/Map/TrafficLayer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ru';

dayjs.extend(relativeTime);
dayjs.locale('ru');

// Фиксим иконки лифлета
const getMarkerIcon = (status: string) => {
  const color = status === 'RESOLVED' ? '#10B981' : status === 'IN_PROGRESS' ? '#F59E0B' : '#EF4444';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; items-center; justify-content: center;">
             <div style="width: 8px; height: 8px; background: white; border-radius: 50%; opacity: 0.8"></div>
           </div>`,
    className: 'custom-status-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Определяем район на фронте (копия логики бэка для поиска)
const getDistrict = (lat: number, lng: number): string => {
  if (lat > 43.25 && lng < 76.9) return "Алмалинский";
  if (lat > 43.25 && lng >= 76.9) return "Медеуский";
  if (lat <= 43.25 && lat > 43.2 && lng < 76.85) return "Ауэзовский";
  if (lat <= 43.25 && lat > 43.2 && lng >= 76.85) return "Бостандыкский";
  if (lat <= 43.2) return "Наурызбайский";
  if (lat > 43.3) return "Турксибский";
  return "Жетысуский";
};

// Инвалидация размеров карты при изменении сайдбара
function MapResizer({ toggle }: { toggle: boolean }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 500);
  }, [toggle, map]);
  return null;
}

// Кнопка геолокации
function LocateControl() {
  const map = useMap();
  return (
    <div className="leaflet-top leaflet-left !top-[110px] sm:!top-[140px] !left-4 sm:!left-8 z-[1000] space-y-2 pointer-events-auto">
      <button 
        onClick={() => map.locate({ setView: true, maxZoom: 16 })}
        className="p-3 bg-white border border-slate-300 text-slate-700 rounded-xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all"
        title="Где я?"
      >
        <Navigation size={20} />
      </button>
    </div>
  );
}

const MapView = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  // Всякие статусы
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showTraffic, setShowTraffic] = useState(() => {
    const saved = localStorage.getItem('aqylqala_traffic');
    return saved === null ? true : saved === 'true';
  });

  // ИИ Проверка
  const [isAiValidating, setIsAiValidating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Поиск на карте и Эко-слой
  const [mapSearchTerm, setMapSearchTerm] = useState('');
  const [aqiStations, setAqiStations] = useState<any[]>([]);
  const [showAqiLayer, setShowAqiLayer] = useState(false);
  const [aqiLoading, setAqiLoading] = useState(false);
  
  const [newProblem, setNewProblem] = useState({
    category: 'дороги', description: '', address: '', lat: 43.238, lng: 76.889, photoUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProblems();
    fetchAqiStations();
  }, []);

  // Тянем станции качества воздуха из нашей сети датчиков
  const fetchAqiStations = async () => {
    setAqiLoading(true);
    try {
      const res = await api.get('/environmental');
      setAqiStations(res.data);
    } catch (err) {
      console.error('AQI Map Fetch Failed', err);
    } finally {
      setAqiLoading(false);
    }
  };

  // Тянем все точки с бэкенда
  const fetchProblems = async () => {
    try {
      const res = await api.get('/problems');
      setProblems(res.data);
    } catch (err) {
      console.error('Не удалось загрузить проблемы', err);
    }
  };

  // Фильтрация проблем для карты и списка
  const filteredProblems = problems.filter(p => {
    // Условие 1: Решенные точки исчезают через 6 часов
    if (p.status === 'RESOLVED') {
      const diffHours = dayjs().diff(dayjs(p.updatedAt), 'hour');
      if (diffHours >= 6) return false;
    }

    const term = mapSearchTerm.toLowerCase();
    const district = getDistrict(p.lat, p.lng).toLowerCase();
    return (
      (p.description?.toLowerCase() || '').includes(term) ||
      (p.category?.toLowerCase() || '').includes(term) ||
      (p.address?.toLowerCase() || '').includes(term) ||
      (p.id || '').toLowerCase().includes(term) ||
      district.includes(term)
    );
  });

  // Обработка фотки
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProblem(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Сохраняем новую проблему с ИИ-проверкой
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiError(null);
    setIsAiValidating(true);

    try {
      // 1. Просим ИИ проверить, не фигня ли написана
      const aiResponse = await api.post('/ai/validate', { description: newProblem.description });
      const { isValid, category, reason } = aiResponse.data;

      if (!isValid) {
        setAiError(reason || 'ИИ не подтвердил описание. Попробуйте описать проблему подробнее.');
        setIsAiValidating(false);
        return;
      }

      // 2. Если ИИ предложил категорию лучше - юзаем её
      const finalProblem = { ...newProblem, category: category || newProblem.category };

      // 3. Отправляем в базу
      setIsSubmitting(true);
      await api.post('/problems', finalProblem);
      setIsReporting(false);
      setNewProblem({ category: 'дороги', description: '', address: '', lat: 43.238, lng: 76.889, photoUrl: '' });
      fetchProblems();
    } catch (err) {
      console.error('Ошибка при отправке', err);
      setAiError('Не удалось проверить заявку, попробуйте еще раз.');
    } finally {
      setIsAiValidating(false);
      setIsSubmitting(false);
    }
  };

  // Обновляем статус (для акимата)
  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/problems/${id}`, { status });
      fetchProblems();
      if (selectedProblem?.id === id) {
        const update = await api.get(`/problems/${id}`);
        setSelectedProblem(update.data);
      }
    } catch (err) {
      console.error('Статус не обновился', err);
    }
  };

  // Клик по карте для выбора места
  function MapEvents() {
    useMapEvents({
      click(e) {
        if (isReporting) {
          setNewProblem(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
        }
      }
    });
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Верхняя панель */}
      <header className="h-16 sm:h-20 bg-white border-b border-slate-300 px-4 sm:px-12 flex items-center justify-between z-[5000] shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden border border-primary/20 shadow-sm shadow-primary/10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight block">{t('map.header_title')}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 leading-none">{t('common.city_name')}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Ссылки для десктопа */}
           <div className="hidden md:flex items-center gap-6 mr-6">
              {(user?.role === 'ADMIN' || user?.role === 'OFFICIAL') && (
                <button onClick={() => navigate('/dashboard')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">{t('nav.analytics')}</button>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <button onClick={() => navigate('/admin/logs')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Логи</button>
                  <button onClick={() => navigate('/admin/users')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Юзеры</button>
                </>
             )}
          </div>
          
          <LanguageSwitcher />

          <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:pl-4 sm:border-l border-slate-200">
             <div className="text-right hidden lg:block">
                <div className="text-xs font-bold leading-none mb-1">{user?.name}</div>
                <div className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{user?.role}</div>
             </div>
             <button 
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-400 shadow-inner lg:hidden"
             >
                {showMobileNav ? <X size={20} /> : user?.name?.charAt(0)}
             </button>
             {/* Выход для десктопа */}
             <button 
                onClick={() => useAuthStore.getState().logout()}
                className="hidden lg:flex w-10 h-10 rounded-xl bg-red-50 text-red-400 border border-red-100 items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm shadow-red-100"
                title="Выйти"
             >
                <LogOut size={18} />
             </button>
          </div>
        </div>

        {/* Мобильная навигация */}
        {showMobileNav && (
            <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-6 flex flex-col gap-4 md:hidden shadow-2xl z-[4500] animate-fade-in-up">
                {(user?.role === 'ADMIN' || user?.role === 'OFFICIAL') && (
                  <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl group active:scale-95 transition-all">
                    <span className="text-sm font-bold text-slate-600 group-hover:text-primary">{t('nav.analytics')}</span>
                    <LayoutDashboard size={18} className="text-slate-300 group-hover:text-primary" />
                  </button>
                )}
                {user?.role === 'ADMIN' && (
                    <button onClick={() => navigate('/admin/users')} className="flex items-center gap-3 py-3 px-4 bg-slate-50 rounded-xl text-sm font-bold"><UserIcon size={18}/> Управление пользователями</button>
                )}
                <button onClick={() => useAuthStore.getState().logout()} className="flex items-center gap-3 py-3 px-4 text-red-500 font-bold text-sm mt-2">Выйти из системы</button>
            </div>
        )}
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Боковая панель - на витрине или как попап на мобилках */}
        <aside 
          className={`absolute sm:relative inset-y-0 left-0 bg-white z-[4000] flex flex-col transition-all duration-500 ease-in-out border-r border-slate-300 shadow-2xl ${
            (selectedProblem || isReporting) ? 'w-full sm:w-[420px] translate-x-0' : 'w-0 -translate-x-full sm:translate-x-0'
          }`}
        >
          {/* Сайдбар теперь только для деталей или подачи заявки */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 sm:py-10 space-y-10 custom-scrollbar relative z-10">
            {isReporting ? (
              <form onSubmit={handleReportSubmit} className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{t('map.report_problem')}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Укажите место на карте</p>
                  </div>
                  <button type="button" onClick={() => setIsReporting(false)} className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-300"><X size={20}/></button>
                </div>

                <div className="space-y-6">
                  {aiError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-shake">
                      <AlertCircle size={18} className="shrink-0" />
                      <p className="text-[10px] font-black uppercase tracking-tight">{aiError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('map.form_category')}</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest text-primary outline-none transition-all"
                      value={newProblem.category}
                      onChange={e => setNewProblem({...newProblem, category: e.target.value})}
                    >
                      <option value="дороги">ДОРОГИ</option>
                      <option value="жкх">ЖКХ</option>
                      <option value="благоустройство">БЛАГОУСТРОЙСТВО</option>
                      <option value="экология">ЭКОЛОГИЯ</option>
                      <option value="транспорт">ТРАНСПОРТ</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('map.form_desc')}</label>
                    <textarea 
                      required rows={4}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-4 px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/5 transition-all resize-none"
                      placeholder={t('map.form_placeholder')}
                      value={newProblem.description}
                      onChange={e => setNewProblem({...newProblem, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('map.form_photo')}</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-300 rounded-2xl py-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100/50 transition-all cursor-pointer group"
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      {newProblem.photoUrl ? (
                         <div className="relative w-full px-10 h-32">
                           <img src={newProblem.photoUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                           <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-xl">
                              <Camera className="text-white" size={24} />
                           </div>
                         </div>
                      ) : (
                        <>
                          <Camera className="text-slate-300 group-hover:text-primary transition-colors" size={32} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('map.form_upload')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 relative min-h-[60px] flex items-center justify-center">
                  {isAiValidating && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl animate-fade-in">
                       <div className="flex items-center gap-3">
                          <BrainCircuit size={20} className="text-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">📢 ИИ проверяет заявку...</span>
                       </div>
                    </div>
                  )}
                  
                  <button 
                    type="submit" disabled={isSubmitting || isAiValidating}
                    className="w-full py-5 bg-primary hover:bg-primaryHover text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50"
                  >
                    {(isSubmitting || isAiValidating) ? '...' : t('map.form_submit')}
                    {!(isSubmitting || isAiValidating) && <ChevronRight size={18} />}
                  </button>
                </div>
              </form>
            ) : selectedProblem ? (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                  <button onClick={() => setSelectedProblem(null)} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all">
                    <ArrowLeft size={20}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Назад к списку</span>
                  </button>
                  <button onClick={() => setSelectedProblem(null)} className="p-2 text-slate-300 sm:hidden"><X size={20}/></button>
                </div>

                <div className="space-y-8">
                  <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 relative shadow-inner">
                    {selectedProblem.photoUrl ? (
                      <img src={selectedProblem.photoUrl} alt="Problem" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3 opacity-30">
                        <Camera size={40}/>
                        <span className="text-[10px] font-black uppercase tracking-widest">Нет фото</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                      {selectedProblem.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                      Заявка №{selectedProblem.id.slice(-6).toUpperCase()}
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                      <AlertCircle size={12} />
                      Дата зафиксирована: {dayjs(selectedProblem.createdAt).format('D MMMM YYYY, HH:mm')}
                    </div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      {selectedProblem.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Текущий статус</span>
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                         selectedProblem.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                         selectedProblem.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                       }`}>
                         {t(`map.status_labels.${selectedProblem.status}`)}
                       </span>
                    </div>

                    {/* Кнопки управления для сотрудников */}
                    {(user?.role === 'OFFICIAL' || user?.role === 'ADMIN') && (
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => updateStatus(selectedProblem.id, 'IN_PROGRESS')}
                          className="py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                        >В работу</button>
                        <button 
                          onClick={() => updateStatus(selectedProblem.id, 'RESOLVED')}
                          className="py-4 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                        >Решено</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        {/* Сама карта */}
        <div className="flex-1 relative overflow-hidden">
          {/* Универсальный поиск (Floating) */}
          {!isReporting && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 z-[1000] w-full px-6 sm:p-0 sm:w-auto">
               <div className="bg-white/90 backdrop-blur-md border border-slate-300 rounded-[22px] shadow-2xl flex items-center p-1.5 min-w-[280px] sm:w-[400px] transition-all focus-within:ring-4 focus-within:ring-primary/10">
                  <div className="w-12 h-12 flex items-center justify-center text-slate-400">
                    <Search size={20} />
                  </div>
                  <input 
                    type="text" 
                    placeholder={t('map.search_placeholder_context')}
                    className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-700 placeholder:text-slate-400 pr-4"
                    value={mapSearchTerm}
                    onChange={(e) => setMapSearchTerm(e.target.value)}
                  />
                  {mapSearchTerm && (
                    <button 
                      onClick={() => setMapSearchTerm('')}
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
               </div>
            </div>
          )}
          {/* Плавающие кнопки управления в углу (Стенд-бай поверх карты) */}
          <div className="absolute bottom-24 right-4 sm:right-8 z-[1000] pointer-events-auto flex flex-col gap-3">
             <button 
                onClick={() => {
                   const newState = !showTraffic;
                   setShowTraffic(newState);
                   localStorage.setItem('aqylqala_traffic', newState.toString());
                }}
                className={`p-3 rounded-xl shadow-2xl transition-all border ${showTraffic ? 'bg-primary text-white border-primary' : 'bg-white text-slate-700 border-slate-300'}`}
                title={t('map.traffic_short')}
              >
                <RefreshCcw className={`w-5 h-5 ${showTraffic ? 'animate-spin-slow' : ''}`} />
              </button>

              <button 
                onClick={() => setShowAqiLayer(!showAqiLayer)}
                className={`p-3 rounded-xl shadow-2xl transition-all border ${showAqiLayer ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'}`}
                title={t('map.air_quality_short')}
              >
                <Wind className={`w-5 h-5 ${aqiLoading ? 'animate-pulse' : ''}`} />
              </button>
          </div>

          {/* Плавающая легенда V2 (Стенд-бай поверх карты) */}
          <div className="hidden sm:block absolute top-8 right-8 z-[1000] bg-white border border-slate-300 p-5 rounded-2xl shadow-2xl space-y-6 pointer-events-auto w-[200px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('map.legend_title')}</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-danger border border-white"></div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">{t('map.legend_new')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-warning border border-white"></div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">{t('map.legend_progress')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-success border border-white"></div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">{t('map.legend_resolved')}</span>
                  </div>
                </div>
              </div>

              {showAqiLayer && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-fade-in">
                   <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('map.aqi_legend_title')}</p>
                   </div>
                   <div className="space-y-2">
                      <div className="flex items-center justify-between">
                         <div className="h-1.5 flex-1 bg-emerald-500 rounded-l-full"></div>
                         <div className="h-1.5 flex-1 bg-amber-500"></div>
                         <div className="h-1.5 flex-1 bg-orange-500"></div>
                         <div className="h-1.5 flex-1 bg-red-500 rounded-r-full"></div>
                      </div>
                      <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                         <span>{t('map.aqi_good')}</span>
                         <span>{t('map.aqi_moderate')}</span>
                         <span>{t('map.aqi_danger')}</span>
                      </div>
                   </div>
                </div>
              )}
          </div>

          <MapContainer 
            center={[43.238, 76.889]} 
            zoom={13} 
            maxBounds={[[43.1, 76.7], [43.4, 77.1]]}
            minZoom={12}
            style={{ 
               height: '100%', 
               width: '100%', 
               background: '#F1F5F9',
               cursor: isReporting ? 'crosshair' : 'grab'
            }} 
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents />
            <MapResizer toggle={selectedProblem || isReporting} />
            <LocateControl />
            <ScaleControl position="bottomright" metric={true} imperial={false} />
            
            {showTraffic && <TrafficLayer />}

            {/* Отрисовка станций качества воздуха (AQI) */}
            {showAqiLayer && aqiStations.map((station: any, i: number) => {
              const aqi = station.aqi;
              const color = aqi <= 50 ? '#10B981' : aqi <= 100 ? '#F59E0B' : aqi <= 150 ? '#EF6C00' : '#EF4444';
              return (
                <Marker 
                  key={`aqi-${i}`} 
                  position={[station.lat, station.lng]}
                  icon={L.divIcon({
                    html: `<div style="background-color: ${color}; width: 34px; height: 34px; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 900; opacity: 0.85; backdrop-filter: blur(2px); transition: all 0.3s ease; animation: pulse-subtle 3s infinite;">${aqi}</div>`,
                    className: 'aqi-marker-container',
                    iconSize: [34, 34],
                    iconAnchor: [17, 17]
                  })}
                  zIndexOffset={-500}
                >
                  <Popup className="minimal-popup">
                    <div className="p-4 space-y-3 min-w-[180px]">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Wind size={14} className="text-primary" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('map.sensor_details')}</span>
                          </div>
                          <span className="text-[8px] font-bold text-slate-300">{t('admin.table.status')}: {station.id}</span>
                       </div>
                       <h4 className="text-sm font-bold text-slate-900 leading-tight">{station.name}</h4>
                       <div className="flex items-end gap-3 pt-2">
                          <span className="text-3xl font-black tabular-nums leading-none" style={{ color }}>{aqi}</span>
                          <div className="text-[10px] font-bold text-slate-500 uppercase leading-tight mb-0.5">
                             {t('map.pm25_label').split(' ')[0]} <br/> {t('map.pm25_label').split(' ')[1]}
                          </div>
                       </div>
                       <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                          <div className="h-full" style={{ width: `${Math.min(100, (aqi/200)*100)}%`, backgroundColor: color }}></div>
                       </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Отрисовка проблем стандартными маркерами */}
            {filteredProblems.map(p => (
              <Marker 
                key={p.id} 
                position={[Number(p.lat), Number(p.lng)]}
                icon={getMarkerIcon(p.status)}
                zIndexOffset={1000}
                eventHandlers={{
                  click: () => {
                    setSelectedProblem(p);
                    setIsReporting(false);
                  }
                }}
              >
                <Popup className="minimal-popup">
                  <div className="p-2 min-w-[100px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">{p.category}</span>
                    <p className="text-[10px] font-bold text-slate-500 truncate">{p.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Метка-превью при создании новой проблемы */}
            {isReporting && (
              <Marker 
                position={[newProblem.lat, newProblem.lng]}
                icon={L.divIcon({
                  html: `<div class="animate-pulse" style="background-color: #0055BB; width: 16px; height: 16px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 15px rgba(0,85,187,0.5)"></div>`,
                  className: 'reporting-marker',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })}
              />
            )}
          </MapContainer>

          {/* Главная кнопка действия (FAB) */}
          {!isReporting && !selectedProblem && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 sm:left-10 sm:translate-x-0 z-[500] w-full px-8 sm:p-0 sm:w-auto">
              <button 
                onClick={() => setIsReporting(true)}
                className="w-full sm:w-auto bg-primary hover:bg-primaryHover text-white font-black py-4 px-10 rounded-2xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-sm"
              >
                <Plus size={24} />
                <span>{t('map.report_problem')}</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MapView;
