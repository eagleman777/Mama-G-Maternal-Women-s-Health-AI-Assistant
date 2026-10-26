import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Shield,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  Send,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Sun,
  ShieldAlert,
  Flame,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { UI_TRANSLATIONS } from '../data/translations';
import { usePwa } from '../context/PwaContext';

interface GCornerProps {
  language: SupportedLanguage;
  onOpenEmergency?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  topic?: string;
  saved?: boolean;
  timestamp: string;
}

interface WisdomTopic {
  id: string;
  title: string;
  shortDesc: string;
  iconName: string;
  starterPrompt: string;
  offlineWisdom: Record<SupportedLanguage, string>;
}

// Pre-seeded comprehensive Elder Mama wisdom for 100% offline free operation
const WISDOM_TOPICS: WisdomTopic[] = [
  {
    id: 'suitors_boundaries',
    title: 'Protecting My Heart & Suitors',
    shortDesc: 'Discerning sincere intentions, avoiding deceit, and keeping self-respect',
    iconName: 'heart',
    starterPrompt: 'Mama, how do I know if a man truly loves me or is just sweet-talking me? How do I set boundaries in a Godly way without feeling guilty?',
    offlineWisdom: {
      English: `🌺 **My precious daughter, listen to your Old Mama:**

Sit close, my child. The tongue of a man who wants something quickly is often sweeter than honeycomb, but a woman built on God's wisdom watches *actions*, not just sweet words. 

🕊️ **Old Mama's Godly Wisdom:**
The Scripture reminds us: *"Guard your heart above all else, for it determines the course of your life."* (Proverbs 4:23). A man who truly honors God will honor your boundaries. If a suitor pressures you to compromise your dignity, your body, or your peace to "prove your love," understand this immediately: **love does not demand that you destroy yourself to satisfy another person.** True love is patient, kind, and respects holy boundaries.

🛡️ **Practical Steps to Stay Safe & Wise:**
1. **Never meet in secluded, dark, or private places early on.** Always meet in open daylight, public spaces, or among family and trusted friends.
2. **Watch how he treats people who have nothing to give him.** Does he shout at vendors, insult his elders, or mock others? How he treats them is how he will treat you when the romance cools down.
3. **Practice a calm, firm "No".** Say: *"I value myself, and I do not rush into physical intimacy or secrecy. If you respect me, you will respect my pace."* A good man will admire your backbone; a predator will get angry and walk away—let him walk!
4. **Never accept expensive gifts that come with unspoken strings attached.** Keep your hands clean and your independence intact.

🙏 **Old Mama's Blessing:**
May the Lord grant you spiritual eyes to see what is hidden. You are a jewel of inestimable value, formed with purpose. Never bend your crown for temporary affection. Peace be with you, my daughter.`,
      'Nigerian Pidgin': `🌺 **My sweet pikin, come sit down near your Old Mama:**

Make I tell you true talk from my heart. Man wey sweet mouth too much, shine your eye! Sugar sweet, but too much sugar dey cause rotten teeth.

🕊️ **Old Mama's Godly Wisdom:**
Bible tok say: *"Guide your heart well well, because na from your heart your whole life dey flow."* A man wey fear God go respect you. Any man wey tell you say make you do wetin your mind no agree to, or make you give am your body make you take prove love—dat one no be love o! Na trick! True love dey wait, true love dey protect your dignity.

🛡️ **Wise Steps to Stay Safe:**
1. **No follow any man enter quiet dark room or hotel room alone.** Make una meet where people dey, for day time.
2. **Look how he dey talk to people wey poor pass am.** If he dey insult hawkers or disrespect his mama, na so he go treat you tomorrow.
3. **Learn how to talk "No" with your chest:** *"I value myself. I no dey rush, and I no dey compromise my dignity."* If he vex leave, thank God say trouble don escape!
4. **No collect gift wey go turn you to prisoner.** Stay upright.

🙏 **Old Mama's Prayer:**
God go open your eye make you see bad company from far. You be precious gold, no let anybody treat you like sand-sand!`,
      Swahili: `🌺 **Binti yangu mpendwa, njoo uketi karibu na Bibi yako:**

Sikiliza maneno ya hekima kutoka kwa mtu aliyeishi na kuona mengi. Ulimi wa mwanaume anayetaka tamaa ya haraka huwa mtamu kama asali, lakini mwanamke mwenye hekima ya Mungu huangalia matendo, si maneno matupu.

🕊️ **Hekima ya Mungu na Bibi:**
Maandiko yanasema: *"Linda moyo wako kuliko yote uyalindayo; maana ndiko zitokako chemchemi za uzima."* (Mithali 4:23). Mwanaume anayemcha Mungu ataheshimu mipaka yako. Ikiwa mwanamume anakulazimisha uvunje heshima yako ili kuthibitisha upendo, jua wazi: huo si upendo, ni ubinafsi.

🛡️ **Hatua za Kiutendaji za Kuwa Salama:**
1. **Kamwe usikutane naye sehemu za faragha au gizani.** Kutana naye mchana, sehemu za wazi penye watu au mbele ya jamaa.
2. **Tazama jinsi anavyowatendea watu wasio na uwezo.** Heshima yake kwa wengine inaakisi jinsi atakavyokutendea baadaye.
3. **Tamka "Hapana" kwa utulivu na msimamo:** *"Najithamini, na ninajiheshimu. Ikiwa unaniheshimu, utavumilia."* Mwanaume bora atakuheshimu zaidi.
4. **Usikubali zawadi zinazokufanya mtumwa wa maamuzi mabaya.**

🙏 **Baraka ya Bibi:**
Mwenyezi Mungu akujalie macho ya rohoni na hekima ya utambuzi. Wewe ni kito cha thamani isiyo na kifani.`,
      French: `🌺 **Ma fille bien-aimée, assieds-toi près de ta Grand-Mère :**

Écoute la voix de celle qui a traversé bien des tempêtes. Les paroles d'un homme pressé sont souvent douces comme le miel, mais la femme prudente observe ses actes et sa crainte de Dieu.

🕊️ **La Sagesse Divine de Grand-Mère :**
Il est écrit : *"Garde ton cœur plus que toute autre chose, car de lui jaillissent les sources de la vie."* (Proverbes 4:23). Un homme qui honore Dieu honorera ta dignité et tes limites. Si un prétendant exige que tu sacrifies ta pureté ou tes principes pour « prouver ton amour », sache qu'il ne s'agit pas d'amour, mais de convoitise égoïste.

🛡️ **Conseils Pratiques de Sécurité :**
1. **Ne le rencontre jamais dans des endroits isolés ou sombres.** Privilégie les lieux publics et en plein jour.
2. **Observe comment il traite les personnes vulnérables.** Sa façon de parler aux plus modestes révèle son véritable caractère.
3. **Dis « Non » avec calme et fermeté :** *"Je respecte ma personne et mes valeurs. Si tu m'estimes vraiment, tu respecteras mon rythme."*
4. **N'accepte pas de cadeaux qui t'enchaînent ou te rendent redevable.**

🙏 **Bénédiction de Grand-Mère :**
Que le Seigneur garde tes pas et illumine ton discernement. Tu as une valeur inestimable aux yeux du Créateur.`,
      Hausa: `🌺 **'Yata mai daraja, zo ki zauna kusa da Kakar ki:**

Saurari kalaman tsohuwar uwa mai son ganin kinyi rayuwa mai kyau. Harshen namiji mai neman wata bukata yana iya zama kamar zuma, amma mace mai tsoron Allah tana duba dabi'a da aiki ne, ba kawai dadin baki ba.

🕊️ **Hikimar Allah da Tsohuwar Uwa:**
Kare zuciyarki da mutuncinki shine babban ginshiki na rayuwa. Namiji mai gaskiya da tsoron Allah zai mutunta iyakarki. Idan wani yana matsa miki don ki aikata abin da zai zubar da mutuncinki ko ya bata addininki, ki sani wannan ba so na gaskiya bane.

🛡️ **Matakan Tsaro da Hikima:**
1. **Kada ki taba kebe kanki a wuri mai duhu ko daki tare da namiji da ba mijinki ba.** Ku hadu a wurin da mutane suke kuma a cikin hasken rana.
2. **Duba yadda yake magana da talakawa da iyayensa.** Idan bashi da ladabi, haka zai wulakanta ki nan gaba.
3. **Koyi cewa "A'a" da karfin gwiwa:** *"Ina daraja kaina, kuma ba zan zubar da mutuncina ba."*
4. **Kada ki yarda da karbar kyaututtukan da zasu sa a takura miki.**

🙏 **Addu'ar Tsohuwa:**
Allah Ya kare miki mutuncinki, Ya baki basira da kyakkyawan zabi. Ke mai daraja ce!`,
      Yoruba: `🌺 **Ọmọ mi owon, wa joko ti Iya Agba rẹ:**

Gbọ ọrọ ọgbọn lati ọdọ ẹni to ti rin irin-ajo aye yii to jinna. Ahọn ọkunrin to n wa nkan ti o yara le dun bi oyin, ṣugbọn obinrin to ni ọgbọn Ọlọrun a ma wo iṣe ati iwa, kii ṣe ọrọ ẹnu lasan.

🕊️ **Ọgbọn Ọlọrun ati Iya Agba:**
Ọrọ Ọlọrun sọ pe: *"Pẹlu gbogbo itara, pa ọkan rẹ mọ́, nitori lati inu rẹ ni orisun iye ti n jade."* Ọkunrin to bẹru Ọlọrun yoo bọwọ fun iwa rere ati aala rẹ. Ti ọkunrin ba n fi ipá mu ọ lati ṣe ohun to lodi si iwa rere ati ọla rẹ, mọ daju pe kii ṣe ifẹ tootọ niyẹn.

🛡️ **Igbese Aabo ati Ọgbọn:**
1. **Maṣe ba ọkunrin lọ si ibi kọlọfin tabi okunkun nikan.** Pade ni oju ọjọ ati ni ibi ti eniyan pọ si.
2. **Wo bi o ṣe n ṣe si awọn to kere si i.** Bi o ṣe n ba awọn alailagbara sọrọ ni yoo ba ọ sọrọ nigbati ifẹ ba tutu.
3. **Kọ ẹkọ lati sọ "Rara" pẹlu iduroṣinṣin:** *"Mo bu ọla fun ara mi ati ẹlẹda mi. Ti o ba nifẹ mi tootọ, iwọ yoo bọwọ fun aala mi."*
4. **Maṣe gba ẹbùn to maa so ọ lẹru tabi mu ọ ṣe ohun ti ko tọ́.**

🙏 **Adura Iya Agba:**
Ki Ọlọrun fun ọ ni oju ẹmi lati mọ rere yato si ibi. Wura iyebiye ni ọ, maṣe jẹ ki ẹnikẹni fẹlẹ rẹ!`,
    },
  },
  {
    id: 'family_conflict',
    title: 'Family Friction & Difficult Relatives',
    shortDesc: 'Honoring family, resolving tensions peacefully, and keeping healthy boundaries',
    iconName: 'home',
    starterPrompt: 'Mama, how do I deal with heavy conflict or unfair criticism from my parents or in-laws without disrespecting them?',
    offlineWisdom: {
      English: `🌺 **My daughter, let your Old Mama hold your hand:**

Family matters can pierce deeper than any thorn, because we love them so much. When tongues are sharp in the house, a wise daughter does not add dry firewood to a burning flame.

🕊️ **Old Mama's Godly Wisdom:**
The proverb says: *"A soft answer turns away wrath, but grievous words stir up anger."* (Proverbs 15:1). Honoring your parents and elders does not mean becoming a doormat for verbal cruelty, but it means holding your tongue until anger has cooled down. Honor is in the *manner* of your response, while God gives you the wisdom to guard your inner peace.

🛡️ **Practical Steps to Navigate Family Friction:**
1. **Master the pause.** When an elder speaks harsh words to you, take three deep breaths before answering. Do not speak in the heat of the moment. Say gently: *"Mama/Papa, I have heard you. Let me pray about it and think through what you have said."*
2. **Separate their anger from your worth.** Often, parents or in-laws project their own poverty, fear, or frustration onto the young. Do not absorb their bitterness into your spirit.
3. **Seek a respected neutral mediator.** If there is a deep misunderstanding, do not fight it alone. Approach an aunt, grandmother, or church mother whom they respect to help speak on your behalf with gentle diplomacy.
4. **Keep your private matters discreet.** Do not air your family's grievances on social media or in the neighborhood market. A wise woman builds her house with quiet discretion.

🙏 **Old Mama's Blessing:**
May God make you a peacemaker in your household, and may your patience turn stones into stepping stones of honor.`,
      'Nigerian Pidgin': `🌺 **My daughter, come make I comfort you:**

Family wahala dey pain person pass, because na people close to you. When fire dey burn for house, na water you go throw, no be petrol.

🕊️ **Old Mama's Godly Wisdom:**
Soft talk dey cool down hot temper. To respect your parents no mean say make you carry heavy pain die for silence, but no exchange words when everybody eyes red.

🛡️ **Wise Steps:**
1. **Calm down before you answer.** If dem dey shout, just say: *"Mama/Papa, I hear wetin you tok. Make I think about am."*
2. **No fight them for public or put family matter for Facebook/WhatsApp status.** Keep your home matters quiet.
3. **If the matter too big, call one elder brother or respected aunty wey get sense make dem help balance the talk.**

🙏 **Old Mama's Prayer:**
Peace wey pass understanding go fill your mind, my pikin!`,
      Swahili: `🌺 **Binti yangu, keti hapa tukumbushane:**

Migogoro ya kifamilia inaumiza sana kwa sababu inatoka kwa watu wa damu yako. Moto unapowaka nyumbani, mwanamke mwenye hekima hutumia maji, si petroli.

🕊️ **Hekima ya Bibi:**
Jibu la upole hufukuza ghadhabu. Kumheshimu mzazi hakumaanishi kuvumilia uonevu unaoharibu afya yako ya akili, bali ni kuchagua busara badala ya malumbano ya hasira.

🛡️ **Hatua za Amani:**
1. **Vuta subira kabla ya kujibu.** Usiongee ukiwa na hasira. Sema kwa upole: *"Mama/Baba, nimesikia, nitalitafakari."*
2. **Weka siri za familia faragha.** Usisambaze machungu yako mitandaoni.
3. **Tafuta mpatanishi anayeheshimika** kama shangazi au mama wa kanisa ili kusaidia mazungumzo.

🙏 **Baraka ya Bibi:**
Mungu akufanye kuwa chimbuko la amani na maelewano nyumbani kwenu.`,
      French: `🌺 **Ma fille, laisse ta Grand-Mère apaiser ton cœur :**

Les querelles familiales blessent plus profondément que tout, car elles touchent ceux qu'on aime. Lorsqu'un feu s'allume au foyer, la femme sage y verse de l'eau, non de l'huile.

🕊️ **La Sagesse Divine :**
Une réponse douce calme la fureur. Honorer ses aînés ne signifie pas subir l'injustice dans le désespoir, mais savoir réagir avec maîtrise et dignité sans tomber dans l'irrespect.

🛡️ **Actions Pratiques :**
1. **Pratique le silence apaisant.** Ne réponds jamais sous le coup de la colère.
2. **Ne lave pas le linge sale en public.** Préserve la dignité de ton foyer sans exposer tes peines sur les réseaux.
3. **Fais appel à un médiateur sage et respecté** (une tante de confiance ou une aînée) pour désamorcer les tensions.

🙏 **Bénédiction de Grand-Mère :**
Que la paix du Tout-Puissant garde ton cœur et transforme les épreuves en témoignages d'honneur.`,
      Hausa: `🌺 **'Yata, zo in baki shawara mai amfani:**

Fadan gida yana da ciwo saboda na mutanen da kake so ne. Lokacin da wuta ta tashi a daki, ruwa ake zubawa ba fetur ba.

🕊️ **Hikimar Tsohuwa:**
Magana mai taushi tana sanyaya zuciya mai zafi. Yi ladabi ga iyaye baya nufin zama cikin bakin ciki ba, amma kada kiyi musu musu a lokacin da ransu ya baci.

🛡️ **Matakan Zaman Lafiya:**
1. **Yi shiru a lokacin fushi.** Idan an gama magana, kice: *"Baba/Mama na ji, zan kiyaye in sha Allah."*
2. **Kada ki kwashe maganar gida kikai kasuwa ko shafukan sada zumunta.**
3. **Idan matsalar ta yi yawa, ki nemi wata babbar dangi mai hikima ta shiga tsakani cikin lumana.**

🙏 **Addu'ar Tsohuwa:**
Allah Ya sa miki albarka da zaman lafiya a gidanku!`,
      Yoruba: `🌺 **Ọmọ mi, gbọ ọrọ imọran lati ọdọ Iya Agba:**

Ija idile maa n dunni nitori awọn ti a fẹran ni. Nigbati ina ba n jo, omi la n bu si, a kii da epo si ina.

🕊️ **Ọgbọn Ọlọrun:**
Ọrọ pẹlẹ n pa ibinu rọ. Lati bu ọla fun awọn obi ko tumọ si pe ki o gba itiju ti o le pa ẹmi rẹ lara, ṣugbọn a kii fọ ọrọ buruku pada si awọn agba nigbati oju ba pon.

🛡️ **Igbese Ọgbọn:**
1. **Dake nigbati ibinu ba gbona.** Sọ pẹlu irẹlẹ pe: *"Mama/Baba, mo gbọ ohun ti ẹ sọ, ma ronu lori rẹ."*
2. **Maṣe gbe ọrọ idile lọ si ori ero ayelujara (social media).**
3. **Wa agba kan to ni oye ninu idile to le ba yin pari ọrọ naa pẹlu alaafia.**

🙏 **Adura Iya Agba:**
Alaafia Ọlọrun ti o kọja gbogbo oye yoo ba ọ gbe ninu idile rẹ!`,
    },
  },
  {
    id: 'safety_outside',
    title: 'Staying Safe Outside & Peer Pressure',
    shortDesc: 'Discerning bad influence, avoiding dangerous traps, and standing strong',
    iconName: 'shield',
    starterPrompt: 'Mama, my friends are pushing me into places and parties I feel uncomfortable with, and I feel left out. How do I stay safe without losing my friends?',
    offlineWisdom: {
      English: `🌺 **My bold daughter, listen to your Old Mama:**

A bird that flies with crows will eat what crows eat and get shot with the same arrow. God has given you an internal voice—the Holy Spirit and maternal intuition. If your stomach turns cold about an invitation, that is your safety alarm ringing!

🕊️ **Old Mama's Godly Wisdom:**
*"Do not be misled: Bad company corrupts good character."* (1 Corinthians 15:33). True friends lift your eyes upward toward light, safety, and growth. Friends who laugh at your modesty, push you to drink unknown liquids, or pressure you to meet strangers in private places are NOT friends; they are recruiters for danger.

🛡️ **Practical Street-Smart Safety Steps:**
1. **Have your "Guardian Exit" ready.** Before going anywhere, always tell a sister, mother, or trusted guardian where you are and whom you are with. Agree on a code word (e.g., *"Did you put the pot on the fire?"*) that means: *Come pick me up or call me with an emergency excuse right now!*
2. **Never leave your drink or food unattended.** If you stepped away, do not take another sip. Spiking is real and dangerous.
3. **Stand your ground with grace:** Say: *"You guys enjoy yourselves, but that environment is not for me. I love you, but I have my boundaries."* If they abandon you because you refuse to enter dangerous rooms, celebrate—God just swept your yard clean!
4. **Trust your instinct over popularity.** Popularity lasts for a season; your safety, peace of mind, and life last a lifetime.

🙏 **Old Mama's Blessing:**
May the Almighty surround you as a wall of fire. You will never be a victim of deceit or evil schemes. Walk tall and walk safe, my child!`,
      'Nigerian Pidgin': `🌺 **My sharp daughter, open ear hear Old Mama:**

Any bird wey fly with hawk, na hunter gun go catch both of dem. That mind wey dey cut you say *"dis place no pure"*, na God dey ring safety bell for your head!

🕊️ **Old Mama's Godly Wisdom:**
Bible tok say bad company dey destroy good character. Correct friend go protect your name, no be the one wey go push you enter club or party wey you no know who dey there.

🛡️ **Sharp Safety Rules:**
1. **Get code word with your sister or mama.** If trouble dey smell, send message like *"Mama abeg call me say you need me for house sharp sharp!"*
2. **No drink any drink wey you leave for table go pee.** If you comot your eye, forget the drink.
3. **No fear to stand alone.** Tell dem: *"Una enjoy o, but dis one no be my style."* If dem vex, bye bye to bad company!

🙏 **Old Mama's Prayer:**
God go hide you under His wings, no evil eye go see you!`,
      Swahili: `🌺 **Binti yangu shujaa, sikiliza maneno haya ya ulinzi:**

Mwenyezi Mungu amekupa sauti ya ndani inayokuonya pale palipo na hatari. Rafiki wa kweli hatakusukuma kwenye sehemu zitakazokuvunjia heshima au kuweka maisha yako rehani.

🕊️ **Hekima ya Bibi:**
*"Marafiki wabaya huharibu tabia njema."* Rafiki wanaokulazimisha kunywa vileo, kwenda maeneo ya siri au kukutana na watu wasiojulikana si marafiki wa dhati.

🛡️ **Mbinu za Kujilinda:**
1. **Kuwa na mpango wa kujiokoa daima.** Mjulishe mtu wa kuaminika mahali unapoenda.
2. **Usiache kinywaji chako bila uangalizi.** Usinywe tena ikiwa uliondoka.
3. **Kuwa na ujasiri wa kusimama peke yako.** Si lazima ufuate mkumbo wa watu wengi.

🙏 **Baraka ya Bibi:**
Mungu akulinde na mitego yote ya gizani. Tembea kwa heshima na usalama!`,
      French: `🌺 **Ma fille courageuse, prête l'oreille à ta Grand-Mère :**

L'oiseau qui vole avec les corbeaux finit par partager leur sort. Si ton intuition te dit qu'un endroit n'est pas sûr, c'est l'avertissement de Dieu pour te préserver.

🕊️ **La Sagesse Divine :**
Les mauvaises compagnies corrompent les bonnes mœurs. Les véritables amies veillent sur ta sécurité, elles ne te poussent pas vers le danger ou les compromissions.

🛡️ **Mesures Pratiques de Sécurité :**
1. **Aie toujours une issue de secours.** Préviens un proche de confiance de tes déplacements.
2. **Ne laisse jamais ton verre sans surveillance.**
3. **Apprends à dire non sans honte.** Mieux vaut être seule et en sécurité que mal accompagnée et en péril.

🙏 **Bénédiction de Grand-Mère :**
Que la main divine te protège de tout piège et guide tes pas dans la paix et la lumière.`,
      Hausa: `🌺 **'Yata mai hankali, saurari kalaman kariya:**

Idan zuciyarki tana baki tsoron wani wuri ko taro, wannan gargadi ne daga Allah don kare ki.

🕊️ **Hikimar Tsohuwa:**
Abokai na gari sune masu baki kariya da son ganin mutuncinki ya tsaya. Wadanda ke tursasa ki shiga abubuwan cutarwa ba masoya bane.

🛡️ **Matakan Kariya:**
1. **Koyaushe ki sanar da wani na gida inda zaki.**
2. **Kada ki sha abin da aka bude babu ke.**
3. **Kada kiji tsoron zama daban.** Mutuncinki ya fi tarayya da mutanen banza.

🙏 **Addu'ar Tsohuwa:**
Allah Ya kare ki daga dukkan sharrin masu sharri, Ya lullube ki da tsari!`,
      Yoruba: `🌺 **Ọmọ mi to niye ninu, gbọ ọrọ aabo yii:**

Ẹyẹ to ba ba igun jẹun, ibi ti igun n ba lọ ni yoo ba lọ. Ti ọkan rẹ ba sọ pe ibi kan ko ba ọ lara mu, ohun Ọlọrun ni to n kìlọ̀ fun ọ!

🕊️ **Ọgbọn Ọlọrun:**
Ẹgbẹ buburu n ba iwa rere jẹ. Awọn ọrẹ tootọ a ma gbe ọ ga, wọn kii ti ọ sinu koto tabi ewu.

🛡️ **Igbese Aabo:**
1. **Kiyesi ibi ti o n lọ ki o si sọ fun ẹnikan ti o gbẹkẹle ni ile.**
2. **Maṣe fi ohun mimu rẹ silẹ nibi ti a ko ti le ri i.**
3. **Duro ṣinṣin lori ipinnu rẹ, maṣe bẹru lati sọ pe "Rara".**

🙏 **Adura Iya Agba:**
Aabo Ọlọrun yoo bo ọ mọlẹ, o kii yoo subu sinu pakute ọta!`,
    },
  },
  {
    id: 'self_worth_god',
    title: 'Knowing My True Value in God',
    shortDesc: 'Overcoming comparison, body shame, and finding unshakable confidence',
    iconName: 'sparkles',
    starterPrompt: 'Mama, I often look at social media or other women and feel ugly, poor, or unloved. How do I build real self-worth that nobody can take away?',
    offlineWisdom: {
      English: `🌺 **Come here, my beautiful daughter. Look into your Old Mama's eyes:**

Wipe those tears, child. You are looking into the broken mirrors of this world and wondering why your reflection looks shattered. The world's mirror is designed to make you feel empty so it can sell you things you do not need and make you beg for love you already possess!

🕊️ **Old Mama's Godly Wisdom:**
Hear what your Maker says about you: *"I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well."* (Psalm 139:14). You are not an accident, a second thought, or a leftover. The breath of the Almighty is inside you. When you know who your Father is, you stop begging people for crumbs of validation.

🛡️ **Daily Truths to Build Holy Confidence:**
1. **Detox from comparison.** What people post online is their staged highlight reel, heavily filtered and edited. Never compare your real backstage life with someone else's fake stage performance.
2. **Crown your mornings with thanksgiving.** Every morning before looking at your phone, look up and say: *"Thank you, Lord, for life, breath, and for creating me with purpose today."*
3. **Invest in inner character and practical skills.** A pretty face without discretion is like a gold ring in a pig's snout. Learn, work with your hands, speak with grace, and cultivate kindness. That beauty never wrinkles!
4. **Walk with your head up.** God did not create you to look down at the dirt. Walk with the quiet dignity of a daughter of the King.

🙏 **Old Mama's Blessing:**
May the peace of God wash away all feelings of rejection. You are chosen, honored, and deeply loved. Amen!`,
      'Nigerian Pidgin': `🌺 **Come wipe your tears, my fine pikin:**

Look at your Old Mama face. Wetin you dey look for phone wey dey make your heart heavy? Person wey look mirror wey break, him face go look broken!

🕊️ **Old Mama's Godly Wisdom:**
God make you with special handwork! Psalm 139 say: *You fearfully and wonderfully made!* No be mistake you be! The world dey show fake life for Instagram, no go use another person filter judge your own original life.

🛡️ **How to Build Strong Mind:**
1. **Reduce social media waka.** Half of wetin you dey see na loan and fake lifestyle.
2. **Focus on your handwork and your brain.** Fine face go age, but good character and handwork go feed you forever.
3. **Walk like King pikin.** You no need beg any man make he tell you say you fine before you know say you fine.

🙏 **Old Mama's Prayer:**
God go lift your head up high. You go shine for where people think say you no fit reach!`,
      Swahili: `🌺 **Njoo hapa binti yangu mzuri, futa machozi:**

Usiangalie thamani yako kupitia macho ya watu au mitandao ya kijamii. Maisha unayoona mtandaoni mara nyingi ni maigizo yenye vichujio (filters).

🕊️ **Hekima ya Mungu:**
Biblia inasema umeumbwa kwa namna ya ajabu na ya kutisha (Zaburi 139:14). Wewe ni wa thamani mbele za Muumba wako, si kwa sababu ya nguo unazovaa, bali kwa sababu ya jinsi ulivyo.

🛡️ **Hatua za Kujiamini:**
1. **Acha kulinganisha maisha yako na ya wengine.** Kila mtu ana majira yake.
2. **Jenga heshima, tabia njema na ujuzi wa kazi.** Urembo wa tabia haudumu kamwe.
3. **Tembea kwa ujasiri ukijua wewe ni binti wa Mfalme.**

🙏 **Baraka ya Bibi:**
Mungu akujalie amani ya moyo na heshima isiyotikisika!`,
      French: `🌺 **Viens essuyer tes larmes, ma fille chérie :**

Ne mesure jamais ta valeur à travers le regard éphémère du monde ou les illusions des réseaux sociaux. Tu es une création unique de Dieu.

🕊️ **La Sagesse Divine :**
Le Psaume 139 déclare que tu es une créature si merveilleuse ! Tu n'es pas le fruit du hasard. Ta dignité vient de ton Créateur, non des compliments d'autrui.

🛡️ **Pour Bâtir ta Confiance :**
1. **Cesse les comparaisons inutiles.** Chacun a son parcours et ses combats cachés.
2. **Cultive la sagesse, le travail et la bonté de cœur.**
3. **Marche la tête haute avec l'assurance d'une fille bénie.**

🙏 **Bénédiction de Grand-Mère :**
Que la grâce et l'amour divin inondent ton être tout entier. Tu es précieuse !`,
      Hausa: `🌺 **'Yata mai kyau, share hawayenki:**

Kada ki auna darajarki da abin da kike gani a waya ko shafukan intanet. Rayuwar mutane a can da yawa na karya ce.

🕊️ **Hikimar Tsohuwa:**
Allah Ya halicce ki da kyakkyawan tsari da manufa. Mutuncinki yana cikin tsoron Allah da kyakkyawar dabi'a.

🛡️ **Hanyoyin Samun Karfin Zuciya:**
1. **Kada ki kwatanta kanki da kowa.** Kowa da ronsa da lokacinsa.
2. **Koyi sana'a da aiki da kyawawan halaye.**
3. **Daga kanki sama cikin nutsuwa da girmamawa.**

🙏 **Addu'ar Tsohuwa:**
Allah Ya albarkaci rayuwarki, Ya baki natsuwa da daraja a idon mutane da na Mahalicci!`,
      Yoruba: `🌺 **Wa gba itunu, ọmọ mi to lẹwa:**

Nu omije rẹ nu. Maṣe wo ara rẹ ninu digi aye ti o ti fọ. Ohun ti o n ri lori ero ayelujara pupọ jẹ afihan asan ati adanu.

🕊️ **Ọgbọn Ọlọrun:**
Orin Dafidi 139 sọ pe: A da ọ ni ọna iyanu ati ibẹru! Ọlọrun ni o da ọ, o si mọ gbogbo ohun ti o dara fun ọ.

🛡️ **Bii o ṣe le ni Ifọkanbalẹ:**
1. **Dẹkun ifiwera ara rẹ pẹlu awọn ẹlomiran.**
2. **Kọ ẹkọ, ni iwa rere ati iṣẹ ọwọ.**
3. **Rin pẹlu ọla ati iyi gẹgẹbi ọmọ Ọba nla.**

🙏 **Adura Iya Agba:**
Ibukun ati oore-ọfẹ Ọlọrun yoo ma ba ọ gbe titi lailai!`,
    },
  },
];

export const GCorner: React.FC<GCornerProps> = ({ language, onOpenEmergency }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [journalSavedIds, setJournalSavedIds] = useState<string[]>([]);
  const [activeTabMode, setActiveTabMode] = useState<'chat' | 'journal'>('chat');

  const { isOffline } = usePwa();
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  // Load saved journal entries from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mama_g_corner_journal');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setJournalSavedIds(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read journal entries', e);
    }
  }, []);

  // Initialize with elder mama greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialGreeting: Message = {
        id: 'welcome_greeting',
        role: 'assistant',
        content: getInitialGreeting(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initialGreeting]);
    }
  }, [language]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  function getInitialGreeting(lang: SupportedLanguage): string {
    switch (lang) {
      case 'Nigerian Pidgin':
        return `🌺 **Welcome to G-Corner, my sweet daughter! Na your Old Mama dey wait for you.**\n\nPull up your chair or sit near me for mat. For here, nobody dey judge you, and you no need fear. Tell me wetin dey worry your heart—whether na about family wahala, man wey dey trouble your peace, peer pressure from outside, or how to walk with God and stay safe.\n\nWetin dey your mind today, my pikin?`;
      case 'Swahili':
        return `🌺 **Karibu sana kwenye G-Corner, binti yangu mpendwa! Hapa ni kwa Bibi yako mzee.**\n\nKeti hapa karibu nami. Mahali hapa pana amani, hakuna hukumu wala lawama. Niambie chochote kinacholemewa moyo wako—iwe ni masuala ya familia, mahusiano ya uchumba, mikumbo ya mtaani, au jinsi ya kutembea kwa hekima na usalama.\n\nJe, ni lipi linalokusumbua leo, mwanangu?`;
      case 'French':
        return `🌺 **Bienvenue au G-Corner, ma chère fille ! C'est ta Grand-Mère qui t'accueille avec amour.**\n\nPrends un siège près de moi. Ici, il n'y a aucun jugement, seulement de l'écoute, de la prière et de la sagesse protectrice. Parle-moi de ce qui pèse sur ton cœur : ta famille, tes fréquentations, les pressions extérieures ou ton avenir.\n\nQu'y a-t-il sur ton cœur aujourd'hui, mon enfant ?`;
      case 'Hausa':
        return `🌺 **Barka da zuwa G-Corner, 'yata mai daraja! Tsohuwar Kakar ki na nan tana sauraren ki da kauna.**\n\nZo ki zauna kusa dani. Anan babu zargi ko tsangwama. Fada min abin da ke damun zuciyarki—matsalar gida, batun neman aure, abokan banza, ko yadda zaki kare mutuncinki cikin tsoron Allah.\n\nMenene ke damun ki a yau, 'yata?`;
      case 'Yoruba':
        return `🌺 **Kaabo si G-Corner, ọmọ mi owon! Iya Agba rẹ wa nibi lati gba ọ mọra pẹlu ifẹ Ọlọrun.**\n\nWa joko ti mi lori ẹni. Nibi yii, ko si idajọ tabi ẹ̀gàn. Sọ ohun to n ba ọkan rẹ jẹ fun mi—ija idile, awọn ọkunrin to n da ọ lẹkun, ẹgbẹ buburu, tabi bi o ṣe le rin pẹlu ọgbọn ati aabo.\n\nKini o wa ninu ọkan rẹ loni, ọmọ mi?`;
      default:
        return `🌺 **Welcome to G-Corner, my precious daughter! Your Old Mama is here with open arms.**\n\nPull up a stool and sit close to me. Here in our corner, there is no harsh judgment, no gossip, and no cold rules—only elder love, prayerful wisdom, and protective guidance for your life.\n\nWhether you are facing family tension, questions about suitors and relationships, dangerous peer pressure outside, or simply need encouragement to know your worth before God, speak freely. What is on your heart today, my child?`;
    }
  }

  const handleSelectTopic = (topic: WisdomTopic) => {
    setSelectedTopic(topic.id);
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: topic.starterPrompt,
      topic: topic.title,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // If offline, reply immediately from curated offline wisdom!
    if (isOffline) {
      const offlineReply = topic.offlineWisdom[language] || topic.offlineWisdom.English;
      const assistantMsg: Message = {
        id: `a_${Date.now() + 1}`,
        role: 'assistant',
        content: offlineReply,
        topic: topic.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      return;
    }

    // If online, fetch from backend Gemini endpoint
    fetchElderWisdom([...messages, userMsg], topic.title);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

    // If offline, check if question matches any of our rich offline topics, or use general elder guidance
    if (isOffline) {
      const matchingTopic = WISDOM_TOPICS.find((t) =>
        userText.toLowerCase().includes(t.title.toLowerCase().slice(0, 5)) ||
        (t.id === 'suitors_boundaries' && (userText.includes('boy') || userText.includes('man') || userText.includes('suitor') || userText.includes('love'))) ||
        (t.id === 'family_conflict' && (userText.includes('parent') || userText.includes('mother') || userText.includes('father') || userText.includes('family'))) ||
        (t.id === 'safety_outside' && (userText.includes('friend') || userText.includes('party') || userText.includes('safe') || userText.includes('peer'))) ||
        (t.id === 'self_worth_god' && (userText.includes('worth') || userText.includes('ugly') || userText.includes('cry') || userText.includes('sad')))
      );

      const replyContent = matchingTopic
        ? matchingTopic.offlineWisdom[language] || matchingTopic.offlineWisdom.English
        : `🌺 **My daughter, your Old Mama is right here with you in Free Offline Mode:**\n\nI hear your words deeply. Remember that in all situations, you must hold fast to these three golden keys:\n\n1. **Guard Your Inner Peace:** Never sacrifice your character or self-respect to please another person.\n2. **Look for Fruit, Not Just Words:** In relationships and outside friendships, watch what people do when times are tough, not just what they say in the sunshine.\n3. **Walk in Prayer and Safety:** Trust that gut feeling God gave you. If an environment or person feels unsafe or makes you uneasy, walk away without shame.\n\n*You are a daughter of honor, fearfully and wonderfully made. Take a deep breath, and let God guide your next step with calm dignity.*`;

      const assistantMsg: Message = {
        id: `a_${Date.now() + 1}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newHistory, assistantMsg]);
      return;
    }

    // Call live online endpoint
    fetchElderWisdom(newHistory, selectedTopic || undefined);
  };

  const fetchElderWisdom = async (history: Message[], topicTitle?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/g-corner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          topic: topicTitle,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('G-Corner response was not ok');
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: data.text,
        topic: topicTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.warn('G-Corner API fallback to offline wisdom:', error);
      // Seamless offline fallback
      const fallbackTopic = WISDOM_TOPICS[0];
      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        role: 'assistant',
        content: fallbackTopic.offlineWisdom[language] || fallbackTopic.offlineWisdom.English,
        topic: topicTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (journalSavedIds.includes(id)) {
      updated = journalSavedIds.filter((item) => item !== id);
    } else {
      updated = [...journalSavedIds, id];
    }
    setJournalSavedIds(updated);
    try {
      localStorage.setItem('mama_g_corner_journal', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to journal', e);
    }
  };

  const playVoice = async (text: string) => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/audio-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audioRef.current = audio;
          audio.onended = () => setIsPlayingAudio(false);
          audio.play();
          return;
        }
      }
      // Browser SpeechSynthesis fallback
      if ('speechSynthesis' in window) {
        const clean = text.replace(/[*#_~`]/g, '').slice(0, 350);
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const bookmarkedMessages = messages.filter((m) => journalSavedIds.includes(m.id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Warm Sanctuary Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-rose-950 border border-amber-900/40 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                G-Corner · Old Mama's Wisdom
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {t.freeModeBadge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-tight">
              {t.gCornerTitle}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
              {t.gCornerSubtitle}
            </p>
          </div>

          {/* Mode Switcher: Chat Sanctuary vs My Wisdom Journal */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-stone-900/80 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTabMode('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTabMode === 'chat'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Old Mama Chat</span>
            </button>
            <button
              onClick={() => setActiveTabMode('journal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTabMode === 'journal'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Journal ({journalSavedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Ambient Warm Hearth Glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Free Mode & Safety Reassurance Callout */}
      <div className="bg-stone-900/60 border border-stone-800/80 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>100% Free & Stigma-Free:</strong> No subscriptions or credit cards. All guidance is available offline on your phone anytime you need a wise mother's ear.
          </span>
        </div>
        {onOpenEmergency && (
          <button
            onClick={onOpenEmergency}
            className="text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2 shrink-0 flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Emergency SOS</span>
          </button>
        )}
      </div>

      {activeTabMode === 'journal' ? (
        /* Journal View: Saved Pearls of Wisdom */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              My Saved Wisdom Journal
            </h2>
            <span className="text-xs text-stone-400">
              {bookmarkedMessages.length} entries bookmarked for offline reflection
            </span>
          </div>

          {bookmarkedMessages.length === 0 ? (
            <div className="text-center py-16 bg-stone-900/40 rounded-2xl border border-stone-800 p-8 space-y-3">
              <Bookmark className="w-10 h-10 text-stone-600 mx-auto" />
              <p className="text-base font-semibold text-stone-300">Your Wisdom Journal is Empty</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Whenever Old Mama shares an advice, prayer, or protective step that touches your spirit, click the bookmark icon on her message to save it here for offline reading anytime.
              </p>
              <button
                onClick={() => setActiveTabMode('chat')}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
              >
                Go to Old Mama Chat
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookmarkedMessages.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-900/80 border border-amber-900/30 rounded-xl p-5 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-2">
                    <span className="font-semibold text-amber-400">
                      {item.topic || "Old Mama's Advice"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{item.timestamp}</span>
                      <button
                        onClick={() => toggleBookmark(item.id)}
                        className="text-amber-400 hover:text-amber-300 p-1"
                        title="Remove bookmark"
                      >
                        <BookmarkCheck className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-stone-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Chat View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Wisdom Pillars & Topics */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Key Mentorship Pillars
                </h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Click any topic to hear Old Mama’s deep, godly counsel on common real-life challenges:
              </p>

              <div className="space-y-2 pt-1">
                {WISDOM_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start justify-between gap-2.5 ${
                      selectedTopic === topic.id
                        ? 'bg-amber-600/20 border-amber-500/50 text-amber-200 shadow-sm'
                        : 'bg-stone-850/60 hover:bg-stone-800 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{topic.title}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2">
                        {topic.shortDesc}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Old Mama's Daily Golden Rule Card */}
            <div className="bg-gradient-to-br from-amber-950/60 to-stone-900 border border-amber-900/30 rounded-2xl p-4 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Old Mama's Golden Rule</span>
              </div>
              <p className="italic text-stone-300 leading-relaxed">
                "A gentle tongue does not mean a weak backbone. You can be peaceful, loving, and respectful to all people, while standing completely unmovable on your God-given dignity."
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Chat Interface */}
          <div className="lg:col-span-2 flex flex-col bg-stone-900/90 border border-stone-800 rounded-2xl shadow-xl min-h-[580px] max-h-[720px] overflow-hidden">
            {/* Chat Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                const isSaved = journalSavedIds.includes(msg.id);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-sm ${
                        isAssistant
                          ? 'bg-gradient-to-tr from-amber-600 to-rose-700 text-white'
                          : 'bg-stone-700 text-stone-200'
                      }`}
                    >
                      {isAssistant ? '👵🏾' : '👧🏾'}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-xs sm:text-sm shadow-sm space-y-2 ${
                        isAssistant
                          ? 'bg-stone-850 border border-stone-800 text-stone-200 rounded-tl-sm'
                          : 'bg-amber-600 text-white rounded-tr-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] opacity-75 border-b border-white/10 pb-1">
                        <span className="font-semibold">
                          {isAssistant ? 'Old Mama (G-Corner)' : 'You'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div className="whitespace-pre-wrap leading-relaxed font-sans">
                        {msg.content}
                      </div>

                      {/* Assistant message action bar */}
                      {isAssistant && msg.id !== 'welcome_greeting' && (
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800/80 text-xs">
                          <button
                            type="button"
                            onClick={() => playVoice(msg.content)}
                            className="inline-flex items-center gap-1 text-stone-400 hover:text-amber-300 transition-colors"
                            title="Listen to Old Mama's voice"
                          >
                            {isPlayingAudio ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleBookmark(msg.id)}
                            className={`inline-flex items-center gap-1 transition-colors ${
                              isSaved
                                ? 'text-amber-400 font-semibold'
                                : 'text-stone-400 hover:text-amber-300'
                            }`}
                            title={isSaved ? 'Saved in journal' : 'Save to Wisdom Journal'}
                          >
                            {isSaved ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>Save Advice</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center shrink-0 text-white">
                    👵🏾
                  </div>
                  <div className="bg-stone-850 border border-stone-800 rounded-2xl px-4 py-3 text-xs text-amber-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Old Mama is pondering your situation with prayer and wisdom...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-stone-900 border-t border-stone-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Old Mama anything (e.g., family conflict, suitors, boundaries, fear)..."
                className="flex-1 bg-stone-800 text-stone-100 placeholder-stone-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm border border-stone-700 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-md"
              >
                <span>Ask Mama</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
