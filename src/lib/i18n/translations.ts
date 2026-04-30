import { Locale } from "./context";

type TranslationKey = string;

const translations: Record<TranslationKey, { FR: string; AR: string }> = {
  // ── Navigation ──────────────────────────────────────────
  "nav.coiffeur": { FR: "Coiffeur", AR: "حلاق" },
  "nav.barbier": { FR: "Barbier", AR: "حلاق رجالي" },
  "nav.institut": { FR: "Institut", AR: "معهد التجميل" },
  "nav.spa": { FR: "Spa", AR: "سبا وحمام" },
  "nav.pro_cta": { FR: "Je suis professionnel", AR: "أنا محترف" },
  "nav.my_account": { FR: "Mon compte", AR: "حسابي" },
  "nav.my_appointments": { FR: "Mes rendez-vous", AR: "مواعيدي" },
  "nav.favorites": { FR: "Favoris", AR: "المفضلة" },
  "nav.settings": { FR: "Paramètres", AR: "الإعدادات" },
  "nav.pro_space": { FR: "Espace Pro", AR: "فضاء المحترفين" },
  "nav.logout": { FR: "Déconnexion", AR: "تسجيل الخروج" },

  // ── Auth – Connexion ─────────────────────────────────────
  "auth.login_title": { FR: "Connexion", AR: "تسجيل الدخول" },
  "auth.login_subtitle": { FR: "Connectez-vous à votre compte", AR: "سجّل الدخول إلى حسابك" },
  "auth.registration_success": { FR: "Compte créé avec succès ! Connectez-vous pour continuer.", AR: "تم إنشاء الحساب بنجاح! سجّل الدخول للمتابعة." },
  "auth.login_error": { FR: "Email ou mot de passe incorrect", AR: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
  "auth.login_general_error": { FR: "Une erreur est survenue. Réessayez.", AR: "حدث خطأ. حاول مرة أخرى." },
  "auth.email": { FR: "Email", AR: "البريد الإلكتروني" },
  "auth.password": { FR: "Mot de passe", AR: "كلمة المرور" },
  "auth.remember_me": { FR: "Se souvenir de moi", AR: "تذكرني" },
  "auth.forgot_password": { FR: "Mot de passe oublié ?", AR: "نسيت كلمة المرور؟" },
  "auth.sign_in": { FR: "Se connecter", AR: "تسجيل الدخول" },
  "auth.signing_in": { FR: "Connexion en cours...", AR: "جارٍ تسجيل الدخول..." },
  "auth.or": { FR: "Ou", AR: "أو" },
  "auth.continue_google": { FR: "Continuer avec Google", AR: "المتابعة بحساب غوغل" },
  "auth.no_account": { FR: "Pas encore de compte ?", AR: "ليس لديك حساب بعد؟" },
  "auth.register_link": { FR: "S'inscrire", AR: "إنشاء حساب" },

  // ── Auth – Inscription ────────────────────────────────────
  "auth.register_title": { FR: "Créer un compte", AR: "إنشاء حساب" },
  "auth.register_subtitle": { FR: "Rejoignez Planity.ma et réservez en ligne", AR: "انضم إلى Planity.ma واحجز عبر الإنترنت" },
  "auth.first_name": { FR: "Prénom", AR: "الاسم الأول" },
  "auth.last_name": { FR: "Nom", AR: "اللقب" },
  "auth.phone": { FR: "Téléphone", AR: "الهاتف" },
  "auth.phone_formats": { FR: "Formats acceptés : 06XXXXXXXX, 07XXXXXXXX, +2126XXXXXXXX", AR: "الصيغ المقبولة: 06XXXXXXXX, 07XXXXXXXX, +2126XXXXXXXX" },
  "auth.phone_invalid": { FR: "Format invalide. Exemples : 0612345678, +212****5678", AR: "صيغة غير صالحة. أمثلة: 0612345678, +212****5678" },
  "auth.create_account": { FR: "Créer mon compte", AR: "إنشاء حسابي" },
  "auth.creating": { FR: "Création en cours...", AR: "جارٍ إنشاء الحساب..." },
  "auth.already_account": { FR: "Déjà un compte ?", AR: "لديك حساب بالفعل؟" },
  "auth.password_min": { FR: "Minimum 8 caractères", AR: "٨ أحرف على الأقل" },
  "auth.captcha_error": { FR: "Erreur de vérification CAPTCHA. Veuillez réessayer.", AR: "خطأ في التحقق. يرجى المحاولة مرة أخرى." },
  "auth.captcha_required": { FR: "Veuillez compléter la vérification CAPTCHA", AR: "يرجى إكمال التحقق" },

  // ── Settings page ────────────────────────────────────────
  "settings.title": { FR: "Paramètres", AR: "الإعدادات" },
  "settings.subtitle": { FR: "Gérez votre profil, sécurité et préférences", AR: "إدارة الملف الشخصي والأمان والتفضيلات" },
  "settings.profile": { FR: "Profil", AR: "الملف الشخصي" },
  "settings.full_name": { FR: "Nom complet", AR: "الاسم الكامل" },
  "settings.email": { FR: "Adresse e-mail", AR: "البريد الإلكتروني" },
  "settings.email_readonly": { FR: "L'e-mail ne peut pas être modifié", AR: "لا يمكن تعديل البريد الإلكتروني" },
  "settings.phone": { FR: "Téléphone", AR: "الهاتف" },
  "settings.phone_format": { FR: "Format marocain : 06XXXXXXXX ou +212 6XXXXXXXX", AR: "الصيغة المغربية: 06XXXXXXXX أو +212 6XXXXXXXX" },
  "settings.save": { FR: "Enregistrer", AR: "حفظ" },
  "settings.password": { FR: "Mot de passe", AR: "كلمة المرور" },
  "settings.current_password": { FR: "Mot de passe actuel", AR: "كلمة المرور الحالية" },
  "settings.new_password": { FR: "Nouveau mot de passe", AR: "كلمة المرور الجديدة" },
  "settings.confirm_password": { FR: "Confirmer le mot de passe", AR: "تأكيد كلمة المرور" },
  "settings.password_mismatch": { FR: "Les mots de passe ne correspondent pas", AR: "كلمتا المرور غير متطابقتين" },
  "settings.password_min": { FR: "8 caractères minimum", AR: "٨ أحرف على الأقل" },
  "settings.password_upper": { FR: "Une majuscule", AR: "حرف كبير واحد" },
  "settings.password_lower": { FR: "Une minuscule", AR: "حرف صغير واحد" },
  "settings.password_digit": { FR: "Un chiffre", AR: "رقم واحد" },
  "settings.password_strength": { FR: "Faible", AR: "ضعيفة" },
  "settings.password_strength_medium": { FR: "Moyen", AR: "متوسطة" },
  "settings.password_strength_good": { FR: "Bon", AR: "جيدة" },
  "settings.password_strength_excellent": { FR: "Excellent", AR: "ممتازة" },
  "settings.notifications": { FR: "Notifications", AR: "الإشعارات" },
  "settings.notif_booking_confirmed": { FR: "Confirmation de rendez-vous", AR: "تأكيد الموعد" },
  "settings.notif_booking_confirmed_desc": { FR: "Recevez une notification quand votre rendez-vous est confirmé", AR: "تلقّ إشعاراً عند تأكيد موعدك" },
  "settings.notif_reminder": { FR: "Rappel de rendez-vous", AR: "تذكير بالموعد" },
  "settings.notif_reminder_desc": { FR: "Recevez un rappel avant votre rendez-vous", AR: "تلقّ تذكيراً قبل موعدك" },
  "settings.notif_marketing": { FR: "Offres et promotions", AR: "العروض والتخفيضات" },
  "settings.notif_marketing_desc": { FR: "Recevez les offres et promotions", AR: "تلقّ العروض والتخفيضات" },
  "settings.danger_zone": { FR: "Zone de danger", AR: "منطقة الخطر" },
  "settings.delete_account": { FR: "Supprimer mon compte", AR: "حذف حسابي" },
  "settings.delete_confirm": { FR: "Tapez SUPPRIMER pour confirmer", AR: "اكتب حذف للتأكيد" },

  // ── Search page ──────────────────────────────────────────
  "search.title": { FR: "Recherche", AR: "البحث" },
  "search.placeholder": { FR: "Rechercher un salon...", AR: "ابحث عن صالون..." },
  "search.filters": { FR: "Filtres", AR: "التصفية" },
  "search.categories": { FR: "Catégories", AR: "الفئات" },
  "search.budget": { FR: "Budget (DH)", AR: "الميزانية (د.م)" },
  "search.min_rating": { FR: "Note minimum", AR: "الحد الأدنى للتقييم" },
  "search.stars": { FR: "étoiles", AR: "نجوم" },
  "search.options": { FR: "Options", AR: "خيارات" },
  "search.verified_only": { FR: "Vérifié uniquement", AR: "المحقّق فقط" },
  "search.open_now": { FR: "Ouvert maintenant", AR: "مفتوح الآن" },
  "search.city": { FR: "Ville", AR: "المدينة" },
  "search.all_cities": { FR: "Toutes les villes", AR: "جميع المدن" },
  "search.sort_by": { FR: "Trier par", AR: "ترتيب حسب" },
  "search.sort_rating": { FR: "Meilleures notes", AR: "أفضل التقييمات" },
  "search.sort_reviews": { FR: "Plus d'avis", AR: "أكثر التقييمات" },
  "search.sort_price_asc": { FR: "Prix croissant", AR: "السعر تصاعدي" },
  "search.sort_price_desc": { FR: "Prix décroissant", AR: "السعر تنازلي" },
  "search.sort_name": { FR: "Nom A-Z", AR: "الاسم أ-ي" },
  "search.reset_filters": { FR: "Réinitialiser les filtres", AR: "إعادة تعيين التصفية" },
  "search.no_results": { FR: "Aucun salon trouvé", AR: "لم يتم العثور على صالون" },
  "search.results_count": { FR: "{count} salon trouvé", AR: "{count} صالون تم العثور عليه" },

  // ── Booking ───────────────────────────────────────────────
  "booking.title": { FR: "Réserver", AR: "حجز" },
  "booking.confirm": { FR: "Confirmer la réservation", AR: "تأكيد الحجز" },
  "booking.cancel": { FR: "Annuler", AR: "إلغاء" },
  "booking.select_time": { FR: "Choisir un créneau", AR: "اختر موعداً" },
  "booking.select_service": { FR: "Choisir un service", AR: "اختر خدمة" },
  "booking.success": { FR: "Réservation confirmée !", AR: "تم تأكيد الحجز!" },
  "booking.error": { FR: "Erreur lors de la réservation", AR: "حدث خطأ أثناء الحجز" },

  // ── Common ────────────────────────────────────────────────
  "common.loading": { FR: "Chargement...", AR: "جارٍ التحميل..." },
  "common.error": { FR: "Une erreur est survenue", AR: "حدث خطأ" },
  "common.retry": { FR: "Réessayer", AR: "حاول مرة أخرى" },
  "common.save": { FR: "Enregistrer", AR: "حفظ" },
  "common.cancel": { FR: "Annuler", AR: "إلغاء" },
  "common.close": { FR: "Fermer", AR: "إغلاق" },
  "common.back": { FR: "Retour", AR: "رجوع" },
  "common.next": { FR: "Suivant", AR: "التالي" },
  "common.previous": { FR: "Précédent", AR: "السابق" },
  "common.see_more": { FR: "Voir plus", AR: "عرض المزيد" },
  "common.all_rights_reserved": { FR: "Tous droits réservés.", AR: "جميع الحقوق محفوظة." },

  // ── Language switcher ─────────────────────────────────────
  "lang.switch_to_ar": { FR: "عربي", AR: "Français" },
  "lang.label": { FR: "Langue", AR: "اللغة" },

  // ── Footer ────────────────────────────────────────────────
  "footer.discover": { FR: "Découvrir", AR: "اكتشف" },
  "footer.popular_cities": { FR: "Villes populaires", AR: "المدن الشائعة" },
  "footer.info": { FR: "Informations", AR: "معلومات" },
  "footer.terms": { FR: "Conditions générales", AR: "الشروط العامة" },
  "footer.privacy": { FR: "Politique de confidentialité", AR: "سياسة الخصوصية" },
  "footer.tagline": { FR: "La plateforme de réservation beauté et bien-être au Maroc.", AR: "منصة حجز مواقع التجميل والعافية في المغرب." },
};

export type Translations = typeof translations;

export function t(key: string, locale: Locale): string {
  const entry = translations[key];
  if (!entry) return key; // fallback: return key itself
  return entry[locale] ?? entry.FR ?? key;
}

export { translations };