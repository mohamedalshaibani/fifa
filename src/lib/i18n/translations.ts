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
  "home.welcomeUser": {
    ar: "أهلاً",
    en: "Welcome",
  },
  "home.readyForTournaments": {
    ar: "جاهز للبطولات؟ خلّ نرجّع الحماس!",
    en: "Ready for tournaments? Let's bring back the excitement!",
  },
  "home.heroTitle1": {
    ar: "اختبر مهاراتك",
    en: "Test Your Skills",
  },
  "home.heroTitle2": {
    ar: "في أقوى البطولات",
    en: "In The Best Tournaments",
  },
  "home.heroSubtitle": {
    ar: "انضم للبطولات الحية، واجه أفضل اللاعبين، وحقق البطولات",
    en: "Join live tournaments, face top players, and achieve victory",
  },
  "home.browseTournaments": {
    ar: "تصفح البطولات",
    en: "Browse Tournaments",
  },
  "home.myStats": {
    ar: "إحصائياتي",
    en: "My Stats",
  },
  "home.statsSubtitle": {
    ar: "ملخص أدائك في جميع البطولات",
    en: "Summary of your performance in all tournaments",
  },
  "home.matches": {
    ar: "مباريات",
    en: "Matches",
  },
  "home.wins": {
    ar: "فوز",
    en: "Wins",
  },
  "home.draws": {
    ar: "تعادل",
    en: "Draws",
  },
  "home.losses": {
    ar: "خسارة",
    en: "Losses",
  },
  "home.winRate": {
    ar: "نسبة الفوز",
    en: "Win Rate",
  },
  "home.goals": {
    ar: "أهداف",
    en: "Goals",
  },
  "home.tournamentActivity": {
    ar: "نشاطي في البطولات",
    en: "My Tournament Activity",
  },
  "home.activitySubtitle": {
    ar: "ملخص إنجازاتك في البطولات المنتهية",
    en: "Summary of your achievements in finished tournaments",
  },
  "home.tournamentsCount": {
    ar: "بطولات",
    en: "Tournaments",
  },
  "home.firstPlace": {
    ar: "المركز الأول",
    en: "1st Place",
  },
  "home.secondPlace": {
    ar: "المركز الثاني",
    en: "2nd Place",
  },
  "home.thirdPlace": {
    ar: "المركز الثالث",
    en: "3rd Place",
  },
  "home.reachedFinals": {
    ar: "وصول للنهائي",
    en: "Reached Finals",
  },
  "home.crownedPlatform": {
    ar: "منصة التتويج",
    en: "Podium Finish",
  },
  "home.currentTournaments": {
    ar: "البطولات الحالية",
    en: "Current Tournaments",
  },
  "home.currentTournamentsSubtitle": {
    ar: "بطولات جارية أو مفتوحة للتسجيل",
    en: "Active or open for registration",
  },
  "home.previousTournaments": {
    ar: "البطولات السابقة",
    en: "Previous Tournaments",
  },
  "home.previousTournamentsSubtitle": {
    ar: "سجل البطولات المنتهية",
    en: "History of finished tournaments",
  },
  "home.viewDetails": {
    ar: "عرض التفاصيل",
    en: "View Details",
  },
  "home.noActiveTournaments": {
    ar: "لا توجد بطولات نشطة حالياً",
    en: "No active tournaments at the moment",
  },
  "home.noFinishedTournaments": {
    ar: "لا توجد بطولات منتهية",
    en: "No finished tournaments",
  },
  "home.participants": {
    ar: "مشارك",
    en: "participants",
  },
  "home.youAreRegistered": {
    ar: "أنت مسجل",
    en: "You are registered",
  },
  "home.noMatchesYet": {
    ar: "لم تلعب أي مباريات بعد",
    en: "You haven't played any matches yet",
  },
  "home.participateToSeeStats": {
    ar: "شارك في البطولات لتظهر إحصائياتك!",
    en: "Join tournaments to see your stats!",
  },
  "home.comingSoon": {
    ar: "قريباً بطولات جديدة ومثيرة!",
    en: "Exciting new tournaments coming soon!",
  },
  "home.stayTuned": {
    ar: "ترقب البطولات القادمة!",
    en: "Stay tuned for upcoming tournaments!",
  },
  "home.statusRunning": {
    ar: "جارية الآن",
    en: "Live Now",
  },
  "home.statusRegOpen": {
    ar: "التسجيل مفتوح",
    en: "Registration Open",
  },
  "home.statusClosed": {
    ar: "مغلقة",
    en: "Closed",
  },
  "home.statusUpcoming": {
    ar: "قادمة",
    en: "Upcoming",
  },
  "home.statusFinished": {
    ar: "منتهية",
    en: "Finished",
  },
  "home.participantsLabel": {
    ar: "مشاركون",
    en: "Participants",
  },
  "home.typeLabel": {
    ar: "النوع",
    en: "Format",
  },
  "home.registerNow": {
    ar: "سجل الآن",
    en: "Register Now",
  },
  "home.watchNow": {
    ar: "شاهد الآن",
    en: "Watch Now",
  },
  "home.closingSoon": {
    ar: "قرب الإغلاق",
    en: "Closing Soon",
  },
  "home.playerLabel": {
    ar: "لاعب",
    en: "Player",
  },
  "home.matchLabel": {
    ar: "مباراة",
    en: "Match",
  },
  "home.goalLabel": {
    ar: "هدف",
    en: "Goal",
  },
  "home.viewResults": {
    ar: "عرض النتائج",
    en: "View Results",
  },
  "home.browseAllTournaments": {
    ar: "تصفح جميع البطولات",
    en: "Browse All Tournaments",
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
  "account.password": {
    ar: "كلمة المرور",
    en: "Password",
  },
  "account.editProfile": {
    ar: "تعديل الملف الشخصي",
    en: "Edit Profile",
  },
  "account.firstName": {
    ar: "الاسم الأول",
    en: "First Name",
  },
  "account.lastName": {
    ar: "الاسم الأخير",
    en: "Last Name",
  },
  "account.whatsappNumber": {
    ar: "رقم الواتساب",
    en: "WhatsApp Number",
  },
  "account.enterFirstName": {
    ar: "أدخل الاسم الأول",
    en: "Enter first name",
  },
  "account.enterLastName": {
    ar: "أدخل الاسم الأخير",
    en: "Enter last name",
  },
  "account.saveChanges": {
    ar: "حفظ التغييرات",
    en: "Save Changes",
  },
  "account.saving": {
    ar: "جاري الحفظ...",
    en: "Saving...",
  },
  "account.profileSaved": {
    ar: "تم حفظ الملف الشخصي بنجاح",
    en: "Profile saved successfully",
  },
  "account.profileSaveFailed": {
    ar: "فشل في حفظ الملف الشخصي",
    en: "Failed to save profile",
  },
  "account.currentAvatar": {
    ar: "الصورة الحالية",
    en: "Current Avatar",
  },
  "account.chooseNewAvatar": {
    ar: "اختر صورة جديدة",
    en: "Choose New Avatar",
  },
  "account.noAvatarsAvailable": {
    ar: "لا توجد صور رمزية متاحة",
    en: "No avatars available",
  },
  "account.saveAvatar": {
    ar: "حفظ الصورة الرمزية",
    en: "Save Avatar",
  },
  "account.avatarChanged": {
    ar: "تم تغيير الصورة الرمزية بنجاح",
    en: "Avatar changed successfully",
  },
  "account.avatarChangeFailed": {
    ar: "فشل في تغيير الصورة الرمزية",
    en: "Failed to change avatar",
  },
  "account.newAvatarSelected": {
    ar: "تم اختيار صورة جديدة",
    en: "New avatar selected",
  },
  "account.loadingStats": {
    ar: "جاري تحميل الإحصائيات...",
    en: "Loading stats...",
  },
  "account.victories": {
    ar: "الانتصارات",
    en: "Victories",
  },
  "account.drawsLabel": {
    ar: "التعادلات",
    en: "Draws",
  },
  "account.lossesLabel": {
    ar: "الخسائر",
    en: "Losses",
  },
  "account.tournaments": {
    ar: "البطولات",
    en: "Tournaments",
  },
  "account.tournamentHistory": {
    ar: "سجل البطولات",
    en: "Tournament History",
  },
  "account.finished": {
    ar: "منتهية",
    en: "Finished",
  },
  "account.inProgress": {
    ar: "جارية",
    en: "In Progress",
  },
  "account.upcoming": {
    ar: "قادمة",
    en: "Upcoming",
  },
  "account.matchesLabel": {
    ar: "مباريات",
    en: "matches",
  },
  "account.noMatchesYet": {
    ar: "لم تلعب أي مباريات بعد. شارك في البطولات لتظهر إحصائياتك!",
    en: "No matches played yet. Join tournaments to see your stats!",
  },
  "account.changePassword": {
    ar: "تغيير كلمة المرور",
    en: "Change Password",
  },
  "account.currentPassword": {
    ar: "كلمة المرور الحالية",
    en: "Current Password",
  },
  "account.newPassword": {
    ar: "كلمة المرور الجديدة",
    en: "New Password",
  },
  "account.confirmNewPassword": {
    ar: "تأكيد كلمة المرور الجديدة",
    en: "Confirm New Password",
  },
  "account.changing": {
    ar: "جاري التغيير...",
    en: "Changing...",
  },
  "account.passwordChanged": {
    ar: "تم تغيير كلمة المرور بنجاح",
    en: "Password changed successfully",
  },
  "account.passwordChangeFailed": {
    ar: "فشل في تغيير كلمة المرور",
    en: "Failed to change password",
  },
  "account.passwordsMismatch": {
    ar: "كلمات المرور غير متطابقة",
    en: "Passwords do not match",
  },
  "account.passwordTooShort": {
    ar: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    en: "Password must be at least 6 characters",
  },
  "account.back": {
    ar: "العودة",
    en: "Back",
  },
  "account.newUser": {
    ar: "مستخدم جديد",
    en: "New User",
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
