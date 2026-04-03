import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../../lib/api';

interface Message {
  id: string;
  text: string;
  isAi: boolean;
}

const AiChat = ({ contextStats }: { contextStats?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Здравствуй. Я суверенный ИИ-помощник Акимата. Готов проанализировать городские данные.', isAi: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMessage, isAi: false }]);
    setIsLoading(true);

    try {
      // Подготовка контекста если он передан
      const contextString = contextStats ? JSON.stringify({
        total: contextStats.total,
        aiEfficiency: contextStats.aiEfficiency,
        topCategories: contextStats.byCategory?.slice(0,3)
      }) : '';

      const res = await api.post('/ai/chat', { 
        message: userMessage,
        context: contextString
      });

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: res.data.text || 'Нет ответа', 
        isAi: true 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: '⚠️ Ошибка связи с защищенным сервером ИИ. Попробуйте позже.', 
        isAi: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Кнопка открытия */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[4900] w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        title="Чат с ИИ-Аналитиком"
      >
        <MessageSquare size={24} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-slate-900"></span>
        </span>
      </button>

      {/* Окно чата */}
      <div className={`fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[5000] w-[360px] sm:w-[400px] bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden flex flex-col transition-all origin-bottom-right duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: '80vh' }}>
        
        {/* Хэдер чата */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
              <Bot size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">AqylQala AI</h3>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest leading-none">Smart Assistant</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.isAi ? '' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isAi ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                {msg.isAi ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.isAi ? 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm' : 'bg-slate-900 text-white rounded-tr-sm'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 bg-white border border-slate-100 text-slate-400 rounded-2xl rounded-tl-sm text-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                Анализирую данные...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Инпут область */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Спросите меня о проблемах города..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primaryHover transition-all disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Send size={18} className={input.trim() && !isLoading ? 'translate-x-0.5' : ''} />
          </button>
        </form>
      </div>
    </>
  );
};

export default AiChat;
