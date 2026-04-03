import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const languages = [
  { code: 'ru', name: 'РУС', label: 'Русский' },
  { code: 'kk', name: 'ҚАЗ', label: 'Қазақша' },
  { code: 'en', name: 'ENG', label: 'English' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = languages.find(l => i18n.language?.startsWith(l.code)) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
      >
        <Globe size={16} className="text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{currentLang.name}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-fade-in-up">
          <div className="p-2 space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left transition-all ${
                  i18n.language === lang.code 
                    ? 'bg-primary/5 text-primary' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider">{lang.label}</span>
                {i18n.language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
