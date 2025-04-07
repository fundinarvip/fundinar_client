import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // General
      "signIn": "Sign In",
      "signUp": "Sign Up",
      "signInError": "Sign-in failed. Please check your credentials.",
      "signUpError": "Sign-up failed. Please try again.",
      "Email": "Email",
      "Password": "Password",
      "Name": "Name",
      "emailPlaceholder": "Enter your email",
      "passwordPlaceholder": "Enter your password",
      "namePlaceholder": "Enter your name",
      "forgotPassword": "Forgot Password",
      "backToHome": "Back to Home",
      "footerRights": "© 2025 Fundinar.vip All rights reserved",
      "noToken": "No authentication token found. Redirecting to sign in...",
      "fetchError": "Failed to fetch user data. Redirecting to sign in...",
      "loading": "Loading...",

      // Landing Page
      "welcome": "Your VIP High-Yield Fund",
      "portfolioPerformance": "Portfolio Performance",
      "daily": "Daily",
      "weekly": "Weekly",
      "monthly": "Monthly",
      "all": "All Time",

      // User Dashboard
      "portfolioBalance": "Portfolio Balance",
      "depositFunds": "Deposit Funds",
      "requestWithdrawal": "Request Withdrawal",
      "viewTransactionHistory": "View Transaction History",
      "logout": "Logout",
      "uploadProfilePrompt": "Click the logo above to upload your profile picture!",
      "uploadPicture": "Upload Picture",
      "enterAmount": "Enter amount",
      "selectCurrency": "Select currency",
      "selectNetwork": "Select network",
      "hideCurrencies": "Hide currencies",
      "moreCurrencies": "More currencies",
      "address": "Address",
      "name": "Name",
      "copy": "Copy",
      "copied": "Copied to clipboard!",
      "submitRequest": "Submit Request",
      "depositNote": "Deposits are subject to exchange rates and transaction fees and take 1-2 business days to process.",
      "withdrawNote": "Withdrawals are subject to exchange rates and transaction fees and take 1-2 business days to process.",
      "depositDetails": "Send funds to",
      "withdrawRecorded": "Withdrawal request recorded successfully.",
      "withdrawFailed": "Failed to record withdrawal request.",
      "depositSubmitted": "Deposit request submitted successfully.",
      "depositFailed": "Failed to submit deposit request.",
      "uploadFailed": "Failed to upload profile picture.",
      "enterCryptoAddress": "Enter your crypto address",
      "enterBankDetails": "Enter your bank transfer details (Name, IBAN, etc.)",
      "transactionHistory": "Transaction History",
      "deposit": "Deposit",
      "profit": "Profit",
      "withdrawal": "Withdrawal",
      "loss": "Loss",
      "pending": "Pending",
      "amount": "Amount",
      "fee": "Fee"
    }
  },
  ar: {
    translation: {
      // General
      "signIn": "تسجيل الدخول",
      "signUp": "التسجيل",
      "signInError": "فشل تسجيل الدخول. يرجى التحقق من بياناتك.",
      "signUpError": "فشل التسجيل. حاول مرة أخرى.",
      "Email": "البريد الإلكتروني",
      "Password": "كلمة المرور",
      "Name": "الاسم",
      "emailPlaceholder": "أدخل بريدك الإلكتروني",
      "passwordPlaceholder": "أدخل كلمة المرور",
      "namePlaceholder": "أدخل اسمك",
      "forgotPassword": "نسيت كلمة المرور",
      "backToHome": "العودة إلى الصفحة الرئيسية",
      "footerRights": "© 2025 Fundinar.vip جميع الحقوق محفوظة",
      "noToken": "لم يتم العثور على رمز المصادقة. جارٍ إعادة التوجيه إلى تسجيل الدخول...",
      "fetchError": "فشل جلب بيانات المستخدم. جارٍ إعادة التوجيه إلى تسجيل الدخول...",
      "loading": "جارٍ التحميل...",

      // Landing Page
      "welcome": "صندوقك الاستثماري المميز عالي العائد",
      "portfolioPerformance": "أداء المحفظة",
      "daily": "يومي",
      "weekly": "أسبوعي",
      "monthly": "شهري",
      "all": "كل الوقت",

      // User Dashboard
      "portfolioBalance": "رصيد المحفظة",
      "depositFunds": "إيداع الأموال",
      "requestWithdrawal": "طلب سحب",
      "viewTransactionHistory": "عرض سجل المعاملات",
      "logout": "تسجيل الخروج",
      "uploadProfilePrompt": "انقر على الشعار أعلاه لتحميل صورة ملفك الشخصي!",
      "uploadPicture": "تحميل الصورة",
      "enterAmount": "أدخل المبلغ",
      "selectCurrency": "اختر العملة",
      "selectNetwork": "اختر الشبكة",
      "hideCurrencies": "إخفاء العملات",
      "moreCurrencies": "المزيد من العملات",
      "address": "العنوان",
      "name": "الاسم",
      "copy": "نسخ",
      "copied": "تم النسخ إلى الحافظة!",
      "submitRequest": "إرسال الطلب",
      "depositNote": "الإيداعات خاضعة لأسعار الصرف ورسوم المعاملات وتستغرق 1-2 أيام عمل للمعالجة.",
      "withdrawNote": "السحوبات خاضعة لأسعار الصرف ورسوم المعاملات وتستغرق 1-2 أيام عمل للمعالجة.",
      "depositDetails": "أرسل الأموال إلى",
      "withdrawRecorded": "تم تسجيل طلب السحب بنجاح.",
      "withdrawFailed": "فشل تسجيل طلب السحب.",
      "depositSubmitted": "تم تقديم طلب الإيداع بنجاح.",
      "depositFailed": "فشل تقديم طلب الإيداع.",
      "uploadFailed": "فشل تحميل صورة الملف الشخصي.",
      "enterCryptoAddress": "أدخل عنوان العملة المشفرة الخاص بك",
      "enterBankDetails": "أدخل تفاصيل التحويل البنكي الخاص بك (الاسم، IBAN، إلخ.)",
      "transactionHistory": "سجل المعاملات",
      "deposit": "إيداع",
      "profit": "ربح",
      "withdrawal": "سحب",
      "loss": "خسارة",
      "pending": "معلق",
      "amount": "المبلغ",
      "fee": "الرسوم"
    }
  },
  fr: {
    translation: {
      // General
      "signIn": "Se connecter",
      "signUp": "S'inscrire",
      "signInError": "Échec de la connexion. Veuillez vérifier vos identifiants.",
      "signUpError": "Échec de l'inscription. Réessayez.",
      "Email": "Email",
      "Password": "Mot de passe",
      "Name": "Nom",
      "emailPlaceholder": "Entrez votre email",
      "passwordPlaceholder": "Entrez votre mot de passe",
      "namePlaceholder": "Entrez votre nom",
      "forgotPassword": "Mot de passe oublié",
      "backToHome": "Retour à l'accueil",
      "footerRights": "© 2025 Fundinar.vip Tous droits réservés",
      "noToken": "Aucun jeton d'authentification trouvé. Redirection vers la connexion...",
      "fetchError": "Échec de la récupération des données utilisateur. Redirection vers la connexion...",
      "loading": "Chargement...",

      // Landing Page
      "welcome": "Votre fonds à haut rendement VIP",
      "portfolioPerformance": "Performance du portefeuille",
      "daily": "Quotidien",
      "weekly": "Hebdomadaire",
      "monthly": "Mensuel",
      "all": "Tout le temps",

      // User Dashboard
      "portfolioBalance": "Solde du portefeuille",
      "depositFunds": "Déposer des fonds",
      "requestWithdrawal": "Demander un retrait",
      "viewTransactionHistory": "Voir l'historique des transactions",
      "logout": "Se déconnecter",
      "uploadProfilePrompt": "Cliquez sur le logo ci-dessus pour télécharger votre photo de profil !",
      "uploadPicture": "Télécharger la photo",
      "enterAmount": "Entrez le montant",
      "selectCurrency": "Sélectionnez la devise",
      "selectNetwork": "Sélectionnez le réseau",
      "hideCurrencies": "Masquer les devises",
      "moreCurrencies": "Plus de devises",
      "address": "Adresse",
      "name": "Nom",
      "copy": "Copier",
      "copied": "Copié dans le presse-papiers !",
      "submitRequest": "Soumettre la demande",
      "depositNote": "Les dépôts sont soumis aux taux de change et aux frais de transaction et prennent 1 à 2 jours ouvrables pour être traités.",
      "withdrawNote": "Les retraits sont soumis aux taux de change et aux frais de transaction et prennent 1 à 2 jours ouvrables pour être traités.",
      "depositDetails": "Envoyez les fonds à",
      "withdrawRecorded": "Demande de retrait enregistrée avec succès.",
      "withdrawFailed": "Échec de l'enregistrement de la demande de retrait.",
      "depositSubmitted": "Demande de dépôt soumise avec succès.",
      "depositFailed": "Échec de la soumission de la demande de dépôt.",
      "uploadFailed": "Échec du téléchargement de la photo de profil.",
      "enterCryptoAddress": "Entrez votre adresse crypto",
      "enterBankDetails": "Entrez vos détails de virement bancaire (Nom, IBAN, etc.)",
      "transactionHistory": "Historique des transactions",
      "deposit": "Dépôt",
      "profit": "Profit",
      "withdrawal": "Retrait",
      "loss": "Perte",
      "pending": "En attente",
      "amount": "Montant",
      "fee": "Frais"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;