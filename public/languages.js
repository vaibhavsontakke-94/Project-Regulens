/* ═══════════════════════════════════════════════════════════
   ReguLens — International Language Registry
   40+ languages with RTL support, grouped by region
   ═══════════════════════════════════════════════════════════ */

window.LANGUAGES = [
  // ── Europe ──
  { code: "en", name: "English", nativeName: "English", region: "Europe", direction: "ltr", flag: "🇬🇧" },
  { code: "fr", name: "French", nativeName: "Français", region: "Europe", direction: "ltr", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "Europe", direction: "ltr", flag: "🇩🇪" },
  { code: "es", name: "Spanish", nativeName: "Español", region: "Europe", direction: "ltr", flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "Europe", direction: "ltr", flag: "🇵🇹" },
  { code: "it", name: "Italian", nativeName: "Italiano", region: "Europe", direction: "ltr", flag: "🇮🇹" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", region: "Europe", direction: "ltr", flag: "🇳🇱" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", region: "Europe", direction: "ltr", flag: "🇬🇷" },
  { code: "pl", name: "Polish", nativeName: "Polski", region: "Europe", direction: "ltr", flag: "🇵🇱" },
  { code: "cs", name: "Czech", nativeName: "Čeština", region: "Europe", direction: "ltr", flag: "🇨🇿" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", region: "Europe", direction: "ltr", flag: "🇸🇰" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", region: "Europe", direction: "ltr", flag: "🇭🇺" },
  { code: "ro", name: "Romanian", nativeName: "Română", region: "Europe", direction: "ltr", flag: "🇷🇴" },
  { code: "bg", name: "Bulgarian", nativeName: "Български", region: "Europe", direction: "ltr", flag: "🇧🇬" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", region: "Europe", direction: "ltr", flag: "🇺🇦" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "Europe", direction: "ltr", flag: "🇷🇺" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", region: "Europe", direction: "ltr", flag: "🇸🇪" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", region: "Europe", direction: "ltr", flag: "🇳🇴" },
  { code: "da", name: "Danish", nativeName: "Dansk", region: "Europe", direction: "ltr", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", region: "Europe", direction: "ltr", flag: "🇫🇮" },

  // ── Asia ──
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "Asia", direction: "ltr", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "Asia", direction: "ltr", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "Asia", direction: "ltr", flag: "🇧🇩" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "Asia", direction: "ltr", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "Asia", direction: "ltr", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "Asia", direction: "ltr", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "Asia", direction: "ltr", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "Asia", direction: "ltr", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "Asia", direction: "ltr", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "Asia", direction: "rtl", flag: "🇵🇰" },
  { code: "zh", name: "Chinese", nativeName: "中文", region: "Asia", direction: "ltr", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "Asia", direction: "ltr", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "Asia", direction: "ltr", flag: "🇰🇷" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", region: "Asia", direction: "ltr", flag: "🇮🇩" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", region: "Asia", direction: "ltr", flag: "🇲🇾" },
  { code: "th", name: "Thai", nativeName: "ไทย", region: "Asia", direction: "ltr", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", region: "Asia", direction: "ltr", flag: "🇻🇳" },
  { code: "tl", name: "Filipino", nativeName: "Filipino", region: "Asia", direction: "ltr", flag: "🇵🇭" },

  // ── Middle East ──
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "Middle East", direction: "rtl", flag: "🇸🇦" },
  { code: "he", name: "Hebrew", nativeName: "עברית", region: "Middle East", direction: "rtl", flag: "🇮🇱" },
  { code: "fa", name: "Persian", nativeName: "فارسی", region: "Middle East", direction: "rtl", flag: "🇮🇷" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", region: "Middle East", direction: "ltr", flag: "🇹🇷" },

  // ── Africa ──
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", region: "Africa", direction: "ltr", flag: "🇰🇪" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", region: "Africa", direction: "ltr", flag: "🇪🇹" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", region: "Africa", direction: "ltr", flag: "🇿🇦" },
];

window.getLanguageByCode = function(code) {
  return window.LANGUAGES.find(function(l) { return l.code === code; }) || null;
};

window.getLanguageDirection = function(code) {
  var lang = window.getLanguageByCode(code);
  return lang ? lang.direction : "ltr";
};

window.getLanguagesByRegion = function() {
  var regions = {};
  window.LANGUAGES.forEach(function(lang) {
    if (!regions[lang.region]) regions[lang.region] = [];
    regions[lang.region].push(lang);
  });
  return regions;
};
