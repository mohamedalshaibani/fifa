/**
 * Simple i18n translation system
 * 
 * Structure: Each key maps to { ar: string, en: string }
 * Usage: t('key') returns the translation for current language
 */

export type Language = "ar" | "en";

export const translations = {
  // ============ COMMON ============
  "common.loading": {
    ar: "جاري التحميل...",
    en: "Loading...",
  },
  "common.error": {
    ar: "حدث خطأ",
    en: "An error occurred",
  },
  "common.save": {
    ar: "حفظ",
    en: "Save",
  },
  "common.cancel": {
    ar: "إلغاء",
    en: "Cancel",
  },
  "common.delete": {
    ar: "حذف",
    en: "Delete",
  },
  "common.edit": {
    ar: "تعديل",
    en: "Edit",
  },
  "common.close": {
    ar: "إغلاق",
    en: "Close",
  },
  "common.back": {
    ar: "رجوع",
    en: "Back",
  },
  "common.next": {
    ar: "التالي",
    en: "Next",
  },
  "common.submit": {
    ar: "إرسال",
    en: "Submit",
  },
  "common.search": {
    ar: "بحث",
    en: "Search",
  },
  "common.yes": {
    ar: "نعم",
    en: "Yes",
  },
  "common.no": {
    ar: "لا",
    en: "No",
  },

  // ============ HEADER / NAV ============
  "header.platformName": {
    ar: "بطولات فيفا",
    en: "FIFA Tournaments",
  },
  "header.platformSubtitle": {
    ar: "منصة تحديات الأبطال",
    en: "Champions Challenge Platform",
  },
  "header.login": {
    ar: "دخول",
    en: "Login",
  },
  "header.register": {
    ar: "تسجيل",
    en: "Register",
  },
  "header.logout": {
    ar: "تسجيل خروج",
    en: "Logout",
  },
  "header.myAccount": {
    ar: "حسابي",
    en: "My Account",
  },
  "header.adminPanel": {
    ar: "لوحة الأدمن",
    en: "Admin Panel",
  },
  "header.welcome": {
    ar: "مرحباً،",
    en: "Welcome,",
  },

  // ============ HOME PAGE ============
  "home.title": {
    ar: "البطولات المتاحة",
    en: "Available Tournaments",
  },
  "home.noTournaments": {
    ar: "لا توجد بطولات متاحة حالياً",
    en: "No tournaments available",
  },
  "home.viewTournament": {
    ar: "عرض البطولة",
    en: "View Tournament",
  },

  // ============ TOURNAMENTS ============
  "tournament.backToList": {
    ar: "العودة للبطولات",
    en: "Back to Tournaments",
  },
  "tournament.participants": {
    ar: "المشاركون",
    en: "Participants",
  },
  "tournament.matches": {
    ar: "المباريات",
    en: "Matches",
  },
  "tournament.schedule": {
    ar: "جدول المباريات",
    en: "Match Schedule",
  },
  "tournament.standings": {
    ar: "جدول الترتيب",
    en: "Standings",
  },
  "tournament.bracket": {
    ar: "شجرة البطولة",
    en: "Tournament Bracket",
  },
  "tournament.register": {
    ar: "سجل في البطولة",
    en: "Register for Tournament",
  },
  "tournament.registered": {
    ar: "أنت مسجل",
    en: "You are registered",
  },
  "tournament.registrationOpen": {
    ar: "التسجيل مفتوح",
    en: "Registration Open",
  },
  "tournament.registrationClosed": {
    ar: "التسجيل مغلق",
    en: "Registration Closed",
  },
  "tournament.running": {
    ar: "جارية",
    en: "In Progress",
  },
  "tournament.finished": {
    ar: "انتهت",
    en: "Finished",
  },
  "tournament.pending": {
    ar: "قيد الانتظار",
    en: "Pending",
  },
  "tournament.league": {
    ar: "دوري",
    en: "League",
  },
  "tournament.knockout": {
    ar: "خروج المغلوب",
    en: "Knockout",
  },
  "tournament.leagueFormat": {
    ar: "نظام الدوري الكامل",
    en: "Full League Format",
  },
  "tournament.knockoutFormat": {
    ar: "نظام خروج المغلوب",
    en: "Knockout Format",
  },
  "tournament.noMatchesYet": {
    ar: "لم يتم إنشاء مباريات بعد",
    en: "No matches generated yet",
  },
  "tournament.round": {
    ar: "الجولة",
    en: "Round",
  },
  "tournament.match": {
    ar: "مباراة",
    en: "match",
  },
  "tournament.matches_count": {
    ar: "مباراة",
    en: "matches",
  },
  "tournament.completed": {
    ar: "انتهت",
    en: "Completed",
  },
  "tournament.upcoming": {
    ar: "قادمة",
    en: "Upcoming",
  },
  "tournament.vs": {
    ar: "ضد",
    en: "vs",
  },
  "tournament.startsIn": {
    ar: "تبدأ خلال",
    en: "Starts in",
  },
  "tournament.days": {
    ar: "يوم",
    en: "days",
  },
  "tournament.hours": {
    ar: "ساعة",
    en: "hours",
  },

  // ============ REGISTRATION ============
  "registration.title": {
    ar: "سجل في البطولة",
    en: "Register for Tournament",
  },
  "registration.description": {
    ar: "انقر على الزر للتسجيل في البطولة",
    en: "Click the button to register",
  },
  "registration.loginRequired": {
    ar: "يجب تسجيل الدخول للتسجيل في البطولة",
    en: "You must login to register",
  },
  "registration.success": {
    ar: "تم تسجيلك في البطولة بنجاح!",
    en: "You have been registered successfully!",
  },
  "registration.alreadyRegistered": {
    ar: "أنت مسجل في هذه البطولة مسبقاً",
    en: "You are already registered",
  },
  "registration.registerMe": {
    ar: "سجّلني في البطولة",
    en: "Register Me",
  },
  "registration.registering": {
    ar: "جاري التسجيل...",
    en: "Registering...",
  },

  // ============ AUTH ============
  "auth.loginTitle": {
    ar: "تسجيل الدخول",
    en: "Login",
  },
  "auth.registerTitle": {
    ar: "إنشاء حساب جديد",
    en: "Create Account",
  },
  "auth.email": {
    ar: "البريد الإلكتروني",
    en: "Email",
  },
  "auth.password": {
    ar: "كلمة المرور",
    en: "Password",
  },
  "auth.confirmPassword": {
    ar: "تأكيد كلمة المرور",
    en: "Confirm Password",
  },
  "auth.firstName": {
    ar: "الاسم الأول",
    en: "First Name",
  },
  "auth.lastName": {
    ar: "اسم العائلة",
    en: "Last Name",
  },
  "auth.loginButton": {
    ar: "دخول",
    en: "Login",
  },
  "auth.registerButton": {
    ar: "إنشاء حساب",
    en: "Create Account",
  },
  "auth.noAccount": {
    ar: "ليس لديك حساب؟",
    en: "Don't have an account?",
  },
  "auth.hasAccount": {
    ar: "لديك حساب؟",
    en: "Already have an account?",
  },
  "auth.createAccount": {
    ar: "إنشاء حساب جديد",
    en: "Create new account",
  },
  "auth.loginHere": {
    ar: "سجل دخولك",
    en: "Login here",
  },

  // ============ ACCOUNT ============
  "account.title": {
    ar: "حسابي",
    en: "My Account",
  },
  "account.profile": {
    ar: "الملف الشخصي",
    en: "Profile",
  },
  "account.avatar": {
    ar: "الصورة الرمزية",
    en: "Avatar",
  },
  "account.selectAvatar": {
    ar: "اختر صورة رمزية",
    en: "Select Avatar",
  },
  "account.stats": {
    ar: "إحصائياتي",
    en: "My Stats",
  },
  "account.matchesPlayed": {
    ar: "المباريات",
    en: "Matches Played",
  },
  "account.wins": {
    ar: "الفوز",
    en: "Wins",
  },
  "account.draws": {
    ar: "التعادل",
    en: "Draws",
  },
  "account.losses": {
    ar: "الخسارة",
    en: "Losses",
  },
  "account.winRate": {
    ar: "نسبة الفوز",
    en: "Win Rate",
  },
  "account.goalsScored": {
    ar: "الأهداف المسجلة",
    en: "Goals Scored",
  },
  "account.goalsConceded": {
    ar: "الأهداف المستقبلة",
    en: "Goals Conceded",
  },

  // ============ STANDINGS TABLE ============
  "standings.rank": {
    ar: "#",
    en: "#",
  },
  "standings.player": {
    ar: "اللاعب",
    en: "Player",
  },
  "standings.team": {
    ar: "الفريق",
    en: "Team",
  },
  "standings.played": {
    ar: "لعب",
    en: "P",
  },
  "standings.won": {
    ar: "ف",
    en: "W",
  },
  "standings.drawn": {
    ar: "ت",
    en: "D",
  },
  "standings.lost": {
    ar: "خ",
    en: "L",
  },
  "standings.goalsFor": {
    ar: "له",
    en: "GF",
  },
  "standings.goalsAgainst": {
    ar: "عليه",
    en: "GA",
  },
  "standings.goalDiff": {
    ar: "فارق",
    en: "GD",
  },
  "standings.points": {
    ar: "نقاط",
    en: "Pts",
  },

  // ============ ADMIN ============
  "admin.title": {
    ar: "لوحة الإدارة",
    en: "Admin Panel",
  },
  "admin.tournaments": {
    ar: "البطولات",
    en: "Tournaments",
  },
  "admin.users": {
    ar: "المستخدمين",
    en: "Users",
  },
  "admin.avatars": {
    ar: "الصور الرمزية",
    en: "Avatars",
  },
  "admin.createTournament": {
    ar: "إنشاء بطولة جديدة",
    en: "Create Tournament",
  },
  "admin.manageTournament": {
    ar: "إدارة البطولة",
    en: "Manage Tournament",
  },
  "admin.generateMatches": {
    ar: "توليد المباريات",
    en: "Generate Matches",
  },
  "admin.addParticipant": {
    ar: "إضافة مشارك",
    en: "Add Participant",
  },

  // ============ LANGUAGE ============
  "language.toggle": {
    ar: "English",
    en: "العربية",
  },
  "language.arabic": {
    ar: "العربية",
    en: "Arabic",
  },
  "language.english": {
    ar: "الإنجليزية",
    en: "English",
  },
} as const;

export type TranslationKey = keyof typeof translations;

/**
 * Get translation for a key in the specified language
 */
export function getTranslation(key: TranslationKey, lang: Language): string {
  const entry = translations[key];
  if (!entry) {
    console.warn(`Missing translation key: ${key}`);
    return key;
  }
  return entry[lang];
}
