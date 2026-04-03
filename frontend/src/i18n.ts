import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    debug: false,
    interpolation: { escapeValue: false },
    resources: {
      ru: {
        translation: {
          common: { city_name: 'Алматы' },
          nav: {
            overview: 'Обзор',
            analytics: 'Аналитика',
            login: 'Войти',
            join: 'Присоединиться',
            goToMap: 'Перейти к карте',
            logout: 'Выйти'
          },
          hero: {
            title_p1: 'Цифровой мост между',
            title_p2: 'городом и гражданами',
            subtitle: 'AqylQala — единая платформа для оперативного решения городских проблем с использованием ИИ для анализа нужд жителей Алматы.',
            start: 'Начать использование',
            learnMore: 'Узнать больше'
          },
          features: {
            title: 'Экосистема умного города',
            subtitle: 'Три роли в системе, работающие в единой информационной среде для стабильного развития Алматы.',
            citizen: 'Для Граждан',
            official: 'Для Акимата',
            admin: 'Для Админов',
            citizen_desc: 'Легко сообщайте о проблемах через интерактивную карту и отслеживайте статус их решения.',
            official_desc: 'Инструментарий для оперативной обработки запросов и AI-аналитика для принятия управленческих решений.',
            admin_desc: 'Полный контроль над безопасностью данных, управление доступом и мониторинг общей работы платформы.'
          },
          footer: {
            services: 'Сервисы',
            info: 'Инфо',
            contact: 'Связь',
            map_link: 'Интерактивная карта',
            analytics_link: 'Аналитика',
            reports_link: 'Отчетность',
            about_link: 'О проекте',
            security_link: 'Безопасность',
            media_link: 'Для СМИ',
            privacy: 'Приватность',
            terms: 'Условия',
            rights: '2026 DIGITAL ALMATY. ВСЕ ПРАВА ЗАЩИЩЕНЫ.'
          },
          auth: {
            login_tab: 'Вход',
            register_tab: 'Регистрация',
            role_citizen: 'Житель',
            role_official: 'Акимат',
            official_badge: 'Авторизация сотрудников',
            name: 'Полное имя',
            email: 'Email адрес',
            iin: 'ИИН (12 цифр)',
            password: 'Пароль',
            phone: 'Телефон',
            city: 'Ваш район / город',
            submit_login: 'Войти в систему',
            submit_register: 'Зарегистрироваться',
            official_reg_notice: 'Регистрация доступна только администратору'
          },
          map: {
            header_title: 'Городской мониторинг',
            header_subtitle: 'Интерактивная карта Алматы',
            report_problem: 'Создать обращение',
            search_placeholder: 'Поиск по адресу...',
            search_placeholder_context: 'Поиск по ID, адресу или категории...',
            traffic_toggle: 'Трафик Алматы',
            traffic_short: 'Пробки',
            air_quality_short: 'Доступность',
            aqi_legend_title: 'Индекс AQI',
            aqi_good: 'Хорошо',
            aqi_moderate: 'Средне',
            aqi_unhealthy: 'Опасно',
            aqi_danger: 'Критично',
            sensor_details: 'Датчик AQI',
            pm25_label: 'PM2.5 µg/m³',
            legend_title: 'Легенда',
            legend_new: 'Новые проблемы',
            legend_progress: 'В работе',
            legend_resolved: 'Решенные',
            form_category: 'Категория',
            form_desc: 'Описание ситуации',
            form_photo: 'Прикрепить фото',
            form_submit: 'Отправить сообщение',
            form_placeholder: 'Опишите проблему максимально точно...',
            status_labels: {
              NEW: 'НОВОЕ',
              IN_PROGRESS: 'В РАБОТЕ',
              RESOLVED: 'РЕШЕНО'
            },
            acc: {
              title: 'Настройки зрения',
              theme_label: 'Цветовая схема (ГОСТ)',
              theme_default: 'Обычная',
              theme_white: 'Б на Ч',
              theme_yellow: 'Ж на Ч',
              font_label: 'Размер шрифта',
              misc_label: 'Дополнительно',
              hide_images: 'Без фото',
              spaced: 'Интервал',
              reset: 'Сбросить всё'
            }
          },
          dashboard: {
            title: 'Аналитическая панель',
            subtitle: 'Almaty Municipal Insights',
            total_cases: 'Всего заявок',
            in_progress: 'В работе',
            resolved_24h: 'Решено',
            resolved_percent: 'Решено %',
            participants: 'Участники',
            ai_accuracy: 'Точность ИИ',
            sum_total: 'Всего',
            response_time: 'Время отклика',
            ai_title: 'ИИ-Прогноз и рекомендации',
            ai_subtitle: 'GenAI Municipal Engine',
            charts: {
              by_category: 'ПО КАТЕГОРИЯМ',
              by_status: 'СТАТУС ЗАЯВОК',
              category_label: 'Проблемы',
              status_label: 'Выполнение'
            },
            export_pdf: 'Экспорт PDF'
          },
          admin: {
            title: 'Управление доступом',
            subtitle: 'AqylQala User Registry',
            add_user: 'Добавить сотрудника',
            search_placeholder: 'Поиск по имени, email или ИИН...',
            table: {
              profile: 'Профиль',
              status: 'Статус',
              contacts: 'Контакты / ИИН',
              registration: 'Регистрация',
              actions: 'Действия'
            },
            modal: {
              title: 'Новый сотрудник системы',
              name: 'Полное имя',
              iin: 'ИИН',
              dept: 'Департамент',
              email: 'Email (опционально)',
              password: 'Пароль',
              submit: 'Зарегистрировать в базе'
            },
            roles: {
              admin: 'Админ',
              official: 'Акимат',
              citizen: 'Житель'
            }
          }
        }
      },
      kk: {
        translation: {
          common: { city_name: 'Алматы' },
          nav: {
            overview: 'Шолу',
            analytics: 'Аналитика',
            login: 'Кіру',
            join: 'Қосылу',
            goToMap: 'Картаға өту',
            logout: 'Шығу'
          },
          hero: {
            title_p1: 'Қала мен тұрғындар',
            title_p2: 'арасындағы цифрлық көпір',
            subtitle: 'AqylQala — Алматы тұрғындарының қажеттіліктерін талдау үшін жасанды интеллектті қолданатын қалалық мәселелерді жедел шешуге арналған бірыңғай платформа.',
            start: 'Пайдалануды бастау',
            learnMore: 'Толығырақ білу'
          },
          features: {
            title: 'Ақылды қала экожүйесі',
            subtitle: 'Алматының тұрақты дамуы үшін біртұтас ақпараттық ортада жұмыс істейтін үш рөл.',
            citizen: 'Тұрғындар үшін',
            official: 'Әкімдік үшін',
            admin: 'Админдер үшін',
            citizen_desc: 'Интерактивті карта арқылы мәселелерді оңай хабарлаңыз және олардың шешілу күйін қадағалаңыз.',
            official_desc: 'Сұраныстарды жедел өңдеу құралдары және басқарушылық шешімдер қабылдауға арналған AI-аналитика.',
            admin_desc: 'Деректер қауіпсіздігін толық бақылау, қолжетімділікті басқару және платформаның жалпы жұмысын мониторингілеу.'
          },
          footer: {
            services: 'Қызметтер',
            info: 'Ақпарат',
            contact: 'Байланыс',
            map_link: 'Интерактивті карта',
            analytics_link: 'Аналитика',
            reports_link: 'Есептілік',
            about_link: 'Жоба туралы',
            security_link: 'Қауіпсіздік',
            media_link: 'БАҚ үшін',
            privacy: 'Құпиялылық',
            terms: 'Шарттар',
            rights: '2026 DIGITAL ALMATY. БАРЛЫҚ ҚҰҚЫҚТАР ҚОРҒАЛҒАН.'
          },
          auth: {
            login_tab: 'Кіру',
            register_tab: 'Тіркелу',
            role_citizen: 'Тұрғын',
            role_official: 'Әкімдік',
            official_badge: 'Қызметкерлерді авторизациялау',
            name: 'Толық аты-жөні',
            email: 'Email мекенжайы',
            iin: 'ЖСН (12 сан)',
            password: 'Құпия сөз',
            phone: 'Телефон',
            city: 'Сіздің ауданыңыз / қалаңыз',
            submit_login: 'Жүйеге кіру',
            submit_register: 'Тіркелу',
            official_reg_notice: 'Тіркелу тек әкімшіге қолжетімді'
          },
          map: {
            header_title: 'Қалалық мониторинг',
            header_subtitle: 'Алматының интерактивті картасы',
            report_problem: 'Өтініш жасау',
            search_placeholder: 'Мекенжай бойынша іздеу...',
            search_placeholder_context: 'ID, мекенжай немесе санат бойынша іздеу...',
            traffic_toggle: 'Алматы трафигі',
            traffic_short: 'Кептеліс',
            air_quality_short: 'Ауа сапасы',
            aqi_legend_title: 'AQI индексі',
            aqi_good: 'Жақсы',
            aqi_moderate: 'Орташа',
            aqi_unhealthy: 'Қауіпті',
            aqi_danger: 'Критикалық',
            sensor_details: 'AQI датчигі',
            pm25_label: 'PM2.5 µg/m³',
            legend_title: 'Легенда',
            legend_new: 'Жаңа мәселелер',
            legend_progress: 'Өңделуде',
            legend_resolved: 'Шешілді',
            form_category: 'Санат',
            form_desc: 'Жағдайды сипаттау',
            form_photo: 'Фото қосу',
            form_submit: 'Хабарлама жіберу',
            form_placeholder: 'Мәселені мүмкіндігінше дәл сипаттаңыз...',
            status_labels: {
              NEW: 'ЖАҢА',
              IN_PROGRESS: 'ЖҰМЫСТА',
              RESOLVED: 'ШЕШІЛДІ'
            },
            acc: {
              title: 'Көру параметрлері',
              theme_label: 'Түс схемасы (МЕМСТ)',
              theme_default: 'Қалыпты',
              theme_white: 'А қарада',
              theme_yellow: 'С қарада',
              font_label: 'Қаріп өлшемі',
              misc_label: 'Қосымша',
              hide_images: 'Фотосыз',
              spaced: 'Интервал',
              reset: 'Барлығын қайтару'
            }
          },
          dashboard: {
            title: 'Аналитикалық панель',
            subtitle: 'Almaty Municipal Insights',
            total_cases: 'Барлық өтініштер',
            in_progress: 'Жұмыста',
            resolved_24h: 'Шешілді',
            resolved_percent: 'Шешілді %',
            participants: 'Қатысушылар',
            ai_accuracy: 'ЖИ дәлдігі',
            sum_total: 'Барлығы',
            response_time: 'Жауап беру уақыты',
            ai_title: 'ЖИ-Болжау және ұсыныстар',
            ai_subtitle: 'GenAI Municipal Engine',
            charts: {
              by_category: 'САНАТТАР БОЙЫНША',
              by_status: 'ӨТІНІШТЕР КҮЙІ',
              category_label: 'Мәселелер',
              status_label: 'Орындалуы'
            },
            export_pdf: 'PDF экспорттау'
          },
          admin: {
            title: 'Қолжетімділікті басқару',
            subtitle: 'AqylQala User Registry',
            add_user: 'Қызметкерді қосу',
            search_placeholder: 'Аты, email немесе ЖСН бойынша іздеу...',
            table: {
              profile: 'Профиль',
              status: 'Күйі',
              contacts: 'Байланыс / ЖСН',
              registration: 'Тіркелу',
              actions: 'Әрекеттер'
            },
            modal: {
              title: 'Жүйенің жаңа қызметкері',
              name: 'Толық аты-жөні',
              iin: 'ЖСН',
              dept: 'Департамент',
              email: 'Email (міндетті емес)',
              password: 'Құпия сөз',
              submit: 'Базаға тіркеу'
            },
            roles: {
              admin: 'Админ',
              official: 'Әкімдік',
              citizen: 'Тұрғын'
            }
          }
        }
      },
      en: {
        translation: {
          common: { city_name: 'Almaty' },
          nav: {
            overview: 'Overview',
            analytics: 'Analytics',
            login: 'Login',
            join: 'Join',
            goToMap: 'Go to Map',
            logout: 'Logout'
          },
          hero: {
            title_p1: 'Digital bridge between',
            title_p2: 'city and citizens',
            subtitle: 'AqylQala — a unified platform for rapid urban problem resolution using AI for citizen needs analysis in Almaty.',
            start: 'Get Started',
            learnMore: 'Learn More'
          },
          features: {
            title: 'Smart City Ecosystem',
            subtitle: 'Three roles working in a unified information environment for the stable development of Almaty.',
            citizen: 'For Citizens',
            official: 'For Akimat',
            admin: 'For Admins',
            citizen_desc: 'Report problems easily via interactive map and track their resolution status in real-time.',
            official_desc: 'Tools for rapid request processing and AI-analytics for administrative decision making.',
            admin_desc: 'Full control over data security, access management, and overall platform monitoring.'
          },
          footer: {
            services: 'Services',
            info: 'Info',
            contact: 'Contact',
            map_link: 'Interactive Map',
            analytics_link: 'Analytics',
            reports_link: 'Reports',
            about_link: 'About Project',
            security_link: 'Security',
            media_link: 'For Media',
            privacy: 'Privacy Policy',
            terms: 'Terms of Use',
            rights: '2026 DIGITAL ALMATY. ALL RIGHTS RESERVED.'
          },
          auth: {
            login_tab: 'Login',
            register_tab: 'Register',
            role_citizen: 'Citizen',
            role_official: 'Akimat',
            official_badge: 'Officer Authorization',
            name: 'Full Name',
            email: 'Email address',
            iin: 'IIN (12 digits)',
            password: 'Password',
            phone: 'Phone',
            city: 'Your District / City',
            submit_login: 'Login to System',
            submit_register: 'Register',
            official_reg_notice: 'Registration available for admin only'
          },
          map: {
            header_title: 'City Monitoring',
            header_subtitle: 'Almaty Interactive Map',
            report_problem: 'Report Issue',
            search_placeholder: 'Search by address...',
            search_placeholder_context: 'Search by ID, Address or Category...',
            traffic_toggle: 'Almaty Traffic',
            traffic_short: 'Traffic',
            air_quality_short: 'Air Quality',
            aqi_legend_title: 'AQI Index',
            aqi_good: 'Good',
            aqi_moderate: 'Moderate',
            aqi_unhealthy: 'Unhealthy',
            aqi_danger: 'Dangerous',
            sensor_details: 'AQI Sensor',
            pm25_label: 'PM2.5 µg/m³',
            legend_title: 'Legend',
            legend_new: 'New Issues',
            legend_progress: 'In Progress',
            legend_resolved: 'Resolved',
            form_category: 'Category',
            form_desc: 'Description',
            form_photo: 'Attach Photo',
            form_submit: 'Submit Report',
            form_placeholder: 'Describe the problem exactly...',
            status_labels: {
              NEW: 'NEW',
              IN_PROGRESS: 'IN PROGRESS',
              RESOLVED: 'RESOLVED'
            },
            acc: {
              title: 'Vision Settings',
              theme_label: 'Color Scheme (Gov Spec)',
              theme_default: 'Default',
              theme_white: 'W on B',
              theme_yellow: 'Y on B',
              font_label: 'Font Size',
              misc_label: 'Miscellaneous',
              hide_images: 'No Images',
              spaced: 'Letter Spacing',
              reset: 'Reset All'
            }
          },
          dashboard: {
            title: 'Analytics Dashboard',
            subtitle: 'Almaty Municipal Insights',
            total_cases: 'Total Requests',
            in_progress: 'In Progress',
            resolved_24h: 'Resolved',
            resolved_percent: 'Resolved %',
            participants: 'Participants',
            ai_accuracy: 'AI Accuracy',
            sum_total: 'Total',
            response_time: 'Response Time',
            ai_title: 'AI Forecast & Tips',
            ai_subtitle: 'GenAI Municipal Engine',
            charts: {
              by_category: 'BY CATEGORY',
              by_status: 'ISSUE STATUS',
              category_label: 'Issues',
              status_label: 'Completion'
            },
            export_pdf: 'Export PDF'
          },
          admin: {
            title: 'Access Management',
            subtitle: 'AqylQala User Registry',
            add_user: 'Add Employee',
            search_placeholder: 'Search by name, email or IIN...',
            table: {
              profile: 'Profile',
              status: 'Status',
              contacts: 'Contact / IIN',
              registration: 'Registration',
              actions: 'Actions'
            },
            modal: {
              title: 'New System Employee',
              name: 'Full Name',
              iin: 'IIN',
              dept: 'Department',
              email: 'Email (optional)',
              password: 'Password',
              submit: 'Register in Database'
            },
            roles: {
              admin: 'Admin',
              official: 'Akimat',
              citizen: 'Citizen'
            }
          }
        }
      }
    }
  });

export default i18n;
