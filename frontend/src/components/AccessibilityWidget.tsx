import { useState, useEffect } from 'react';
import { Eye, Type, Contrast, Ghost, Palette, X, RotateCcw, ImageIcon, AlignLeft } from 'lucide-react';

import { useTranslation } from 'react-i18next';

const AccessibilityWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('acc-font-size') || 'normal');
  const [theme, setTheme] = useState(() => localStorage.getItem('acc-theme') || 'default');
  const [greyscale, setGreyscale] = useState(() => localStorage.getItem('acc-greyscale') === 'true');
  const [hideImages, setHideImages] = useState(() => localStorage.getItem('acc-hide-images') === 'true');
  const [spacedText, setSpacedText] = useState(() => localStorage.getItem('acc-spaced') === 'true');

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    
    // Reset all
    body.classList.remove(
      'acc-theme-yellow', 'acc-theme-white', 
      'acc-greyscale', 'acc-hide-images', 'acc-spaced'
    );
    html.classList.remove('acc-font-large', 'acc-font-xlarge');
    
    // Apply 
    if (theme === 'yellow') body.classList.add('acc-theme-yellow');
    if (theme === 'white') body.classList.add('acc-theme-white');
    if (fontSize === 'large') html.classList.add('acc-font-large');
    if (fontSize === 'xlarge') html.classList.add('acc-font-xlarge');
    if (greyscale) body.classList.add('acc-greyscale');
    if (hideImages) body.classList.add('acc-hide-images');
    if (spacedText) body.classList.add('acc-spaced');

    // Persist
    localStorage.setItem('acc-font-size', fontSize);
    localStorage.setItem('acc-theme', theme);
    localStorage.setItem('acc-greyscale', String(greyscale));
    localStorage.setItem('acc-hide-images', String(hideImages));
    localStorage.setItem('acc-spaced', String(spacedText));
  }, [fontSize, theme, greyscale, hideImages, spacedText]);

  const resetAll = () => {
    setFontSize('normal');
    setTheme('default');
    setGreyscale(false);
    setHideImages(false);
    setSpacedText(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] pointer-events-auto">
      {/* Кнопка открытия — глаз */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-white border-4 border-slate-900 shadow-2xl rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all transform hover:scale-105"
        title={t('map.acc.title')}
      >
        <Eye size={28} />
      </button>

      {/* Выдвижное меню (Профессиональное) */}
      {isOpen && (
        <div className="absolute bottom-20 left-0 w-[340px] bg-white rounded-3xl border-2 border-slate-900 shadow-[0_30px_60px_rgba(0,0,0,0.3)] p-8 space-y-8 animate-fade-in-up">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
             <div className="flex items-center gap-3">
                <Palette size={20} className="text-slate-900" />
                <span className="text-sm font-black uppercase tracking-widest text-slate-900">{t('map.acc.title')}</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900">
                <X size={24} />
             </button>
          </div>

          {/* Цветовая схема */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Contrast size={14} />
                <span>{t('map.acc.theme_label')}</span>
             </div>
             <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'default', label: t('map.acc.theme_default') },
                  { id: 'white', label: t('map.acc.theme_white') },
                  { id: 'yellow', label: t('map.acc.theme_yellow') }
                ].map((tItem) => (
                   <button
                    key={tItem.id}
                    onClick={() => setTheme(tItem.id)}
                    className={`py-3 text-[10px] font-bold rounded-xl border-2 transition-all ${theme === tItem.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
                   >
                     {tItem.label}
                   </button>
                ))}
             </div>
          </div>

          {/* Размер шрифта */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Type size={14} />
                <span>{t('map.acc.font_label')}</span>
             </div>
             <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'normal', label: '100%' },
                  { id: 'large', label: '150%' },
                  { id: 'xlarge', label: '200%' }
                ].map((s) => (
                   <button
                    key={s.id}
                    onClick={() => setFontSize(s.id)}
                    className={`py-3 text-[10px] font-bold rounded-xl border-2 transition-all ${fontSize === s.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
                   >
                     {s.label}
                   </button>
                ))}
             </div>
          </div>

          {/* Дополнительно */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Ghost size={14} />
                <span>{t('map.acc.misc_label')}</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHideImages(!hideImages)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${hideImages ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
                >
                   <ImageIcon size={16} />
                   <span className="text-[10px] font-bold">{t('map.acc.hide_images')}</span>
                </button>
                <button
                  onClick={() => setSpacedText(!spacedText)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${spacedText ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100'}`}
                >
                   <AlignLeft size={16} />
                   <span className="text-[10px] font-bold">{t('map.acc.spaced')}</span>
                </button>
             </div>
          </div>

          <button 
            onClick={resetAll}
            className="w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black text-white bg-danger rounded-2xl hover:brightness-110 shadow-lg transition-all uppercase tracking-widest"
          >
            <RotateCcw size={16} />
            {t('map.acc.reset')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityWidget;
