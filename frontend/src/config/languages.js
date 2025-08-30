// Supported languages for Gemini API translation
// Based on Google's language support for translation

export const supportedLanguages = [
  // Major languages
  { code: "en", name: "English", flag: "🇺🇸", countryCode: "US" },
  { code: "si", name: "Sinhala", flag: "🇱🇰", countryCode: "LK" },
  { code: "ta", name: "Tamil", flag: "🇱🇰", countryCode: "LK" },

  // European languages
  { code: "es", name: "Spanish", flag: "🇪🇸", countryCode: "ES" },
  { code: "fr", name: "French", flag: "🇫🇷", countryCode: "FR" },
  { code: "de", name: "German", flag: "🇩🇪", countryCode: "DE" },
  { code: "it", name: "Italian", flag: "🇮🇹", countryCode: "IT" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", countryCode: "PT" },
  { code: "ru", name: "Russian", flag: "🇷🇺", countryCode: "RU" },
  { code: "nl", name: "Dutch", flag: "🇳🇱", countryCode: "NL" },
  { code: "sv", name: "Swedish", flag: "🇸🇪", countryCode: "SE" },
  { code: "no", name: "Norwegian", flag: "🇳🇴", countryCode: "NO" },
  { code: "da", name: "Danish", flag: "🇩🇰", countryCode: "DK" },
  { code: "fi", name: "Finnish", flag: "🇫🇮", countryCode: "FI" },
  { code: "pl", name: "Polish", flag: "🇵🇱", countryCode: "PL" },
  { code: "cs", name: "Czech", flag: "🇨🇿", countryCode: "CZ" },
  { code: "sk", name: "Slovak", flag: "🇸🇰", countryCode: "SK" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺", countryCode: "HU" },
  { code: "ro", name: "Romanian", flag: "🇷🇴", countryCode: "RO" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬", countryCode: "BG" },
  { code: "hr", name: "Croatian", flag: "🇭🇷", countryCode: "HR" },
  { code: "sr", name: "Serbian", flag: "🇷🇸", countryCode: "RS" },
  { code: "sl", name: "Slovenian", flag: "🇸🇮", countryCode: "SI" },
  { code: "et", name: "Estonian", flag: "🇪🇪", countryCode: "EE" },
  { code: "lv", name: "Latvian", flag: "🇱🇻", countryCode: "LV" },
  { code: "lt", name: "Lithuanian", flag: "🇱🇹", countryCode: "LT" },
  { code: "mt", name: "Maltese", flag: "🇲🇹", countryCode: "MT" },
  { code: "ga", name: "Irish", flag: "🇮🇪", countryCode: "IE" },
  { code: "cy", name: "Welsh", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", countryCode: "GB" },
  { code: "eu", name: "Basque", flag: "🏴󠁥󠁳󠁰󠁶󠁿", countryCode: "ES" },
  { code: "ca", name: "Catalan", flag: "🏴󠁥󠁳󠁣󠁴󠁿", countryCode: "ES" },

  // Asian languages
  { code: "zh", name: "Chinese (Simplified)", flag: "🇨🇳", countryCode: "CN" },
  {
    code: "zh-TW",
    name: "Chinese (Traditional)",
    flag: "🇹🇼",
    countryCode: "TW",
  },
  { code: "ja", name: "Japanese", flag: "🇯🇵", countryCode: "JP" },
  { code: "ko", name: "Korean", flag: "🇰🇷", countryCode: "KR" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", countryCode: "IN" },
  { code: "bn", name: "Bengali", flag: "🇧🇩", countryCode: "BD" },
  { code: "ur", name: "Urdu", flag: "🇵🇰", countryCode: "PK" },
  { code: "te", name: "Telugu", flag: "🇮🇳", countryCode: "IN" },
  { code: "mr", name: "Marathi", flag: "🇮🇳", countryCode: "IN" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳", countryCode: "IN" },
  { code: "kn", name: "Kannada", flag: "🇮🇳", countryCode: "IN" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳", countryCode: "IN" },
  { code: "pa", name: "Punjabi", flag: "🇮🇳", countryCode: "IN" },
  { code: "or", name: "Odia", flag: "🇮🇳", countryCode: "IN" },
  { code: "as", name: "Assamese", flag: "🇮🇳", countryCode: "IN" },
  { code: "ne", name: "Nepali", flag: "🇳🇵", countryCode: "NP" },
  { code: "my", name: "Myanmar (Burmese)", flag: "🇲🇲", countryCode: "MM" },
  { code: "th", name: "Thai", flag: "🇹🇭", countryCode: "TH" },
  { code: "lo", name: "Lao", flag: "🇱🇦", countryCode: "LA" },
  { code: "km", name: "Khmer", flag: "🇰🇭", countryCode: "KH" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳", countryCode: "VN" },
  { code: "id", name: "Indonesian", flag: "🇮🇩", countryCode: "ID" },
  { code: "ms", name: "Malay", flag: "🇲🇾", countryCode: "MY" },
  { code: "tl", name: "Filipino", flag: "🇵🇭", countryCode: "PH" },
  { code: "ceb", name: "Cebuano", flag: "🇵🇭", countryCode: "PH" },

  // Middle Eastern & African languages
  { code: "ar", name: "Arabic", flag: "🇸🇦", countryCode: "SA" },
  { code: "fa", name: "Persian", flag: "🇮🇷", countryCode: "IR" },
  { code: "he", name: "Hebrew", flag: "🇮🇱", countryCode: "IL" },
  { code: "tr", name: "Turkish", flag: "🇹🇷", countryCode: "TR" },
  { code: "sw", name: "Swahili", flag: "🇰🇪", countryCode: "KE" },
  { code: "am", name: "Amharic", flag: "🇪🇹", countryCode: "ET" },
  { code: "yo", name: "Yoruba", flag: "🇳🇬", countryCode: "NG" },
  { code: "ig", name: "Igbo", flag: "🇳🇬", countryCode: "NG" },
  { code: "ha", name: "Hausa", flag: "🇳🇬", countryCode: "NG" },
  { code: "zu", name: "Zulu", flag: "🇿🇦", countryCode: "ZA" },
  { code: "af", name: "Afrikaans", flag: "🇿🇦", countryCode: "ZA" },

  // Other languages
  { code: "is", name: "Icelandic", flag: "🇮🇸", countryCode: "IS" },
  { code: "mk", name: "Macedonian", flag: "🇲🇰", countryCode: "MK" },
  { code: "sq", name: "Albanian", flag: "🇦🇱", countryCode: "AL" },
  { code: "be", name: "Belarusian", flag: "🇧🇾", countryCode: "BY" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦", countryCode: "UA" },
  { code: "ka", name: "Georgian", flag: "🇬🇪", countryCode: "GE" },
  { code: "hy", name: "Armenian", flag: "🇦🇲", countryCode: "AM" },
  { code: "az", name: "Azerbaijani", flag: "🇦🇿", countryCode: "AZ" },
  { code: "kk", name: "Kazakh", flag: "🇰🇿", countryCode: "KZ" },
  { code: "ky", name: "Kyrgyz", flag: "🇰🇬", countryCode: "KG" },
  { code: "uz", name: "Uzbek", flag: "🇺🇿", countryCode: "UZ" },
  { code: "tg", name: "Tajik", flag: "🇹🇯", countryCode: "TJ" },
  { code: "mn", name: "Mongolian", flag: "🇲🇳", countryCode: "MN" },
];

// Helper function to get language by code
export const getLanguageByCode = (code) => {
  return supportedLanguages.find((lang) => lang.code === code);
};

// Helper function to get language name with flag
export const getLanguageDisplay = (code) => {
  const lang = getLanguageByCode(code);
  return lang ? `${lang.flag} ${lang.name}` : code;
};
