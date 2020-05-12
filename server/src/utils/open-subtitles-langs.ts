const SUPPORTED_LANGS = [
  { SubLanguageID: 'abk', LanguageName: 'Abkhazian', ISO639: 'ab' },
  { SubLanguageID: 'afr', LanguageName: 'Afrikaans', ISO639: 'af' },
  { SubLanguageID: 'alb', LanguageName: 'Albanian', ISO639: 'sq' },
  { SubLanguageID: 'ara', LanguageName: 'Arabic', ISO639: 'ar' },
  { SubLanguageID: 'arg', LanguageName: 'Aragonese', ISO639: 'an' },
  { SubLanguageID: 'arm', LanguageName: 'Armenian', ISO639: 'hy' },
  { SubLanguageID: 'ast', LanguageName: 'Asturian', ISO639: 'at' },
  { SubLanguageID: 'aze', LanguageName: 'Azerbaijani', ISO639: 'az' },
  { SubLanguageID: 'baq', LanguageName: 'Basque', ISO639: 'eu' },
  { SubLanguageID: 'bel', LanguageName: 'Belarusian', ISO639: 'be' },
  { SubLanguageID: 'ben', LanguageName: 'Bengali', ISO639: 'bn' },
  { SubLanguageID: 'bos', LanguageName: 'Bosnian', ISO639: 'bs' },
  { SubLanguageID: 'bre', LanguageName: 'Breton', ISO639: 'br' },
  { SubLanguageID: 'bul', LanguageName: 'Bulgarian', ISO639: 'bg' },
  { SubLanguageID: 'bur', LanguageName: 'Burmese', ISO639: 'my' },
  { SubLanguageID: 'cat', LanguageName: 'Catalan', ISO639: 'ca' },
  { SubLanguageID: 'chi', LanguageName: 'Chinese (simplified)', ISO639: 'zh' },
  { SubLanguageID: 'zht', LanguageName: 'Chinese (traditional)', ISO639: 'zt' },
  { SubLanguageID: 'zhe', LanguageName: 'Chinese bilingual', ISO639: 'ze' },
  { SubLanguageID: 'hrv', LanguageName: 'Croatian', ISO639: 'hr' },
  { SubLanguageID: 'cze', LanguageName: 'Czech', ISO639: 'cs' },
  { SubLanguageID: 'dan', LanguageName: 'Danish', ISO639: 'da' },
  { SubLanguageID: 'dut', LanguageName: 'Dutch', ISO639: 'nl' },
  { SubLanguageID: 'eng', LanguageName: 'English', ISO639: 'en' },
  { SubLanguageID: 'epo', LanguageName: 'Esperanto', ISO639: 'eo' },
  { SubLanguageID: 'est', LanguageName: 'Estonian', ISO639: 'et' },
  { SubLanguageID: 'ext', LanguageName: 'Extremaduran', ISO639: 'ex' },
  { SubLanguageID: 'fin', LanguageName: 'Finnish', ISO639: 'fi' },
  { SubLanguageID: 'fre', LanguageName: 'French', ISO639: 'fr' },
  { SubLanguageID: 'gla', LanguageName: 'Gaelic', ISO639: 'gd' },
  { SubLanguageID: 'glg', LanguageName: 'Galician', ISO639: 'gl' },
  { SubLanguageID: 'geo', LanguageName: 'Georgian', ISO639: 'ka' },
  { SubLanguageID: 'ger', LanguageName: 'German', ISO639: 'de' },
  { SubLanguageID: 'ell', LanguageName: 'Greek', ISO639: 'el' },
  { SubLanguageID: 'heb', LanguageName: 'Hebrew', ISO639: 'he' },
  { SubLanguageID: 'hin', LanguageName: 'Hindi', ISO639: 'hi' },
  { SubLanguageID: 'hun', LanguageName: 'Hungarian', ISO639: 'hu' },
  { SubLanguageID: 'ice', LanguageName: 'Icelandic', ISO639: 'is' },
  { SubLanguageID: 'ibo', LanguageName: 'Igbo', ISO639: 'ig' },
  { SubLanguageID: 'ind', LanguageName: 'Indonesian', ISO639: 'id' },
  { SubLanguageID: 'ina', LanguageName: 'Interlingua', ISO639: 'ia' },
  { SubLanguageID: 'gle', LanguageName: 'Irish', ISO639: 'ga' },
  { SubLanguageID: 'ita', LanguageName: 'Italian', ISO639: 'it' },
  { SubLanguageID: 'jpn', LanguageName: 'Japanese', ISO639: 'ja' },
  { SubLanguageID: 'kan', LanguageName: 'Kannada', ISO639: 'kn' },
  { SubLanguageID: 'kaz', LanguageName: 'Kazakh', ISO639: 'kk' },
  { SubLanguageID: 'khm', LanguageName: 'Khmer', ISO639: 'km' },
  { SubLanguageID: 'kor', LanguageName: 'Korean', ISO639: 'ko' },
  { SubLanguageID: 'kur', LanguageName: 'Kurdish', ISO639: 'ku' },
  { SubLanguageID: 'lav', LanguageName: 'Latvian', ISO639: 'lv' },
  {
    SubLanguageID: 'lit',
    LanguageName: 'Lithuanian',
    ISO639: 'lt'
  },
  {
    SubLanguageID: 'ltz',
    LanguageName: 'Luxembourgish',
    ISO639: 'lb'
  },
  {
    SubLanguageID: 'mac',
    LanguageName: 'Macedonian',
    ISO639: 'mk'
  },
  { SubLanguageID: 'may', LanguageName: 'Malay', ISO639: 'ms' },
  { SubLanguageID: 'mal', LanguageName: 'Malayalam', ISO639: 'ml' },
  { SubLanguageID: 'mni', LanguageName: 'Manipuri', ISO639: 'ma' },
  { SubLanguageID: 'mon', LanguageName: 'Mongolian', ISO639: 'mn' },
  {
    SubLanguageID: 'mne',
    LanguageName: 'Montenegrin',
    ISO639: 'me'
  },
  { SubLanguageID: 'nav', LanguageName: 'Navajo', ISO639: 'nv' },
  {
    SubLanguageID: 'sme',
    LanguageName: 'Northern Sami',
    ISO639: 'se'
  },
  { SubLanguageID: 'nor', LanguageName: 'Norwegian', ISO639: 'no' },
  { SubLanguageID: 'oci', LanguageName: 'Occitan', ISO639: 'oc' },
  { SubLanguageID: 'per', LanguageName: 'Persian', ISO639: 'fa' },
  { SubLanguageID: 'pol', LanguageName: 'Polish', ISO639: 'pl' },
  {
    SubLanguageID: 'por',
    LanguageName: 'Portuguese',
    ISO639: 'pt'
  },
  {
    SubLanguageID: 'pob',
    LanguageName: 'Portuguese (BR)',
    ISO639: 'pb'
  },
  {
    SubLanguageID: 'pom',
    LanguageName: 'Portuguese (MZ)',
    ISO639: 'pm'
  },
  { SubLanguageID: 'rum', LanguageName: 'Romanian', ISO639: 'ro' },
  { SubLanguageID: 'rus', LanguageName: 'Russian', ISO639: 'ru' },
  { SubLanguageID: 'scc', LanguageName: 'Serbian', ISO639: 'sr' },
  { SubLanguageID: 'snd', LanguageName: 'Sindhi', ISO639: 'sd' },
  { SubLanguageID: 'sin', LanguageName: 'Sinhalese', ISO639: 'si' },
  { SubLanguageID: 'slo', LanguageName: 'Slovak', ISO639: 'sk' },
  { SubLanguageID: 'slv', LanguageName: 'Slovenian', ISO639: 'sl' },
  { SubLanguageID: 'som', LanguageName: 'Somali', ISO639: 'so' },
  { SubLanguageID: 'spa', LanguageName: 'Spanish', ISO639: 'es' },
  { SubLanguageID: 'swa', LanguageName: 'Swahili', ISO639: 'sw' },
  { SubLanguageID: 'swe', LanguageName: 'Swedish', ISO639: 'sv' },
  { SubLanguageID: 'syr', LanguageName: 'Syriac', ISO639: 'sy' },
  { SubLanguageID: 'tgl', LanguageName: 'Tagalog', ISO639: 'tl' },
  { SubLanguageID: 'tam', LanguageName: 'Tamil', ISO639: 'ta' },
  { SubLanguageID: 'tat', LanguageName: 'Tatar', ISO639: 'tt' },
  { SubLanguageID: 'tel', LanguageName: 'Telugu', ISO639: 'te' },
  { SubLanguageID: 'tha', LanguageName: 'Thai', ISO639: 'th' },
  { SubLanguageID: 'tur', LanguageName: 'Turkish', ISO639: 'tr' },
  { SubLanguageID: 'ukr', LanguageName: 'Ukrainian', ISO639: 'uk' },
  { SubLanguageID: 'urd', LanguageName: 'Urdu', ISO639: 'ur' },
  { SubLanguageID: 'vie', LanguageName: 'Vietnamese', ISO639: 'vi' }
]

/**
 * Find a Subtitles Language ID based on a 2 chars lang code
 *
 * @param lang a ISO639-1 2 chars language code
 * @returns a ISO639-2 3 chars language code
 */
export default function getSubLangID (lang: string): string {
  return (SUPPORTED_LANGS.find(x => x.ISO639 === lang) || {}).SubLanguageID
}
