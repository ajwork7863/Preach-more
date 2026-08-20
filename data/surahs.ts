export type Revelation = "Meccan" | "Medinan";

export type Surah = {
  id: number;
  arabicName: string;
  transliteration: string;
  englishName: string;
  ayahCount: number;
  revelation: Revelation;
};

// id|arabic|transliteration|english meaning|ayah count|M(eccan) or D(inan)
const RAW = `1|الفاتحة|Al-Fatihah|The Opener|7|M
2|البقرة|Al-Baqarah|The Cow|286|D
3|آل عمران|Ali 'Imran|Family of Imran|200|D
4|النساء|An-Nisa|The Women|176|D
5|المائدة|Al-Ma'idah|The Table Spread|120|D
6|الأنعام|Al-An'am|The Cattle|165|M
7|الأعراف|Al-A'raf|The Heights|206|M
8|الأنفال|Al-Anfal|The Spoils of War|75|D
9|التوبة|At-Tawbah|The Repentance|129|D
10|يونس|Yunus|Jonah|109|M
11|هود|Hud|Hud|123|M
12|يوسف|Yusuf|Joseph|111|M
13|الرعد|Ar-Ra'd|The Thunder|43|D
14|إبراهيم|Ibrahim|Abraham|52|M
15|الحجر|Al-Hijr|The Rocky Tract|99|M
16|النحل|An-Nahl|The Bee|128|M
17|الإسراء|Al-Isra|The Night Journey|111|M
18|الكهف|Al-Kahf|The Cave|110|M
19|مريم|Maryam|Mary|98|M
20|طه|Taha|Ta-Ha|135|M
21|الأنبياء|Al-Anbya|The Prophets|112|M
22|الحج|Al-Hajj|The Pilgrimage|78|D
23|المؤمنون|Al-Mu'minun|The Believers|118|M
24|النور|An-Nur|The Light|64|D
25|الفرقان|Al-Furqan|The Criterion|77|M
26|الشعراء|Ash-Shu'ara|The Poets|227|M
27|النمل|An-Naml|The Ant|93|M
28|القصص|Al-Qasas|The Stories|88|M
29|العنكبوت|Al-'Ankabut|The Spider|69|M
30|الروم|Ar-Rum|The Romans|60|M
31|لقمان|Luqman|Luqman|34|M
32|السجدة|As-Sajdah|The Prostration|30|M
33|الأحزاب|Al-Ahzab|The Combined Forces|73|D
34|سبأ|Saba|Sheba|54|M
35|فاطر|Fatir|Originator|45|M
36|يس|Ya-Sin|Ya Sin|83|M
37|الصافات|As-Saffat|Those Who Set The Ranks|182|M
38|ص|Sad|The Letter Sad|88|M
39|الزمر|Az-Zumar|The Troops|75|M
40|غافر|Ghafir|The Forgiver|85|M
41|فصلت|Fussilat|Explained In Detail|54|M
42|الشورى|Ash-Shuraa|The Consultation|53|M
43|الزخرف|Az-Zukhruf|The Ornaments of Gold|89|M
44|الدخان|Ad-Dukhan|The Smoke|59|M
45|الجاثية|Al-Jathiyah|The Crouching|37|M
46|الأحقاف|Al-Ahqaf|The Wind-Curved Sandhills|35|M
47|محمد|Muhammad|Muhammad|38|D
48|الفتح|Al-Fath|The Victory|29|D
49|الحجرات|Al-Hujurat|The Rooms|18|D
50|ق|Qaf|The Letter Qaf|45|M
51|الذاريات|Adh-Dhariyat|The Winnowing Winds|60|M
52|الطور|At-Tur|The Mount|49|M
53|النجم|An-Najm|The Star|62|M
54|القمر|Al-Qamar|The Moon|55|M
55|الرحمن|Ar-Rahman|The Beneficent|78|D
56|الواقعة|Al-Waqi'ah|The Inevitable|96|M
57|الحديد|Al-Hadid|The Iron|29|D
58|المجادلة|Al-Mujadila|The Pleading Woman|22|D
59|الحشر|Al-Hashr|The Exile|24|D
60|الممتحنة|Al-Mumtahanah|She That Is To Be Examined|13|D
61|الصف|As-Saf|The Ranks|14|D
62|الجمعة|Al-Jumu'ah|The Congregation, Friday|11|D
63|المنافقون|Al-Munafiqun|The Hypocrites|11|D
64|التغابن|At-Taghabun|The Mutual Disillusion|18|D
65|الطلاق|At-Talaq|The Divorce|12|D
66|التحريم|At-Tahrim|The Prohibition|12|D
67|الملك|Al-Mulk|The Sovereignty|30|M
68|القلم|Al-Qalam|The Pen|52|M
69|الحاقة|Al-Haqqah|The Reality|52|M
70|المعارج|Al-Ma'arij|The Ascending Stairways|44|M
71|نوح|Nuh|Noah|28|M
72|الجن|Al-Jinn|The Jinn|28|M
73|المزمل|Al-Muzzammil|The Enshrouded One|20|M
74|المدثر|Al-Muddaththir|The Cloaked One|56|M
75|القيامة|Al-Qiyamah|The Resurrection|40|M
76|الإنسان|Al-Insan|The Man|31|D
77|المرسلات|Al-Mursalat|The Emissaries|50|M
78|النبأ|An-Naba|The Tidings|40|M
79|النازعات|An-Nazi'at|Those Who Drag Forth|46|M
80|عبس|'Abasa|He Frowned|42|M
81|التكوير|At-Takwir|The Overthrowing|29|M
82|الانفطار|Al-Infitar|The Cleaving|19|M
83|المطففين|Al-Mutaffifin|The Defrauding|36|M
84|الانشقاق|Al-Inshiqaq|The Sundering|25|M
85|البروج|Al-Buruj|The Mansions of the Stars|22|M
86|الطارق|At-Tariq|The Nightcomer|17|M
87|الأعلى|Al-A'la|The Most High|19|M
88|الغاشية|Al-Ghashiyah|The Overwhelming|26|M
89|الفجر|Al-Fajr|The Dawn|30|M
90|البلد|Al-Balad|The City|20|M
91|الشمس|Ash-Shams|The Sun|15|M
92|الليل|Al-Layl|The Night|21|M
93|الضحى|Ad-Duhaa|The Morning Hours|11|M
94|الشرح|Ash-Sharh|The Relief|8|M
95|التين|At-Tin|The Fig|8|M
96|العلق|Al-'Alaq|The Clot|19|M
97|القدر|Al-Qadr|The Power|5|M
98|البينة|Al-Bayyinah|The Clear Proof|8|D
99|الزلزلة|Az-Zalzalah|The Earthquake|8|D
100|العاديات|Al-'Adiyat|The Courser|11|M
101|القارعة|Al-Qari'ah|The Calamity|11|M
102|التكاثر|At-Takathur|The Rivalry in World Increase|8|M
103|العصر|Al-'Asr|The Declining Day|3|M
104|الهمزة|Al-Humazah|The Traducer|9|M
105|الفيل|Al-Fil|The Elephant|5|M
106|قريش|Quraysh|Quraysh|4|M
107|الماعون|Al-Ma'un|The Small Kindnesses|7|M
108|الكوثر|Al-Kawthar|The Abundance|3|M
109|الكافرون|Al-Kafirun|The Disbelievers|6|M
110|النصر|An-Nasr|The Divine Support|3|D
111|المسد|Al-Masad|The Palm Fibre|5|M
112|الإخلاص|Al-Ikhlas|The Sincerity|4|M
113|الفلق|Al-Falaq|The Daybreak|5|M
114|الناس|An-Nas|Mankind|6|M`;

export const SURAHS: Surah[] = RAW.split("\n").map((line) => {
  const [id, arabicName, transliteration, englishName, ayahCount, rev] = line.split("|");
  return {
    id: Number(id),
    arabicName,
    transliteration,
    englishName,
    ayahCount: Number(ayahCount),
    revelation: rev === "M" ? "Meccan" : "Medinan",
  };
});

export const TOTAL_AYAHS = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);

export function getSurah(id: number): Surah | undefined {
  return SURAHS.find((s) => s.id === id);
}
