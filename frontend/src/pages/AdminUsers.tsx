import { useState, useEffect } from 'react';
import { 
  Trash2, Shield, User as UserIcon, Building2, Search,
  AlertCircle, ArrowLeft, Plus, X, Fingerprint, Lock, Mail, UserCircle2
} from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Пропсы для юзера
interface User {
  id: string;
  name: string;
  email?: string;
  iin?: string;
  role: 'USER' | 'OFFICIAL' | 'ADMIN';
  city: string;
  department?: string;
  createdAt: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Состояния для списка и фильтров
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Данные для нового юзера (теперь с выбором роли)
  const [newUserData, setNewUserData] = useState({
    name: '', email: '', iin: '', password: '', role: 'OFFICIAL' as any, department: '', phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Вытягиваем актуальный список пользователей из базы данных
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Че-то не грузится список, может прав не хватает?');
    } finally {
      setLoading(false);
    }
  };

  // Удаляем чела если накосячил
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалилось че-то');
    }
  };

  // Регаем нового сотрудника или админа
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', newUserData);
      setShowAddModal(false);
      setNewUserData({ name: '', email: '', iin: '', password: '', role: 'OFFICIAL', department: '', phone: '' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Ошибка при реге, проверь данные');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Простой поиск по строке (улучшенная версия)
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name?.toLowerCase() || '').includes(term) ||
      (u.email?.toLowerCase() || '').includes(term) ||
      (u.iin || '').includes(term)
    );
  });

  // Цветные плашки для ролей
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white flex items-center justify-center gap-1.5"><Shield size={10}/> {t('admin.roles.admin')}</span>;
      case 'OFFICIAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-warning text-white flex items-center justify-center gap-1.5"><Building2 size={10}/> {t('admin.roles.official')}</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-primary text-white flex items-center justify-center gap-1.5"><UserIcon size={10}/> {t('admin.roles.citizen')}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Шапка админки */}
      <header className="h-20 bg-white border-b border-slate-300 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-[5000]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/map')}
            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight">{t('admin.title')}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t('admin.search_placeholder')}
              className="w-40 md:w-80 bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all text-xs font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <LanguageSwitcher />
             <button 
              onClick={() => setShowAddModal(true)}
              className="group relative bg-emerald-600 text-white p-3 sm:px-6 sm:py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              <Plus size={18} /> 
              <span className="hidden md:inline">{t('admin.add_user')}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm animate-pulse text-center">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Загружаем данные пользователей...</p>
          </div>
        ) : error ? (
          <div className="p-10 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
            <p className="text-slate-900 font-bold mb-2">Облом</p>
            <p className="text-sm text-slate-300">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl sm:rounded-[32px] border border-slate-300 shadow-sm overflow-hidden animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 font-black">
                    <th className="px-4 sm:px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest">{t('admin.table.profile')}</th>
                    <th className="px-4 sm:px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest">{t('admin.table.status')}</th>
                    <th className="hidden md:table-cell px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest">{t('admin.table.contacts')}</th>
                    <th className="hidden lg:table-cell px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest">{t('admin.table.registration')}</th>
                    <th className="px-4 sm:px-8 py-6 text-[10px] text-slate-400 uppercase tracking-widest text-right">{t('admin.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-4 sm:px-8 py-5">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-600 shadow-sm text-xs">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none">{user.name}</div>
                            <div className="text-[9px] sm:text-[10px] font-black tracking-tighter text-slate-400 uppercase">{user.city || 'Almaty'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-5">
                        <div className="flex flex-col gap-1.5 items-start">
                          {getRoleBadge(user.role)}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-8 py-5">
                        <code className="text-[10px] sm:text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-600 font-bold">
                          {user.role === 'OFFICIAL' || user.role === 'ADMIN' ? user.iin : user.email}
                        </code>
                      </td>
                      <td className="hidden lg:table-cell px-8 py-5">
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-5 text-right">
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center justify-end gap-2">
                             <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 text-[9px] font-black uppercase text-slate-400 bg-slate-50 rounded-lg">Отмена</button>
                             <button onClick={() => handleDelete(user.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-[9px] font-bold shadow-lg">Да</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(user.id)} className="p-2 sm:p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={16}/></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Окно добавления нового сотрудника/админа */}
      {showAddModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl sm:rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 scroll-smooth max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold">{t('admin.modal.title')}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6 sm:p-10 space-y-4 sm:space-y-5">
               {/* Выбор роли - терь можно и админа бахнуть */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Права доступа</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                     <button 
                        type="button" 
                        onClick={() => setNewUserData({...newUserData, role: 'OFFICIAL'})}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newUserData.role === 'OFFICIAL' ? 'bg-white text-warning shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >Акимат</button>
                     <button 
                        type="button" 
                        onClick={() => setNewUserData({...newUserData, role: 'ADMIN'})}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newUserData.role === 'ADMIN' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                      >Админ</button>
                  </div>
               </div>

               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.modal.name')}</label>
                <div className="relative">
                  <UserCircle2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-12 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Ерлан Ахметов"
                    value={newUserData.name}
                    onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.modal.iin')}</label>
                  <div className="relative">
                    <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input required maxLength={12}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-12 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                      placeholder="ЖСН / ИИН"
                      value={newUserData.iin}
                      onChange={e => setNewUserData({...newUserData, iin: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.modal.dept')}</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-5 text-[10px] font-black uppercase tracking-wider focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    value={newUserData.department}
                    onChange={e => setNewUserData({...newUserData, department: e.target.value})}
                  >
                    <option value="">Не указан</option>
                    <option value="Управление ЖКХ">ЖКХ</option>
                    <option value="Управление дорог">Дороги</option>
                    <option value="Экология">Экология</option>
                  </select>
                </div>
              </div>

               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.modal.email')}</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="email"
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-12 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    placeholder="email@example.kz"
                    value={newUserData.email}
                    onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1 pb-2 sm:pb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.modal.password')}</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input type="password" required
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 px-12 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Придумай пароль"
                    value={newUserData.password}
                    onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 sm:py-5 bg-emerald-600 text-white rounded-2xl sm:rounded-[24px] font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? '...' : t('admin.modal.submit')}
                {!isSubmitting && <Plus size={20} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
