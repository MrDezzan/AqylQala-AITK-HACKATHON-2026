import { useState, useEffect } from 'react';
import { 
  History, Download, Search, AlertCircle, ArrowLeft, 
  User as UserIcon, Calendar, Info, ShieldCheck
} from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import dayjs from 'dayjs';

interface LogEntry {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  details?: string;
  createdAt: string;
}

const AdminLogs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/logs');
      setLogs(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки системных логов');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/logs/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'aqylqala_audit_logs.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
      alert('Не удалось экспортировать логи');
    }
  };

  const filteredLogs = logs.filter(log => {
      const term = searchTerm.toLowerCase();
      return (
          log.action.toLowerCase().includes(term) ||
          (log.userEmail?.toLowerCase() || '').includes(term) ||
          (log.details?.toLowerCase() || '').includes(term)
      );
  });

  const getActionColor = (action: string) => {
      if (action.includes('DELETE')) return 'text-red-500 bg-red-50 border-red-100';
      if (action.includes('UPDATE')) return 'text-amber-500 bg-amber-50 border-amber-100';
      if (action.includes('CREATE')) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      return 'text-slate-500 bg-slate-50 border-slate-100';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <header className="h-20 bg-white border-b border-slate-300 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-[5000]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/users')}
            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Системный аудит</h1>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center overflow-hidden border border-primary/20 p-2 shadow-sm">
               <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">AQYLQALA LOGS PANEL</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Поиск по событиям..."
              className="w-80 bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-xs font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExport}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Download size={18} /> 
            <span className="hidden sm:inline">Экспорт XLSX</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-slate-200 shadow-sm animate-pulse">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Загрузка данных системного аудита...</p>
          </div>
        ) : error ? (
          <div className="p-10 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
            <p className="text-slate-900 font-bold mb-2">Облом</p>
            <p className="text-sm text-slate-300">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
               {filteredLogs.map((log) => (
                   <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in-up">
                       <div className="flex items-start gap-4">
                           <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${getActionColor(log.action)}`}>
                               <History size={24} />
                           </div>
                           <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                   <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getActionColor(log.action)}`}>
                                       {log.action}
                                   </span>
                                   <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 leading-none">
                                       <Calendar size={12} />
                                       {dayjs(log.createdAt).format('DD.MM.YYYY HH:mm:ss')}
                                   </span>
                               </div>
                               <h3 className="text-sm font-bold text-slate-900">{log.details || 'Действие без описания'}</h3>
                               <div className="flex items-center gap-6 mt-2 pt-2 border-t border-slate-50">
                                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                       <UserIcon size={12} className="text-slate-300" />
                                       {log.userEmail || 'Система'}
                                   </div>
                               </div>
                           </div>
                       </div>
                       <div className="flex items-center gap-2 pr-2">
                           <button className="p-2.5 text-slate-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"><Info size={18}/></button>
                       </div>
                   </div>
               ))}

               {filteredLogs.length === 0 && (
                   <div className="py-24 text-center bg-white rounded-[32px] border border-slate-200 border-dashed">
                       <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Логи не найдены</p>
                   </div>
               )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLogs;
