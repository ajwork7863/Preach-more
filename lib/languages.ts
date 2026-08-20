export type Language = {
  code: string;
  englishName: string;
  nativeName: string;
  rtl: boolean;
};

// code|English name|native name|1 if right-to-left
const RAW = `ab|Abkhaz|аҧсуа бызшәа|0
af|Afrikaans|Afrikaans|0
am|Amharic|አማርኛ|0
ar|Arabic|العربية|1
as|Assamese|অসমীয়া|0
az|Azerbaijani|Azərbaycan dili|0
ba|Bashkir|башҡорт теле|0
be|Belarusian|беларуская мова|0
bg|Bulgarian|български език|0
bm|Bambara|bamanankan|0
bn|Bengali|বাংলা|0
bo|Tibetan|བོད་ཡིག|0
bs|Bosnian|bosanski jezik|0
ca|Catalan|català|0
ce|Chechen|нохчийн мотт|0
co|Corsican|corsu|0
cs|Czech|čeština|0
cy|Welsh|Cymraeg|0
da|Danish|dansk|0
de|German|Deutsch|0
dv|Divehi|ދިވެހި|1
dz|Dzongkha|རྫོང་ཁ|0
el|Greek|ελληνικά|0
en|English|English|0
eo|Esperanto|Esperanto|0
es|Spanish|Español|0
et|Estonian|eesti|0
eu|Basque|euskara|0
fa|Persian|فارسی|1
ff|Fulah|Fulfulde|0
fi|Finnish|suomi|0
fj|Fijian|vosa Vakaviti|0
fo|Faroese|føroyskt|0
fr|French|Français|0
fy|Western Frisian|Frysk|0
ga|Irish|Gaeilge|0
gd|Scottish Gaelic|Gàidhlig|0
gl|Galician|Galego|0
gu|Gujarati|ગુજરાતી|0
ha|Hausa|Hausa|0
he|Hebrew|עברית|1
hi|Hindi|हिन्दी|0
hr|Croatian|hrvatski jezik|0
ht|Haitian Creole|Kreyòl ayisyen|0
hu|Hungarian|magyar|0
hy|Armenian|Հայերեն|0
id|Indonesian|Bahasa Indonesia|0
ig|Igbo|Asụsụ Igbo|0
is|Icelandic|Íslenska|0
it|Italian|Italiano|0
ja|Japanese|日本語|0
jv|Javanese|basa Jawa|0
ka|Georgian|ქართული|0
kk|Kazakh|қазақ тілі|0
km|Khmer|ខ្មែរ|0
kn|Kannada|ಕನ್ನಡ|0
ko|Korean|한국어|0
ku|Kurdish|Kurdî|1
ky|Kyrgyz|Кыргызча|0
la|Latin|latine|0
lb|Luxembourgish|Lëtzebuergesch|0
lg|Ganda|Luganda|0
ln|Lingala|Lingála|0
lo|Lao|ພາສາລາວ|0
lt|Lithuanian|lietuvių kalba|0
lv|Latvian|latviešu valoda|0
mg|Malagasy|fiteny malagasy|0
mi|Maori|te reo Māori|0
mk|Macedonian|македонски јазик|0
ml|Malayalam|മലയാളം|0
mn|Mongolian|Монгол хэл|0
mr|Marathi|मराठी|0
ms|Malay|Bahasa Melayu|0
mt|Maltese|Malti|0
my|Burmese|ဗမာစာ|0
nb|Norwegian Bokmal|Norsk bokmål|0
ne|Nepali|नेपाली|0
nl|Dutch|Nederlands|0
nn|Norwegian Nynorsk|Norsk nynorsk|0
ny|Chichewa|chiCheŵa|0
om|Oromo|Afaan Oromoo|0
or|Odia|ଓଡ଼ିଆ|0
pa|Punjabi|ਪੰਜਾਬੀ|0
pl|Polish|Polski|0
ps|Pashto|پښتو|1
pt|Portuguese|Português|0
qu|Quechua|Runa Simi|0
rm|Romansh|Rumantsch|0
ro|Romanian|Română|0
ru|Russian|Русский|0
rw|Kinyarwanda|Ikinyarwanda|0
sd|Sindhi|سنڌي|1
si|Sinhala|සිංහල|0
sk|Slovak|slovenčina|0
sl|Slovenian|slovenski jezik|0
sm|Samoan|gagana faa Samoa|0
sn|Shona|chiShona|0
so|Somali|Soomaaliga|0
sq|Albanian|Shqip|0
sr|Serbian|српски језик|0
su|Sundanese|Basa Sunda|0
sv|Swedish|Svenska|0
sw|Swahili|Kiswahili|0
ta|Tamil|தமிழ்|0
te|Telugu|తెలుగు|0
tg|Tajik|тоҷикӣ|0
th|Thai|ไทย|0
ti|Tigrinya|ትግርኛ|0
tk|Turkmen|Türkmençe|0
tl|Tagalog|Wikang Tagalog|0
tr|Turkish|Türkçe|0
tt|Tatar|татар теле|0
ug|Uyghur|ئۇيغۇرچە|1
uk|Ukrainian|Українська|0
ur|Urdu|اردو|1
uz|Uzbek|Oʻzbek|0
vi|Vietnamese|Tiếng Việt|0
wo|Wolof|Wollof|0
xh|Xhosa|isiXhosa|0
yi|Yiddish|ייִדיש|1
yo|Yoruba|Yorùbá|0
zh|Chinese|中文|0
zu|Zulu|isiZulu|0`;

export const LANGUAGES: Language[] = RAW.split("\n").map((line) => {
  const [code, englishName, nativeName, rtl] = line.split("|");
  return { code, englishName, nativeName, rtl: rtl === "1" };
});

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));
const BY_ENGLISH_NAME = new Map(LANGUAGES.map((l) => [l.englishName.toLowerCase(), l]));

export function findLanguage(codeOrName: string): Language | undefined {
  const key = codeOrName.trim().toLowerCase();
  return BY_CODE.get(key) ?? BY_ENGLISH_NAME.get(key);
}

export function isRtl(codeOrName: string): boolean {
  return findLanguage(codeOrName)?.rtl ?? false;
}

export function displayName(codeOrName: string): string {
  const language = findLanguage(codeOrName);
  if (!language) {
    return codeOrName.charAt(0).toUpperCase() + codeOrName.slice(1);
  }
  return language.englishName === language.nativeName
    ? language.englishName
    : `${language.englishName} · ${language.nativeName}`;
}
