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
  "tournaments.allTournaments": {
    ar: "كل البطولات",
    en: "All Tournaments",
  },
  "tournaments.discoverLive": {
    ar: "اكتشف البطولات الحية",
    en: "Discover Live Tournaments",
  },
  "tournaments.chooseAndCompete": {
    ar: "اختر بطولتك المفضلة وابدأ المنافسة الآن",
    en: "Choose your favorite tournament and start competing now",
  },
  "tournaments.format": {
    ar: "التنسيق",
    en: "Format",
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
  "auth.loggingIn": {
    ar: "جاري الدخول...",
    en: "Logging in...",
  },
  "auth.loginFailed": {
    ar: "تعذر تسجيل الدخول. حاول مرة أخرى.",
    en: "Login failed. Please try again.",
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
  "auth.createPlayerAccount": {
    ar: "إنشاء حساب لاعب",
    en: "Create Player Account",
  },
  "auth.joinTournaments": {
    ar: "انضم إلى البطولات وابنِ ملفك التنافسي",
    en: "Join tournaments and build your competitive profile",
  },
  "auth.personalInfo": {
    ar: "المعلومات الشخصية",
    en: "Personal Information",
  },
  "auth.enterFirstName": {
    ar: "أدخل اسمك الأول",
    en: "Enter your first name",
  },
  "auth.enterLastName": {
    ar: "أدخل اسم العائلة",
    en: "Enter your last name",
  },
  "auth.whatsappNumber": {
    ar: "رقم الواتساب",
    en: "WhatsApp Number",
  },
  "auth.minPassword": {
    ar: "8 أحرف على الأقل",
    en: "At least 8 characters",
  },
  "auth.reenterPassword": {
    ar: "أعد إدخال كلمة المرور",
    en: "Re-enter password",
  },
  "auth.chooseAvatar": {
    ar: "اختر صورتك الرمزية",
    en: "Choose Your Avatar",
  },
  "auth.creatingAccount": {
    ar: "جارٍ إنشاء الحساب...",
    en: "Creating account...",
  },
  "auth.createAndRegister": {
    ar: "إنشاء الحساب والتسجيل",
    en: "Create Account & Register",
  },
  "auth.alreadyHaveAccount": {
    ar: "لديك حساب بالفعل؟",
    en: "Already have an account?",
  },
  "auth.loginFromHere": {
    ar: "سجل الدخول من هنا",
    en: "Login here",
  },
  "auth.loadingAvatars": {
    ar: "جارٍ تحميل الصور الرمزية...",
    en: "Loading avatars...",
  },
  "auth.firstNameRequired": {
    ar: "الاسم الأول مطلوب",
    en: "First name is required",
  },
  "auth.lastNameRequired": {
    ar: "اسم العائلة مطلوب",
    en: "Last name is required",
  },
  "auth.whatsappRequired": {
    ar: "رقم الواتساب مطلوب",
    en: "WhatsApp number is required",
  },
  "auth.invalidEmail": {
    ar: "البريد الإلكتروني غير صحيح",
    en: "Invalid email address",
  },
  "auth.passwordMinLength": {
    ar: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    en: "Password must be at least 8 characters",
  },
  "auth.passwordsNotMatch": {
    ar: "كلمتا المرور غير متطابقتين",
    en: "Passwords do not match",
  },
  "auth.selectAvatar": {
    ar: "يرجى اختيار صورة رمزية",
    en: "Please select an avatar",
  },
  "auth.registrationFailed": {
    ar: "فشل التسجيل. يرجى المحاولة مرة أخرى.",
    en: "Registration failed. Please try again.",
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

  // ============ TOURNAMENT DETAIL ============
  "tournamentDetail.backToTournaments": {
    ar: "العودة للبطولات",
    en: "Back to Tournaments",
  },
  "tournamentDetail.teams": {
    ar: "فرق",
    en: "Teams",
  },
  "tournamentDetail.individual": {
    ar: "فردي",
    en: "Individual",
  },
  "tournamentDetail.leagueCompleted": {
    ar: "بطولة دوري مكتملة",
    en: "Completed League Tournament",
  },
  "tournamentDetail.knockoutCompleted": {
    ar: "بطولة خروج المغلوب مكتملة",
    en: "Completed Knockout Tournament",
  },
  "tournamentDetail.tournamentFinished": {
    ar: "بطولة منتهية",
    en: "Tournament Finished",
  },
  "tournamentDetail.champion": {
    ar: "بطل البطولة",
    en: "Champion",
  },
  "tournamentDetail.runnerUp": {
    ar: "الوصيف",
    en: "Runner Up",
  },
  "tournamentDetail.matchesLabel": {
    ar: "المباريات",
    en: "Matches",
  },
  "tournamentDetail.goalsLabel": {
    ar: "الأهداف",
    en: "Goals",
  },
  "tournamentDetail.participantsLabel": {
    ar: "المشاركون",
    en: "Participants",
  },
  "tournamentDetail.teamsLabel": {
    ar: "الفرق",
    en: "Teams",
  },
  "tournamentDetail.formatLabel": {
    ar: "النظام",
    en: "Format",
  },
  "tournamentDetail.results": {
    ar: "النتائج",
    en: "Results",
  },
  "tournamentDetail.finalStandings": {
    ar: "الترتيب النهائي",
    en: "Final Standings",
  },
  "tournamentDetail.bracketSummary": {
    ar: "ملخص الشجرة",
    en: "Bracket Summary",
  },
  "tournamentDetail.noParticipants": {
    ar: "لا يوجد مشاركون.",
    en: "No participants.",
  },
  "tournamentDetail.noTeams": {
    ar: "لا توجد فرق.",
    en: "No teams.",
  },
  "tournamentDetail.noParticipantsYet": {
    ar: "لا يوجد مشاركون بعد.",
    en: "No participants yet.",
  },
  "tournamentDetail.noTeamsYet": {
    ar: "لا توجد فرق بعد.",
    en: "No teams yet.",
  },
  "tournamentDetail.resultsSchedule": {
    ar: "النتائج / الجدول",
    en: "Results / Schedule",
  },
  "tournamentDetail.noMatchesCreated": {
    ar: "لم يتم إنشاء مباريات.",
    en: "No matches created.",
  },
  "tournamentDetail.noDrawYet": {
    ar: "لم تتم القرعة بعد.",
    en: "Draw not done yet.",
  },
  "tournamentDetail.noStandingsData": {
    ar: "لا توجد بيانات ترتيب.",
    en: "No standings data.",
  },
  "tournamentDetail.noStandingsDataYet": {
    ar: "لا توجد بيانات ترتيب بعد.",
    en: "No standings data yet.",
  },
  "tournamentDetail.noMatchesYet": {
    ar: "لا توجد مباريات.",
    en: "No matches.",
  },
  "tournamentDetail.matchFinished": {
    ar: "انتهت",
    en: "Finished",
  },
  "tournamentDetail.matchPending": {
    ar: "قيد الانتظار",
    en: "Pending",
  },
  "tournamentDetail.matchUpcoming": {
    ar: "قادمة",
    en: "Upcoming",
  },
  "tournamentDetail.advanced": {
    ar: "انتقل",
    en: "Advanced",
  },
  "tournamentDetail.final": {
    ar: "النهائي",
    en: "Final",
  },
  "tournamentDetail.leagueTypeLabel": {
    ar: "دوري",
    en: "League",
  },
  "tournamentDetail.knockoutTypeLabel": {
    ar: "خروج المغلوب",
    en: "Knockout",
  },
  "tournamentDetail.notDefined": {
    ar: "غير محدد",
    en: "Not Defined",
  },
  "tournamentDetail.formatNotSet": {
    ar: "لم يتم تحديد النظام بعد",
    en: "Format not set yet",
  },
  "tournamentDetail.matchSchedule": {
    ar: "جدول المباريات",
    en: "Match Schedule",
  },
  "tournamentDetail.standings": {
    ar: "جدول الترتيب",
    en: "Standings",
  },
  "tournamentDetail.bracket": {
    ar: "شجرة البطولة",
    en: "Tournament Bracket",
  },
  "tournamentDetail.sections": {
    ar: "الأقسام",
    en: "Sections",
  },
  "tournamentDetail.viewPlayersList": {
    ar: "عرض قائمة اللاعبين",
    en: "View players list",
  },
  "tournamentDetail.viewTeamsList": {
    ar: "عرض قائمة الفرق",
    en: "View teams list",
  },
  "tournamentDetail.browseMatchesResults": {
    ar: "تصفح المباريات القادمة والنتائج",
    en: "Browse upcoming matches and results",
  },
  "tournamentDetail.trackPointsRankings": {
    ar: "متابعة النقاط والمراكز",
    en: "Track points and rankings",
  },
  "tournamentDetail.pathToFinal": {
    ar: "مسار التأهل للنهائي",
    en: "Path to the final",
  },
  "tournamentDetail.team": {
    ar: "الفريق",
    en: "Team",
  },
  "tournamentDetail.player": {
    ar: "اللاعب",
    en: "Player",
  },
  "tournamentDetail.played": {
    ar: "لعب",
    en: "P",
  },
  "tournamentDetail.won": {
    ar: "فوز",
    en: "W",
  },
  "tournamentDetail.draw": {
    ar: "تعادل",
    en: "D",
  },
  "tournamentDetail.lost": {
    ar: "خسارة",
    en: "L",
  },
  "tournamentDetail.goalsFor": {
    ar: "الأهداف",
    en: "Goals",
  },
  "tournamentDetail.goalDiff": {
    ar: "الفرق",
    en: "GD",
  },
  "tournamentDetail.points": {
    ar: "النقاط",
    en: "Pts",
  },
  "tournamentDetail.completedStat": {
    ar: "المكتملة",
    en: "Completed",
  },
  "tournamentDetail.matchesNotStarted": {
    ar: "لم تبدأ المباريات",
    en: "Matches not started",
  },
  "tournamentDetail.averageStat": {
    ar: "المتوسط",
    en: "Average",
  },
  "tournamentDetail.goalsPerMatch": {
    ar: "هدف/مباراة",
    en: "goals/match",
  },
  "tournamentDetail.registerTitle": {
    ar: "سجل في البطولة",
    en: "Register for Tournament",
  },
  "tournamentDetail.clickToRegister": {
    ar: "انقر على الزر للتسجيل في البطولة",
    en: "Click to register for the tournament",
  },
  "tournamentDetail.loginToRegister": {
    ar: "يجب تسجيل الدخول للتسجيل في البطولة",
    en: "You must login to register",
  },
  "tournamentDetail.registeredSuccess": {
    ar: "تم تسجيلك في البطولة بنجاح!",
    en: "You have been registered successfully!",
  },
  "tournamentDetail.alreadyRegistered": {
    ar: "أنت مسجل في هذه البطولة مسبقاً",
    en: "You are already registered",
  },
  "tournamentDetail.youAreRegistered": {
    ar: "أنت مسجل",
    en: "You are registered",
  },
  "tournamentDetail.errorAuth": {
    ar: "يجب تسجيل الدخول للتسجيل في البطولة",
    en: "You must login to register",
  },
  "tournamentDetail.errorClosed": {
    ar: "التسجيل مغلق حالياً",
    en: "Registration is closed",
  },
  "tournamentDetail.errorNotFound": {
    ar: "تعذر العثور على البطولة",
    en: "Tournament not found",
  },
  "tournamentDetail.errorServer": {
    ar: "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.",
    en: "An error occurred. Please try again.",
  },
  "tournamentDetail.login": {
    ar: "دخول",
    en: "Login",
  },
  "tournamentDetail.signUp": {
    ar: "تسجيل",
    en: "Sign Up",
  },
  "tournamentDetail.teamCount": {
    ar: "فريق",
    en: "team",
  },
  "tournamentDetail.participantCount": {
    ar: "مشارك",
    en: "participant",
  },

  // ============ SCHEDULE PAGE ============
  "schedule.title": {
    ar: "جدول المباريات",
    en: "Match Schedule",
  },
  "schedule.noMatchesYet": {
    ar: "لم يتم إنشاء مباريات بعد.",
    en: "No matches created yet.",
  },
  "schedule.round": {
    ar: "الجولة",
    en: "Round",
  },
  "schedule.match": {
    ar: "مباراة",
    en: "match",
  },
  "schedule.participants": {
    ar: "المشاركون",
    en: "Participants",
  },
  "schedule.standings": {
    ar: "الترتيب",
    en: "Standings",
  },
  "schedule.bracket": {
    ar: "الشجرة",
    en: "Bracket",
  },

  // ============ STANDINGS PAGE ============
  "standingsPage.title": {
    ar: "ترتيب",
    en: "Standings",
  },
  "standingsPage.teamsStandings": {
    ar: "ترتيب الفرق",
    en: "Teams Standings",
  },
  "standingsPage.playersStandings": {
    ar: "ترتيب اللاعبين",
    en: "Players Standings",
  },
  "standingsPage.backToTournament": {
    ar: "العودة للبطولة",
    en: "Back to Tournament",
  },
  "standingsPage.noDataYet": {
    ar: "لا توجد بيانات ترتيب بعد.",
    en: "No standings data yet.",
  },
  "standingsPage.leagueTable": {
    ar: "جدول الدوري",
    en: "League Table",
  },
  "standingsPage.team": {
    ar: "الفريق",
    en: "Team",
  },
  "standingsPage.player": {
    ar: "اللاعب",
    en: "Player",
  },

  // ============ BRACKET PAGE ============
  "bracketPage.title": {
    ar: "شجرة المنافسة",
    en: "Competition Bracket",
  },
  "bracketPage.backToTournament": {
    ar: "العودة للبطولة",
    en: "Back to Tournament",
  },
  "bracketPage.noDrawYet": {
    ar: "لم تتم القرعة بعد.",
    en: "Draw not done yet.",
  },
  "bracketPage.final": {
    ar: "النهائي",
    en: "Final",
  },
  "bracketPage.finalMatch": {
    ar: "المباراة النهائية",
    en: "Final Match",
  },
  "bracketPage.completed": {
    ar: "انتهت",
    en: "Completed",
  },
  "bracketPage.winner": {
    ar: "الفائز",
    en: "Winner",
  },

  // ============ PARTICIPANTS PAGE ============
  "participantsPage.title": {
    ar: "المشاركون",
    en: "Participants",
  },
  "participantsPage.list": {
    ar: "قائمة المشاركين",
    en: "Participants List",
  },
  "participantsPage.count": {
    ar: "مشارك",
    en: "participant",
  },
  "participantsPage.noParticipantsYet": {
    ar: "لا يوجد مشاركون بعد.",
    en: "No participants yet.",
  },
  "participantsPage.standings": {
    ar: "الترتيب",
    en: "Standings",
  },
  "participantsPage.bracket": {
    ar: "الشجرة",
    en: "Bracket",
  },
  "participantsPage.schedule": {
    ar: "الجدول",
    en: "Schedule",
  },

  // ============ CHAMPION PAGE ============
  "championPage.title": {
    ar: "بطل البطولة",
    en: "Tournament Champion",
  },
  "championPage.champion": {
    ar: "البطل",
    en: "Champion",
  },
  "championPage.congratulations": {
    ar: "تهانينا للبطل! إنجاز رائع في هذه البطولة المثيرة.",
    en: "Congratulations to the champion! An amazing achievement in this exciting tournament.",
  },
  "championPage.backToTournament": {
    ar: "العودة إلى البطولة",
    en: "Back to Tournament",
  },
  "championPage.notDetermined": {
    ar: "غير محدد",
    en: "Not determined",
  },
  "championPage.league": {
    ar: "دوري",
    en: "League",
  },
  "championPage.knockout": {
    ar: "خروج المغلوب",
    en: "Knockout",
  },
  "championPage.teams": {
    ar: "فرق",
    en: "Teams",
  },
  "championPage.individual": {
    ar: "فردي",
    en: "Individual",
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

  // ============ ADMIN COMMON ============
  "admin.dashboard": {
    ar: "لوحة التحكم",
    en: "Control Panel",
  },
  "admin.manageTournamentsAndUsers": {
    ar: "إدارة البطولات والمستخدمين والنظام",
    en: "Manage tournaments, users, and system",
  },
  "admin.backToPanel": {
    ar: "العودة للوحة التحكم",
    en: "Back to Control Panel",
  },
  "admin.backToTournaments": {
    ar: "العودة للبطولات",
    en: "Back to Tournaments",
  },
  "admin.manage": {
    ar: "إدارة",
    en: "Manage",
  },

  // ============ ADMIN SECTIONS ============
  "admin.sections.tournaments": {
    ar: "البطولات",
    en: "Tournaments",
  },
  "admin.sections.tournamentsDesc": {
    ar: "إنشاء وإدارة البطولات",
    en: "Create and manage tournaments",
  },
  "admin.sections.users": {
    ar: "المستخدمون",
    en: "Users",
  },
  "admin.sections.usersDesc": {
    ar: "إدارة الحسابات والصلاحيات",
    en: "Manage accounts and permissions",
  },
  "admin.sections.avatars": {
    ar: "الأفتارات",
    en: "Avatars",
  },
  "admin.sections.avatarsDesc": {
    ar: "رفع وتعديل الصور",
    en: "Upload and edit images",
  },

  // ============ ADMIN TOURNAMENTS ============
  "admin.tournaments.title": {
    ar: "إدارة البطولات",
    en: "Tournament Management",
  },
  "admin.tournaments.subtitle": {
    ar: "إنشاء وتحرير وحذف البطولات",
    en: "Create, edit, and delete tournaments",
  },
  "admin.tournaments.total": {
    ar: "إجمالي",
    en: "Total",
  },
  "admin.tournaments.running": {
    ar: "جارية",
    en: "Running",
  },
  "admin.tournaments.completed": {
    ar: "مكتملة",
    en: "Completed",
  },
  "admin.tournaments.pending": {
    ar: "انتظار",
    en: "Pending",
  },
  "admin.tournaments.newTournament": {
    ar: "بطولة جديدة",
    en: "New Tournament",
  },
  "admin.tournaments.noTournamentsYet": {
    ar: "📭 لا توجد بطولات بعد",
    en: "📭 No tournaments yet",
  },
  "admin.tournaments.tournamentsList": {
    ar: "البطولات",
    en: "Tournaments",
  },
  "admin.tournaments.delete": {
    ar: "حذف",
    en: "Delete",
  },
  "admin.tournaments.deleteConfirm": {
    ar: "⚠️ حذف نهائي!",
    en: "⚠️ Delete permanently!",
  },
  "admin.tournaments.statusRunning": {
    ar: "🔴 جارية",
    en: "🔴 Running",
  },
  "admin.tournaments.statusRegistration": {
    ar: "🟡 تسجيل",
    en: "🟡 Registration",
  },
  "admin.tournaments.statusFinished": {
    ar: "⚪ انتهت",
    en: "⚪ Finished",
  },
  "admin.tournaments.statusUpcoming": {
    ar: "🟤 قادمة",
    en: "🟤 Upcoming",
  },
  "admin.tournaments.typeLeague": {
    ar: "🏆 دوري",
    en: "🏆 League",
  },
  "admin.tournaments.typeKnockout": {
    ar: "⚡ خروج مباشر",
    en: "⚡ Knockout",
  },

  // ============ CREATE TOURNAMENT FORM ============
  "admin.createForm.tournamentName": {
    ar: "اسم البطولة",
    en: "Tournament Name",
  },
  "admin.createForm.namePlaceholder": {
    ar: "مثال: كأس المجلس",
    en: "Example: Council Cup",
  },
  "admin.createForm.startDate": {
    ar: "تاريخ البدء",
    en: "Start Date",
  },
  "admin.createForm.tournamentSystem": {
    ar: "نظام البطولة",
    en: "Tournament System",
  },
  "admin.createForm.league": {
    ar: "دوري",
    en: "League",
  },
  "admin.createForm.knockout": {
    ar: "خروج مباشر",
    en: "Knockout",
  },
  "admin.createForm.participationType": {
    ar: "نوع المشاركة",
    en: "Participation Type",
  },
  "admin.createForm.individual": {
    ar: "فردي",
    en: "Individual",
  },
  "admin.createForm.teams": {
    ar: "فرق",
    en: "Teams",
  },
  "admin.createForm.teamFormation": {
    ar: "طريقة تشكيل الفرق",
    en: "Team Formation Method",
  },
  "admin.createForm.preformed": {
    ar: "فرق جاهزة",
    en: "Preformed Teams",
  },
  "admin.createForm.randomDraw": {
    ar: "قرعة عشوائية",
    en: "Random Draw",
  },
  "admin.createForm.create": {
    ar: "إنشاء البطولة",
    en: "Create Tournament",
  },

  // ============ ADMIN TOURNAMENT DASHBOARD ============
  "admin.tournamentDash.participant": {
    ar: "مشارك",
    en: "Participant",
  },
  "admin.tournamentDash.participants": {
    ar: "المشاركون",
    en: "Participants",
  },
  "admin.tournamentDash.match": {
    ar: "مباراة",
    en: "Match",
  },
  "admin.tournamentDash.matches": {
    ar: "المباريات",
    en: "Matches",
  },
  "admin.tournamentDash.completedMatch": {
    ar: "مباراة منتهية",
    en: "Completed Match",
  },
  "admin.tournamentDash.upcomingMatch": {
    ar: "مباراة قادمة",
    en: "Upcoming Match",
  },
  "admin.tournamentDash.quickActions": {
    ar: "إجراءات سريعة",
    en: "Quick Actions",
  },
  "admin.tournamentDash.closeRegistration": {
    ar: "إغلاق التسجيل",
    en: "Close Registration",
  },
  "admin.tournamentDash.reopenRegistration": {
    ar: "إعادة فتح التسجيل",
    en: "Reopen Registration",
  },
  "admin.tournamentDash.startTournament": {
    ar: "بدء البطولة",
    en: "Start Tournament",
  },
  "admin.tournamentDash.drawTeams": {
    ar: "سحب الفرق",
    en: "Draw Teams",
  },
  "admin.tournamentDash.redrawTeams": {
    ar: "إعادة القرعة",
    en: "Redraw",
  },
  "admin.tournamentDash.generateMatches": {
    ar: "إنشاء المباريات",
    en: "Generate Matches",
  },
  "admin.tournamentDash.needsTeamDraw": {
    ar: "⚠️ يجب سحب الفرق أولاً",
    en: "⚠️ Teams must be drawn first",
  },
  "admin.tournamentDash.needsTournamentType": {
    ar: "⚠️ يجب تحديد نوع البطولة أولاً",
    en: "⚠️ Tournament type must be set first",
  },
  "admin.tournamentDash.addParticipants": {
    ar: "إضافة مشاركين",
    en: "Add Participants",
  },
  "admin.tournamentDash.addSingle": {
    ar: "إضافة مشارك واحد",
    en: "Add Single Participant",
  },
  "admin.tournamentDash.participantName": {
    ar: "اسم المشارك",
    en: "Participant Name",
  },
  "admin.tournamentDash.add": {
    ar: "إضافة",
    en: "Add",
  },
  "admin.tournamentDash.addBulk": {
    ar: "إضافة عدة مشاركين (اسم في كل سطر)",
    en: "Add Multiple Participants (one name per line)",
  },
  "admin.tournamentDash.addAll": {
    ar: "إضافة الكل",
    en: "Add All",
  },
  "admin.tournamentDash.noParticipantsYet": {
    ar: "لا يوجد مشاركون بعد",
    en: "No participants yet",
  },
  "admin.tournamentDash.teams": {
    ar: "الفرق",
    en: "Teams",
  },
  "admin.tournamentDash.randomDrawBadge": {
    ar: "قرعة عشوائية",
    en: "Random Draw",
  },
  "admin.tournamentDash.teamsNotDrawn": {
    ar: "لم يتم سحب الفرق بعد",
    en: "Teams not drawn yet",
  },
  "admin.tournamentDash.useDrawButton": {
    ar: "استخدم زر \"سحب الفرق\" أعلاه لإجراء القرعة",
    en: "Use the \"Draw Teams\" button above to perform the draw",
  },
  "admin.tournamentDash.needMinPlayers": {
    ar: "⚠️ يجب وجود 4 مشاركين على الأقل لسحب الفرق",
    en: "⚠️ At least 4 participants are needed to draw teams",
  },
  "admin.tournamentDash.unnamed": {
    ar: "بدون اسم",
    en: "Unnamed",
  },
  "admin.tournamentDash.moreMatches": {
    ar: "مباراة أخرى",
    en: "more matches",
  },
  "admin.tournamentDash.deleteParticipant": {
    ar: "حذف المشارك؟",
    en: "Delete participant?",
  },
  "admin.tournamentDash.tournamentFormat": {
    ar: "👥 صيغة البطولة (فردي / فرق)",
    en: "👥 Tournament Format (Individual / Teams)",
  },
  "admin.tournamentDash.currentFormat": {
    ar: "الصيغة الحالية:",
    en: "Current Format:",
  },
  "admin.tournamentDash.teamsRandomDraw": {
    ar: "فرق (قرعة عشوائية) 2v2",
    en: "Teams (Random Draw) 2v2",
  },
  "admin.tournamentDash.teamsPreformed": {
    ar: "فرق (جاهزة) 2v2",
    en: "Teams (Preformed) 2v2",
  },
  "admin.tournamentDash.individual1v1": {
    ar: "فردي 1v1",
    en: "Individual 1v1",
  },
  "admin.tournamentDash.formatIndividual": {
    ar: "🧍 فردي (1v1)",
    en: "🧍 Individual (1v1)",
  },
  "admin.tournamentDash.formatTeamsRandom": {
    ar: "🎲 فرق بالقرعة (2v2)",
    en: "🎲 Teams by Draw (2v2)",
  },
  "admin.tournamentDash.formatTeamsPreformed": {
    ar: "👥 فرق جاهزة (2v2)",
    en: "👥 Preformed Teams (2v2)",
  },
  "admin.tournamentDash.teamsDrawn": {
    ar: "✅ تم سحب",
    en: "✅ Drew",
  },
  "admin.tournamentDash.teamsCount": {
    ar: "فرق",
    en: "teams",
  },
  "admin.tournamentDash.teamsNotDrawnWarning": {
    ar: "⚠️ لم يتم سحب الفرق بعد - اضغط على \"سحب الفرق\" في الأسفل",
    en: "⚠️ Teams not drawn yet - click \"Draw Teams\" below",
  },
  "admin.tournamentDash.selectType": {
    ar: "⚙️ اختيار نوع البطولة",
    en: "⚙️ Select Tournament Type",
  },
  "admin.tournamentDash.selectTypeDesc": {
    ar: "يجب اختيار نوع البطولة قبل إنشاء المباريات",
    en: "You must select the tournament type before creating matches",
  },
  "admin.tournamentDash.leagueFull": {
    ar: "🏆 دوري (كل فريق يلعب مع الآخرين)",
    en: "🏆 League (every team plays against others)",
  },
  "admin.tournamentDash.knockoutFull": {
    ar: "⚡ خروج مباشر (إقصائي)",
    en: "⚡ Knockout (elimination)",
  },
  "admin.tournamentDash.tournamentType": {
    ar: "نوع البطولة:",
    en: "Tournament Type:",
  },
  "admin.tournamentDash.changeToKnockout": {
    ar: "تغيير إلى خروج مباشر",
    en: "Change to Knockout",
  },
  "admin.tournamentDash.changeToLeague": {
    ar: "تغيير إلى دوري",
    en: "Change to League",
  },

  // ============ TOURNAMENT STATUS ============
  "admin.status.pending": {
    ar: "قيد الانتظار",
    en: "Pending",
  },
  "admin.status.registrationOpen": {
    ar: "التسجيل مفتوح",
    en: "Registration Open",
  },
  "admin.status.registrationClosed": {
    ar: "التسجيل مغلق",
    en: "Registration Closed",
  },
  "admin.status.running": {
    ar: "جارية",
    en: "Running",
  },
  "admin.status.finished": {
    ar: "انتهت",
    en: "Finished",
  },

  // ============ ADMIN USERS ============
  "admin.users.title": {
    ar: "إدارة المستخدمين",
    en: "User Management",
  },
  "admin.users.subtitle": {
    ar: "إدارة الحسابات والصلاحيات",
    en: "Manage accounts and permissions",
  },
  "admin.users.totalUsers": {
    ar: "إجمالي المستخدمين",
    en: "Total Users",
  },
  "admin.users.activeUsers": {
    ar: "مستخدم نشط",
    en: "Active Users",
  },
  "admin.users.admins": {
    ar: "مشرف",
    en: "Admin",
  },
  "admin.users.suspended": {
    ar: "معلق",
    en: "Suspended",
  },
  "admin.users.searchPlaceholder": {
    ar: "بحث بالاسم أو البريد الإلكتروني...",
    en: "Search by name or email...",
  },
  "admin.users.allRoles": {
    ar: "جميع الأدوار",
    en: "All Roles",
  },
  "admin.users.adminsOnly": {
    ar: "المشرفين",
    en: "Admins",
  },
  "admin.users.usersOnly": {
    ar: "المستخدمين",
    en: "Users",
  },
  "admin.users.allStatuses": {
    ar: "جميع الحالات",
    en: "All Statuses",
  },
  "admin.users.activeOnly": {
    ar: "نشط",
    en: "Active",
  },
  "admin.users.suspendedOnly": {
    ar: "معلق",
    en: "Suspended",
  },
  "admin.users.clearFilters": {
    ar: "مسح الفلاتر",
    en: "Clear Filters",
  },
  "admin.users.showing": {
    ar: "عرض",
    en: "Showing",
  },
  "admin.users.of": {
    ar: "من",
    en: "of",
  },
  "admin.users.user": {
    ar: "مستخدم",
    en: "user",
  },
  "admin.users.filteredResults": {
    ar: "تم تصفية النتائج",
    en: "Results filtered",
  },
  "admin.users.noUsersMatch": {
    ar: "لا يوجد مستخدمون يطابقون البحث",
    en: "No users match the search",
  },
  "admin.users.tableUser": {
    ar: "المستخدم",
    en: "User",
  },
  "admin.users.tableEmail": {
    ar: "البريد الإلكتروني",
    en: "Email",
  },
  "admin.users.tableRole": {
    ar: "الدور",
    en: "Role",
  },
  "admin.users.tableStatus": {
    ar: "الحالة",
    en: "Status",
  },
  "admin.users.tableJoined": {
    ar: "تاريخ التسجيل",
    en: "Joined",
  },
  "admin.users.tableActions": {
    ar: "الإجراءات",
    en: "Actions",
  },
  "admin.users.roleAdmin": {
    ar: "مشرف",
    en: "Admin",
  },
  "admin.users.roleUser": {
    ar: "مستخدم",
    en: "User",
  },
  "admin.users.statusActive": {
    ar: "نشط",
    en: "Active",
  },
  "admin.users.statusSuspended": {
    ar: "معلق",
    en: "Suspended",
  },
  "admin.users.you": {
    ar: "(أنت)",
    en: "(you)",
  },
  "admin.users.promoteToAdmin": {
    ar: "ترقية إلى مشرف",
    en: "Promote to Admin",
  },
  "admin.users.demoteFromAdmin": {
    ar: "إزالة صلاحيات المشرف",
    en: "Remove Admin Rights",
  },
  "admin.users.suspend": {
    ar: "تعليق الحساب",
    en: "Suspend Account",
  },
  "admin.users.reactivate": {
    ar: "إعادة تفعيل",
    en: "Reactivate",
  },
  "admin.users.deleteAccount": {
    ar: "حذف الحساب",
    en: "Delete Account",
  },
  "admin.users.cannotSuspendAdmin": {
    ar: "لا يمكن تعليق مشرف",
    en: "Cannot suspend an admin",
  },
  "admin.users.cannotDeleteAdmin": {
    ar: "لا يمكن حذف مشرف",
    en: "Cannot delete an admin",
  },
  "admin.users.operationSuccess": {
    ar: "تمت العملية بنجاح",
    en: "Operation completed successfully",
  },
  "admin.users.operationError": {
    ar: "حدث خطأ",
    en: "An error occurred",
  },
  "admin.users.confirmDeleteTitle": {
    ar: "تأكيد حذف الحساب",
    en: "Confirm Account Deletion",
  },
  "admin.users.confirmSuspendTitle": {
    ar: "تأكيد تعليق الحساب",
    en: "Confirm Account Suspension",
  },
  "admin.users.confirmDemoteTitle": {
    ar: "تأكيد إزالة صلاحيات المشرف",
    en: "Confirm Admin Rights Removal",
  },
  "admin.users.confirmDeleteDesc": {
    ar: "هل أنت متأكد من حذف حساب",
    en: "Are you sure you want to delete the account of",
  },
  "admin.users.confirmDeleteWarning": {
    ar: "هذا الإجراء لا يمكن التراجع عنه.",
    en: "This action cannot be undone.",
  },
  "admin.users.confirmSuspendDesc": {
    ar: "هل أنت متأكد من تعليق حساب",
    en: "Are you sure you want to suspend the account of",
  },
  "admin.users.confirmSuspendWarning": {
    ar: "لن يتمكن من تسجيل الدخول حتى إعادة التفعيل.",
    en: "They won't be able to log in until reactivated.",
  },
  "admin.users.confirmDemoteDesc": {
    ar: "هل أنت متأكد من إزالة صلاحيات المشرف من",
    en: "Are you sure you want to remove admin rights from",
  },

  // ============ ADMIN AVATARS ============
  "admin.avatars.title": {
    ar: "إدارة الأفتارات",
    en: "Avatar Management",
  },
  "admin.avatars.library": {
    ar: "مكتبة الصور الرمزية",
    en: "Avatar Library",
  },
  "admin.avatars.subtitle": {
    ar: "أضف وعدّل واحذف صور اللاعبين المستخدمة في التسجيل والملفات الشخصية.",
    en: "Add, edit, and delete player images used in registration and profiles.",
  },
  "admin.avatars.totalImages": {
    ar: "إجمالي الصور",
    en: "Total Images",
  },
  "admin.avatars.legendsCategory": {
    ar: "أساطير",
    en: "Legends",
  },
  "admin.avatars.playersCategory": {
    ar: "لاعبون",
    en: "Players",
  },
  "admin.avatars.addNew": {
    ar: "إضافة صورة رمزية جديدة",
    en: "Add New Avatar",
  },
  "admin.avatars.noAvatarsYet": {
    ar: "لا توجد صور رمزية بعد",
    en: "No avatars yet",
  },
  "admin.avatars.clickToAdd": {
    ar: "اضغط على الزر أعلاه لإضافة أول صورة",
    en: "Click the button above to add the first image",
  },
  "admin.avatars.legendCategory": {
    ar: "فئة الأساطير",
    en: "Legends Category",
  },
  "admin.avatars.playerCategory": {
    ar: "فئة اللاعبين",
    en: "Players Category",
  },
  "admin.avatars.uploadNew": {
    ar: "رفع صورة رمزية جديدة",
    en: "Upload New Avatar",
  },

  // ============ RESET STAGE ============
  "admin.reset.title": {
    ar: "إعادة تعيين البطولة",
    en: "Reset Tournament",
  },
  "admin.reset.description": {
    ar: "إرجاع البطولة إلى مرحلة سابقة",
    en: "Return tournament to a previous stage",
  },
  "admin.reset.toRegistrationOpen": {
    ar: "إعادة فتح التسجيل",
    en: "Reopen Registration",
  },
  "admin.reset.toRegistrationClosed": {
    ar: "إغلاق التسجيل",
    en: "Close Registration",
  },
  "admin.reset.toTypeSelection": {
    ar: "اختيار نوع البطولة",
    en: "Select Tournament Type",
  },
  "admin.reset.toAfterTeamDraw": {
    ar: "بعد سحب الفرق",
    en: "After Team Draw",
  },
  "admin.reset.toAfterMatchGeneration": {
    ar: "بعد إنشاء المباريات",
    en: "After Match Generation",
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
