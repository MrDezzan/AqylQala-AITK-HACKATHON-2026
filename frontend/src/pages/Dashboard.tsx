import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../lib/api';
import { 
  LayoutDashboard, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  RefreshCcw, 
  BrainCircuit, 
  Filter,
  ShieldCheck,
  Quote,
  Zap,
  Activity,
  ArrowLeft,
  FileText,
  Wind
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import AiChat from '../components/Dashboard/AiChat';

// Цвета для графиков
const COLORS = ['#0055BB', '#00AEEF', '#059669', '#6366F1', '#D946EF', '#F59E0B', '#DC2626'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  // Состояния для статы, ИИ и качества воздуха (AQI)
  const [stats, setStats] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [aqiData, setAqiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aqiLoading, setAqiLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('week');

  useEffect(() => {
    fetchStats();
    fetchAqi();
    fetchAiInsight();
  }, []);

  // Получение актуальных статистических данных с сервера
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/problems/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Стата не пришла', err);
    } finally {
      setLoading(false);
    }
  };

  // Запрос данных о качестве воздуха из нашей сети датчиков
  const fetchAqi = async () => {
    setAqiLoading(true);
    try {
      const res = await api.get('/environmental/stats');
      setAqiData(res.data);
    } catch (err) {
      console.error('AQI Error:', err);
    } finally {
      setAqiLoading(false);
    }
  };

  // Запрос аналитических выводов у модуля искусственного интеллекта
  const fetchAiInsight = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/ai/dashboard-insights');
      setAiInsight(res.data);
    } catch (err) {
      console.error('ИИ чет тупит', err);
      // Заглушка если бэк упал
      setAiInsight({
        summary: 'Система временно недоступна, но мы продолжаем собирать данные.',
        actions: ['Попробуйте позже для получения детального отчета']
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Делаем PDF отчет из текущего экрана
  const exportToPDF = async () => {
    const dashboard = document.getElementById('dashboard-content');
    if (!dashboard) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboard, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#F8FAFC'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Otchet-AqylQala-${new Date().toLocaleDateString()}.pdf`);
    } catch (err) {
      console.error('PDF не собрался', err);
      alert('Ошибка при сохранении PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOfficialDocx = async () => {
    try {
      setIsReporting(true);
      const res = await api.post('/ai/report-docx', { period: reportPeriod }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AqylQala_Report_${reportPeriod}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('DOCX Export failed', err);
      alert('Не удалось сгенерировать официальный документ');
    } finally {
      setIsReporting(false);
    }
  };

  if (loading || !stats) {
    return <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 text-primary font-bold animate-pulse text-center p-6">
      <RefreshCcw className="animate-spin" size={32} />
      <span>Собираем данные по городу...</span>
    </div>;
  }

  const statusData = stats.byStatus || [];
  const categoryData = stats.byCategory || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 font-sans relative">
      <AiChat contextStats={stats} />
      
      {/* Шапка дашборда */}
      <header className="h-16 sm:h-20 bg-white border-b border-slate-300 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-[5000]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden border border-primary/20 shadow-sm shadow-primary/10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold tracking-tight block">AqylQala</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 leading-none">Almaty City</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => navigate('/map')}
            className="p-2 text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 rounded-xl"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight leading-none">{t('dashboard.title')}</h1>
            <p className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('dashboard.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-6 mr-4">
             {user?.role === 'ADMIN' && (
                <>
                  <button 
                    onClick={() => navigate('/admin/logs')} 
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all underline decoration-2 decoration-transparent hover:decoration-slate-900 underline-offset-8"
                  >Логи</button>
                  <button 
                    onClick={() => navigate('/admin/users')} 
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all underline decoration-2 decoration-transparent hover:decoration-slate-900 underline-offset-8"
                  >{t('admin.users')}</button>
                </>
             )}
          </div>
          <LanguageSwitcher />
          
          <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-4">
            <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mr-2">
               <select 
                 className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest px-3 py-2 transition-all cursor-pointer outline-none hover:bg-slate-100"
                 value={reportPeriod}
                 onChange={(e) => setReportPeriod(e.target.value)}
               >
                 <option value="week">Неделя</option>
                 <option value="month">Месяц</option>
                 <option value="year">Год</option>
               </select>
                <button 
                  onClick={exportOfficialDocx}
                  disabled={isReporting}
                  className="bg-primary text-white p-2.5 hover:bg-primaryHover transition-all border-l border-primary/10 disabled:opacity-50 flex items-center gap-2"
                  title="Экспорт в DOCX (Официально)"
                >
                  {isReporting ? <RefreshCcw size={14} className="animate-spin" /> : <FileText size={14} />}
                  <span className="text-[9px] font-black uppercase tracking-widest pr-2 hidden lg:inline">DOCX</span>
                </button>
            </div>

            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="group relative bg-slate-900 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isExporting ? <RefreshCcw size={16} className="animate-spin" /> : <Download size={16} />} 
              <span className="hidden sm:inline ml-2">{isExporting ? '...' : t('dashboard.export_pdf')}</span>
            </button>
          </div>
        </div>
      </header>

      <div id="dashboard-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Сетка с карточками-метриками */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <StatCard label={t('dashboard.total_cases')} value={stats.total} icon={<LayoutDashboard size={18} />} color="text-primary" />
          <StatCard label={t('dashboard.in_progress')} value={statusData.find((s: any) => s.status === 'IN_PROGRESS')?.count || 0} icon={<TrendingUp size={18} />} color="text-warning" />
          <StatCard label={t('dashboard.resolved_24h')} value={statusData.find((s: any) => s.status === 'RESOLVED')?.count || 0} icon={<CheckCircle2 size={18} />} color="text-success" />
          <StatCard label={t('dashboard.resolved_percent')} value={`${stats.resolvedPercentage || 0}%`} icon={<Zap size={18} />} color="text-emerald-600" />
          <StatCard label={t('dashboard.participants')} value={stats.totalUsers || 0} icon={<Activity size={18} />} color="text-blue-600" />
          <StatCard label={t('dashboard.ai_accuracy')} value={`${stats.aiEfficiency || 0}%`} icon={<BrainCircuit size={18} />} color="text-purple-600" />
          <StatCard label={t('dashboard.response_time')} value={`${stats.avgResolveTimeHours || 0}ч`} icon={<AlertCircle size={18} />} color="text-indigo-600" />
          <AQICard data={aqiData} loading={aqiLoading} />
        </div>

        <div className="h-px bg-slate-200 w-full"></div>

        {/* Блок с ИИ отчетом V5 (Minimalist Gov-Tech) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-4 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-8 sm:p-12 space-y-12">
            {/* Header: Clean & Sharp */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-primary shadow-sm">
                     <BrainCircuit className={aiLoading ? "animate-pulse" : ""} size={32} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold tracking-tight text-slate-900">Стратегическая аналитика ИИ</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Официальный аналитический узел</p>
                  </div>
               </div>
               
               {!aiLoading && (
                 <div className="px-5 py-2 rounded-full bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-500">
                    <ShieldCheck size={16} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Система верифицирована</span>
                 </div>
               )}
            </div>

            {aiLoading ? (
              <div className="py-24 text-center">
                 <RefreshCcw className="animate-spin text-slate-200 mx-auto mb-4" size={40} />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Идет формирование стратегического отчета ИИ...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Левая часть: Выводы */}
                <div className="xl:col-span-8 flex flex-col gap-12">
                   <div className="relative">
                      <Quote className="absolute -top-4 -left-4 text-slate-50 opacity-50" size={60} />
                      <p className="text-lg font-medium text-slate-900 leading-relaxed relative z-10">
                        {aiInsight?.summary}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                         <div className="flex items-center gap-2 text-primary">
                            <TrendingUp size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Прогноз на неделю</span>
                         </div>
                         <p className="text-sm text-slate-600 leading-relaxed font-medium">
                           {aiInsight?.forecast}
                         </p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                         <div className="flex items-center gap-2 text-slate-500">
                            <Zap size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Закономерности</span>
                         </div>
                         <p className="text-sm text-slate-500 italic leading-relaxed">
                           {aiInsight?.correlations}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Загружаем данные государственного реестра...</p>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Рекомендуемые управленческие шаги</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {aiInsight?.actions?.map((action: string, i: number) => (
                           <div key={i} className="flex gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:border-primary transition-colors group">
                              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">{i+1}</div>
                              <span className="text-xs font-bold text-slate-700 leading-snug">{action}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Правая часть: Монитор */}
                <div className="xl:col-span-4">
                   <div className="bg-slate-900 rounded-[28px] p-8 text-white space-y-8 flex flex-col h-full shadow-2xl shadow-slate-900/20">
                      <div className="flex items-center justify-between border-b border-white/5 pb-6">
                         <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 font-display italic">Health Monitor</h4>
                         <Activity className="text-primary/50" size={20} />
                      </div>

                      <div className="space-y-6 flex-1">
                        {aiInsight?.painIndex?.map((d: any, i: number) => (
                          <div key={i} className="space-y-2">
                             <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-slate-400">{d.district}</span>
                                <span className={d.status === 'CRITICAL' ? 'text-red-400' : d.status === 'WARNING' ? 'text-amber-400' : 'text-emerald-400'}>
                                   {d.score}%
                                </span>
                             </div>
                             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${d.score}%` }}
                                  className={`h-full ${d.status === 'CRITICAL' ? 'bg-red-500' : d.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                ></motion.div>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Бар-чарт по категориям */}
          <div className="bg-white p-6 sm:p-10 space-y-6 flex flex-col rounded-[24px] sm:rounded-[32px] border border-slate-300 shadow-sm transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('dashboard.charts.category_label')}</h4>
                 <h2 className="text-lg sm:text-xl font-bold">{t('dashboard.charts.by_category')}</h2>
              </div>
              <Filter size={18} className="text-slate-200" />
            </div>
            <div className="h-[300px] sm:h-[400px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '900' }} />
                  <Bar dataKey="count" fill="#0055BB" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Пай-чарт по статусам */}
          <div className="bg-white p-6 sm:p-10 space-y-6 flex flex-col rounded-[24px] sm:rounded-[32px] border border-slate-300 shadow-sm transition-all hover:shadow-lg">
             <div className="flex items-center justify-between">
              <div>
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('dashboard.charts.status_label')}</h4>
                 <h2 className="text-lg sm:text-xl font-bold">{t('dashboard.charts.by_status')}</h2>
              </div>
              <TrendingUp size={18} className="text-slate-200" />
            </div>
            <div className="h-[300px] sm:h-[400px] w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="count" nameKey="status">
                    {statusData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" iconType="circle" formatter={(val) => <span className="font-black text-[9px] uppercase tracking-widest text-slate-600">{val}</span>} wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Карточка с числовыми данными
const StatCard = ({ label, value, icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 group transition-all"
  >
    <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary/5 transition-colors`}>
      <div className={color}>{icon}</div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  </motion.div>
);

// Компонент качества воздуха (AQI)
const AQICard = ({ data, loading }: any) => {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 animate-pulse">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-2 w-1/2 bg-slate-100 rounded" />
          <div className="h-6 w-3/4 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  const aqi = data?.avgAqi || 0;
  
  // Определяем статус по значению AQI
  const getAQIStatus = (val: number) => {
    if (val <= 50) return { label: t('map.aqi_good'), color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (val <= 100) return { label: t('map.aqi_moderate'), color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' };
    if (val <= 150) return { label: t('map.aqi_unhealthy'), color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' };
    return { label: t('map.aqi_danger'), color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' };
  };

  const status = getAQIStatus(aqi);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 group transition-all"
    >
      <div className={`w-14 h-14 rounded-2xl ${status.bg} border ${status.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        <Wind className={status.color} size={22} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('AQI Индекс ')}</p>
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${status.bg} ${status.color} border ${status.border}`}>
            {status.label}
          </span>
        </div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">
          {aqi > 0 ? aqi : '...'}
          <span className="text-[10px] text-slate-400 ml-1 font-medium">PM2.5</span>
        </p>
      </div>
    </motion.div>
  );
};
