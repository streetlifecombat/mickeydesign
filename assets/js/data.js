/* =====================================================================
   data.js  —  HIER pas je alles aan.
   Dit is het enige bestand dat je normaal hoeft te bewerken.
   ===================================================================== */

/* ---------- 1. Algemene site-info ---------- */
/*  LET OP — taal (NL/EN):
    Een tekst mag gewoon één string zijn (dan is die hetzelfde in beide
    talen). Wil je een tekst per taal verschillend? Gebruik dan een object:
        about: { nl: "Nederlandse tekst", en: "English text" }
    De site pakt automatisch de juiste taal via de taalknop in de header. */
window.SITE = {
  name: "Mickey Design",                    // je naam of merknaam
  role: "YouTube Thumbnail Designer",

  /* Webadres van je site. Wordt o.a. gebruikt voor SEO en de PWA.
     Vervang dit door je eigen domein zodra je live gaat. */
  url: "https://mickeydesign.nl",

  /* Talen. "langs" zijn de talen die je aanbiedt, "defaultLang" is de taal
     waarmee de site opent. Kies uit "nl" en "en". */
  langs: ["nl", "en"],
  defaultLang: "nl",

  headline: {
    nl: 'Jouw video verdient een thumbnail die <span class="grad">opvalt.</span>',
    en: 'Your video deserves a thumbnail that <span class="grad">stands out.</span>',
  },
  sub: {
    nl: "Sterke gaming thumbnails met kleur, karakter en een flinke dosis impact.",
    en: "Strong gaming thumbnails with color, character and a serious dose of impact.",
  },
  about: {
    nl:
      "Ik maak opvallende YouTube-thumbnails voor alle soorten video's. Met sterk kleurgebruik, " +
      "duidelijke composities en oog voor detail krijgt jouw video een eigen uitstraling.",
    en:
      "I create striking YouTube thumbnails for all kinds of videos. With strong use of color, " +
      "clear compositions and an eye for detail, your video gets its own look.",
  },
  orderUrl: "https://discord.gg/StqqMKKeu6",
  startingPrice: "€5",
  email: "",

  /* Het thema waarmee de site opent. Kies uit de id's in window.THEMES hieronder.
     Standaard is dit "gta6" (GTA VI). Wil je een ander startthema? Verander dan
     deze regel én de data-theme in index.html, zodat er geen flits is bij het laden.
     Bezoekers kunnen zelf een ander thema kiezen via de knop in de header. */
  defaultTheme: "gta6",

  /* Seizoens-autothema. Als een bezoeker nog geen eigen thema koos, kiest de
     site automatisch een passend thema op basis van de datum (bijv. Kerst in
     december). Zodra de bezoeker zelf een thema kiest, wordt dat onthouden en
     gaat de autokeuze niet meer voor.

       from / to : maand-dag (from t/m to, dus "12-06" t/m "12-31")
       theme     : een id uit window.THEMES hieronder

     Laat de lijst leeg ([]) om de autokeuze uit te zetten. */
  seasonal: [
    { from: "02-07", to: "02-14", theme: "valentijn" },
    { from: "10-25", to: "10-31", theme: "halloween" },
    { from: "11-20", to: "12-05", theme: "sinterklaas" },
    { from: "12-06", to: "12-31", theme: "kerst" },
  ],

  /* "Thema van de week". Als een bezoeker nog geen eigen thema koos, pakt de
     site automatisch één thema per week, zodat het rustig meebeweegt zonder
     steeds te wisselen. Een bezoeker die zelf een thema kiest, houdt dat.

       enabled : aan/uit
       themes  : de thema's die meedoen (leeg = alle thema's)
       offset  : verschuift de volgorde (handig om met een ander thema te
                 beginnen)                                                       */
  themeOfWeek: {
    enabled: true,
    themes: ["gta6", "cyberpunk", "fortnite", "rocketleague", "minecraft", "valorant", "retro", "zomer", "halloween", "winter"],
    offset: 0,
  },

  /* Sneeuw of confetti bij speciale datums. Op deze dagen dwarrelen er
     extra figuurtjes over de hele site (los van het gekozen thema).

       from / to : maand-dag (from t/m to)
       effect    : "sneeuw" of "confetti"
       symbols   : welke figuurtjes er vallen

     Laat de lijst leeg ([]) om dit uit te zetten. */
  dateEffects: [
    { from: "12-20", to: "12-31", effect: "sneeuw", symbols: ["❄", "❄", "❅", "❆"] },
    { from: "01-01", to: "01-03", effect: "confetti", symbols: ["🎉", "🎊", "✨", "🥳"] },
  ],

  /* Cijfers in de hero. De getallen tellen op zodra ze in beeld komen.
     Pas ze aan naar jouw eigen situatie. */
  stats: [
    { value: "200+", label: { nl: "Thumbnails ontworpen", en: "Thumbnails designed" } },
    { value: "50+", label: { nl: "Creators waarmee ik werkte", en: "Creators I worked with" } },
    { value: "100%", label: { nl: "Op maat gemaakt", en: "Made to measure" } },
  ],

  skills: [
    "Gaming",
    "Clickbait",
    "YouTube",
    { nl: "Kleur & compositie", en: "Color & composition" },
  ],

  checklist: [
    { nl: "Een ontwerp afgestemd op jouw video", en: "A design tailored to your video" },
    { nl: "Opvallende kleuren en duidelijke compositie", en: "Striking colors and a clear composition" },
    { nl: "Je bespreekt je idee rechtstreeks via Discord", en: "You discuss your idea directly via Discord" },
    { nl: "Aanpassingen bespreek je samen vooraf", en: "You agree on adjustments together up front" },
  ],

  socials: [],
};

/* ---------- 1b. Thema's ---------- */
/*  Bezoekers kiezen een thema via de knop in de header. Elk thema verandert
    de kleuren, de sfeer en de vallende figuurtjes.

      id      : moet overeenkomen met de CSS (laat je staan)
      label   : naam in het keuzemenu
      emoji   : icoon in het keuzemenu en op de knop
      symbols : de figuurtjes die rustig naar beneden dwarrelen
      decor   : (optioneel) welke feestversiering zichtbaar is bij dit thema
                garland      = slinger met de emoji van dit thema bovenin
                lights       = kerstverlichting bovenin de header
                bauble       = de kerstbal naast het logo (easter egg)
                snowcap      = sneeuwkapje op de hero-afbeelding
                ornaments    = hangende kerstballen in de hero
                Zet een onderdeel op true om het bij dit thema te tonen.
                Zo bepaal je per thema zelf wat er te zien is.
*/
window.THEMES = [
  { id: "standaard", label: "Standaard", emoji: "🔵", symbols: ["✦", "•"] },
  {
    id: "kerst",
    label: "Kerst",
    emoji: "🎄",
    symbols: ["❄", "✦", "❄", "•"],
    decor: { lights: true, bauble: true, snowcap: true, ornaments: true },
  },
  { id: "halloween", label: "Halloween", emoji: "🎃", symbols: ["🦇", "👻", "🕸", "🎃"], decor: { garland: true } },
  { id: "sinterklaas", label: "Sinterklaas", emoji: "🎁", symbols: ["🍬", "🍪", "⭐", "🎁"], decor: { garland: true } },
  { id: "pasen", label: "Pasen", emoji: "🐣", symbols: ["🐣", "🥚", "🌸", "🌼"], decor: { garland: true } },
  { id: "valentijn", label: "Valentijn", emoji: "❤️", symbols: ["❤", "💕", "💗", "🤍"], decor: { garland: true } },
  { id: "gta6", label: "GTA VI", emoji: "🌴", symbols: ["🌴", "💜", "🌆", "✨"] },
  { id: "fortnite", label: "Fortnite", emoji: "🦙", symbols: ["⭐", "💥", "🦙", "⚡"] },
  { id: "rocketleague", label: "Rocket League", emoji: "🚀", symbols: ["🚗", "⚽", "🔥", "💨"] },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌆", symbols: ["🌆", "⚡", "🔮", "✨"] },
  { id: "minecraft", label: "Minecraft", emoji: "⛏️", symbols: ["🟩", "⛏️", "🧱", "💎"] },
  { id: "valorant", label: "Valorant", emoji: "🎯", symbols: ["🎯", "🔺", "💠", "🔥"] },
  { id: "zomer", label: "Zomer", emoji: "🌞", symbols: ["🌞", "🌊", "🍦", "🌴"], decor: { garland: true } },
  { id: "herfst", label: "Herfst", emoji: "🍂", symbols: ["🍂", "🍁", "🌰", "🍃"], decor: { garland: true } },
  { id: "winter", label: "Winter", emoji: "❄️", symbols: ["❄️", "🌨️", "⛄", "✨"], decor: { garland: true, snowcap: true } },
  { id: "retro", label: "Retro Arcade", emoji: "👾", symbols: ["👾", "🕹️", "👽", "💾"] },
];

/* ---------- 2. Creators met wie je hebt gewerkt ---------- */
/* Vul alleen echte samenwerkingen in. Een avatar of link is optioneel.
   Voorbeeld:
   { name: "Creatornaam", channel: "@kanaal", avatar: "images/creator.jpg", url: "https://youtube.com/@kanaal" }
*/
window.CREATORS = [
  { name: "AltijdMartin", channel: "@AltijdMartin", avatar: "images/altijdmartin.png", url: "https://www.youtube.com/@AltijdMartin" },
  { name: "JordyStorm", channel: "@JordyStorm", avatar: "images/jordystorm.jpg", url: "https://www.youtube.com/@JordyStorm" },
  { name: "JCM", channel: "@JCMYT", avatar: "images/jcm.jpg", url: "https://www.youtube.com/@JCMYT" },
];

/* ---------- 3. Je thumbnails ---------- */
/*  Elk item:
      title    : naam van de video/thumbnail
      category : categorie (bepaalt de filter-chips automatisch)
      image    : pad naar je afbeelding OF een volledige URL
                 - eigen bestand  -> "images/mijn-thumb.jpg"
                 - externe link   -> "https://..."
      video    : (optioneel) link naar de YouTube-video
      alt      : (optioneel) omschrijving voor toegankelijkheid

    TIP: zet je eigen bestanden in de map "images/" en verwijs ernaar
         met "images/bestandsnaam.jpg".
    De items hieronder zijn voorbeeld-thumbnails — vervang ze door je eigen werk.
*/
window.THUMBNAILS = [
  {
    title: "Eerste keer GTA 6 Spelen!?",
    category: "GTA",
    image: "images/altijdmartingta6.png",
    fallback: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=high%20energy%20youtube%20gaming%20thumbnail%20inspired%20by%20open%20world%20crime%20game%2C%20excited%20young%20male%20gamer%20wearing%20headset%20on%20left%2C%20neon%20pink%20and%20blue%20vice%20city%20sunset%2C%20bold%20game%20logo%20composition%2C%20cinematic&image_size=landscape_16_9",
    video: "",
  },
  {
    title: "Bronze to Unreal Speedrun (World Record)",
    category: "Fortnite",
    image: "images/btou2.png",
    fallback: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=high%20energy%20youtube%20gaming%20thumbnail%20inspired%20by%20open%20world%20crime%20game%2C%20excited%20young%20male%20gamer%20wearing%20headset%20on%20left%2C%20neon%20pink%20and%20blue%20vice%20city%20sunset%2C%20bold%20game%20logo%20composition%2C%20cinematic&image_size=landscape_16_9",
    video: "",
  },
  {
    title: "$10.000 Setup Tour",
    category: "Fortnite",
    image: "images/setup.png",
    fallback: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=high%20energy%20youtube%20gaming%20thumbnail%20inspired%20by%20open%20world%20crime%20game%2C%20excited%20young%20male%20gamer%20wearing%20headset%20on%20left%2C%20neon%20pink%20and%20blue%20vice%20city%20sunset%2C%20bold%20game%20logo%20composition%2C%20cinematic&image_size=landscape_16_9",
    video: "",
  },
  {
    title: "Meedoen aan het Royalistiq toernooi!",
    category: "Fortnite",
    image: "images/jordystormroy.png",
    fallback: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=polished%20youtube%20fortnite%20gaming%20thumbnail%2C%20surprised%20young%20male%20gamer%20in%20foreground%2C%20vibrant%20cyan%20blue%20background%2C%20game%20character%20and%20bold%20competition%20composition%2C%20high%20contrast&image_size=landscape_16_9",
    video: "",
  },
  {
    title: "Bronze to Unreal Speedrun",
    category: "Fortnite",
    image: "images/bronzetounreal.png",
    fallback: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=dynamic%20fortnite%20style%20youtube%20thumbnail%2C%20colorful%20cartoon%20battle%20royale%20character%20flying%20toward%20camera%2C%20bright%20blue%20sky%2C%20competitive%20rank%20emblems%20on%20the%20right%2C%20bold%20gaming%20composition&image_size=landscape_16_9",
    video: "",
  },
  {
    title: "We got lucky in this Solo Cashcup!",
    category: "Fortnite",
    image: "images/solocc.png",
    fallback: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=cinematic%20fortnite%20style%20youtube%20gaming%20thumbnail%2C%20cartoon%20character%20skydiving%20toward%20camera%20over%20island%2C%20bright%20blue%20sky%20with%20white%20speed%20lines%2C%20dramatic%20and%20colorful%20composition&image_size=landscape_16_9",
    video: "",
  },
  {
    title: "GTA VI is eindelijk hier!",
    category: "GTA",
    image: "images/gta6-vice.png",
    fallback: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=high%20energy%20youtube%20gaming%20thumbnail%20excited%20reaction%20to%20gta%206%2C%20vice%20city%20skyline%20with%20palm%20trees%20pink%20purple%20sunset%2C%20gta%206%20logo%2C%20vibrant%20cinematic%20colors&image_size=landscape_16_9",
    video: "",
  },
  {
    title: "Eerste gameplay van GTA VI!",
    category: "GTA",
    image: "images/gta6-spelen.png",
    fallback: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=youtube%20gaming%20thumbnail%20gamer%20at%20desk%20setup%20playing%20gta%206%2C%20neon%20pink%20and%20teal%20rgb%20lighting%2C%20gta%206%20game%20cases%2C%20monitor%20showing%20game%2C%20excited%20expression%2C%20vibrant&image_size=landscape_16_9",
    video: "",
  },
];

/* ---------- 4. Voor & na (sleepbare slider) ---------- */
/*  Elk item toont een sleepbare vergelijking.
      title  : naam van de thumbnail
      after  : het eindresultaat (meestal dezelfde afbeelding als in THUMBNAILS)
      before : (optioneel) de originele video-still
               Laat je dit leeg, dan wordt dezelfde afbeelding gebruikt
               met een "onbewerkt"-filter, zodat je het effect alsnog ziet.
*/
window.BEFORE_AFTER = [
  { title: "$10.000 Setup Tour", before: "images/before-setup.png", after: "images/setup.png" },
];

/* ---------- 5. Reviews ---------- */
/*  LET OP: dit zijn voorbeeldteksten. Vervang ze door echte quotes
    van de creators voordat je de site deelt.
      name   : naam van de creator
      role   : korte omschrijving (bijv. "YouTuber")
      avatar : profielfoto (optioneel)
      stars  : aantal sterren (1 t/m 5)
      text   : de quote
      url    : link naar het kanaal (optioneel)
*/
window.REVIEWS = [
  {
    name: "AltijdMartin",
    role: "YouTuber",
    avatar: "images/altijdmartin.png",
    stars: 5,
    text: {
      nl: "Mickey dacht goed mee over de compositie en leverde precies de sfeer die ik zocht.",
      en: "Mickey thought along on the composition and delivered exactly the vibe I was after.",
    },
    url: "https://www.youtube.com/@AltijdMartin",
  },
  {
    name: "JordyStorm",
    role: "YouTuber",
    avatar: "images/jordystorm.jpg",
    stars: 5,
    text: {
      nl: "Snel, duidelijk en het eindresultaat viel echt op tussen alle andere video's.",
      en: "Fast, clear, and the end result really stood out among all the other videos.",
    },
    url: "https://www.youtube.com/@JordyStorm",
  },
  {
    name: "JCM",
    role: "YouTuber",
    avatar: "images/jcm.jpg",
    stars: 5,
    text: {
      nl: "Fijne samenwerking via Discord en de thumbnail paste perfect bij mijn video.",
      en: "A great collaboration via Discord, and the thumbnail fit my video perfectly.",
    },
    url: "https://www.youtube.com/@JCMYT",
  },
];

/* ---------- 6. Veelgestelde vragen ---------- */
/*  Elk item: q = de vraag, a = het antwoord.
    Beide mogen ook per taal: q: { nl: "...", en: "..." }. */
window.FAQ = [
  {
    q: {
      nl: "Hoe lang duurt het voordat mijn thumbnail klaar is?",
      en: "How long until my thumbnail is ready?",
    },
    a: {
      nl: "Dat hangt af van je idee en hoe druk het is. Je hoort de verwachte levertijd altijd vooraf via Discord.",
      en: "That depends on your idea and how busy it is. You'll always hear the expected delivery time up front via Discord.",
    },
  },
  {
    q: { nl: "Hoe bestel ik precies?", en: "How exactly do I order?" },
    a: {
      nl: "Je stuurt je video of idee via Discord. We bespreken stijl en tekst en daarna ga ik aan de slag.",
      en: "You send your video or idea via Discord. We discuss style and text, and then I get to work.",
    },
  },
  {
    q: { nl: "Kan ik nog aanpassingen doen?", en: "Can I still make changes?" },
    a: {
      nl: "Ja. We stemmen de details vooraf af, zodat het eindresultaat meteen in de goede richting zit.",
      en: "Yes. We align the details up front, so the end result is on the right track right away.",
    },
  },
  {
    q: { nl: "Wat kost een thumbnail?", en: "What does a thumbnail cost?" },
    a: {
      nl: "Een thumbnail start vanaf €5, afhankelijk van je wensen en de details. Je krijgt vooraf duidelijkheid over de prijs.",
      en: "A thumbnail starts from €5, depending on your wishes and the details. You'll get clarity on the price up front.",
    },
  },
  {
    q: {
      nl: "In welk formaat krijg ik mijn thumbnail?",
      en: "What format will my thumbnail be in?",
    },
    a: {
      nl: "Je ontvangt een bestand in het standaard YouTube-formaat (1280 x 720), klaar om te uploaden.",
      en: "You'll receive a file in the standard YouTube format (1280 x 720), ready to upload.",
    },
  },
];

/* ---------- 7. Vertalingen van de vaste teksten (NL/EN) ---------- */
/*  Dit zijn de teksten die in de pagina zelf staan (menu, koppen, knoppen).
    Wil je een tekst aanpassen? Verander hem hier per taal.
    De teksten van jouw eigen werk, creators, reviews en FAQ staan hierboven. */
window.I18N = {
  nl: {
    meta: {
      description: "Bekijk het thumbnailportfolio van Mickey Design en bestel jouw YouTube-thumbnail via Discord.",
    },
    skip: "Naar het werk",
    menu: "Menu openen",
    menuClose: "Menu sluiten",
    nav: { home: "Home", werk: "Werk", creators: "Creators", bestellen: "Bestellen", faq: "FAQ", over: "Over", contact: "Contact" },
    cta: { order: "Bestel via Discord", orderLong: "Bestellen via Discord" },
    theme: { choose: "Thema kiezen", menuTitle: "Kies een thema" },
    lang: { button: "Taal", toggle: "Taal wisselen (NL/EN)" },
    hero: {
      note: "Bestellen gaat makkelijk via Discord",
      workBtn: "Bekijk mijn werk",
      orderBtn: "Bestel jouw thumbnail",
      priceFrom: "Vanaf",
      pricePer: "per thumbnail",
      priceSmall: "Starttarief",
      priceLink: "Bekijk hoe het werkt",
    },
    werk: {
      title: "Werk",
      sub: "Een selectie van thumbnails gemaakt om op te vallen.",
      empty: "Geen thumbnails in deze categorie.",
      filterAll: "Alle",
      baEyebrow: "Voor & na",
      baTitle: "Sleep om het verschil te zien",
      baSub: "Trek de slider en bekijk de onbewerkte video-still naast het eindresultaat.",
    },
    creators: {
      eyebrow: "Samenwerkingen",
      title: "Creators met wie ik heb gewerkt",
      sub: "Een paar van de makers achter de video's waarvoor ik thumbnails heb ontworpen.",
      view: "Bekijk kanaal",
      emptyTitle: "Jouw kanaal kan hier ook staan",
      emptyText: "Stuur me via Discord een bericht om samen aan jouw volgende thumbnail te werken.",
      emptyBtn: "Start een samenwerking",
      reviewsEyebrow: "Reviews",
      reviewsTitle: "Wat creators zeggen",
    },
    order: {
      eyebrow: "Makkelijk geregeld",
      title: "Van video-idee naar thumbnail",
      sub: "Bestel rechtstreeks bij Mickey Design via Discord. Zo werkt het:",
      step1Title: "Stuur je video",
      step1Text: "Deel je videolink of vertel waar je video over gaat.",
      step2Title: "Bespreek je idee",
      step2Text: "Vertel welke stijl, tekst en sfeer je voor ogen hebt.",
      step3Title: "Jouw thumbnail",
      step3Text: "We stemmen de details af en gaan aan de slag met je ontwerp.",
      cta: "Start je bestelling via Discord",
      note: "Je hebt geen formulier nodig, stuur gewoon een bericht.",
    },
    faq: {
      eyebrow: "Veelgestelde vragen",
      title: "Even alles op een rij",
      sub: "De vragen die ik het vaakst krijg. Iets anders? Stuur me een bericht via Discord.",
    },
    over: { title: "Over mij", card: "Een thumbnail op maat" },
    contact: {
      eyebrow: "Klaar om op te vallen?",
      title: "Jouw volgende thumbnail begint hier.",
      sub: "Stuur je idee via Discord en we bespreken samen jouw thumbnail.",
      orderBtn: "Bestel via Discord",
      joinBtn: "Join de server",
      note: "Je wordt doorgestuurd naar mijn Discord-server.",
    },
    discord: {
      server: "Discord-server",
      loading: "Leden worden geladen…",
      join: "Doe mee op Discord",
      member: "lid op de server",
      members: "leden op de server",
    },
    footer: { tag: "Voor al jouw thumbnails." },
    lb: { view: "Bekijk video" },
    common: { view: "Bekijk", starsAria: "{n} van 5 sterren" },
  },
  en: {
    meta: {
      description: "Browse Mickey Design's thumbnail portfolio and order your YouTube thumbnail via Discord.",
    },
    skip: "Skip to work",
    menu: "Open menu",
    menuClose: "Close menu",
    nav: { home: "Home", werk: "Work", creators: "Creators", bestellen: "Order", faq: "FAQ", over: "About", contact: "Contact" },
    cta: { order: "Order via Discord", orderLong: "Order via Discord" },
    theme: { choose: "Choose theme", menuTitle: "Choose a theme" },
    lang: { button: "Language", toggle: "Switch language (NL/EN)" },
    hero: {
      note: "Ordering is easy via Discord",
      workBtn: "View my work",
      orderBtn: "Order your thumbnail",
      priceFrom: "From",
      pricePer: "per thumbnail",
      priceSmall: "Starting price",
      priceLink: "See how it works",
    },
    werk: {
      title: "Work",
      sub: "A selection of thumbnails made to stand out.",
      empty: "No thumbnails in this category.",
      filterAll: "All",
      baEyebrow: "Before & after",
      baTitle: "Drag to see the difference",
      baSub: "Drag the slider and compare the raw video still with the final result.",
    },
    creators: {
      eyebrow: "Collaborations",
      title: "Creators I've worked with",
      sub: "A few of the makers behind the videos I've designed thumbnails for.",
      view: "View channel",
      emptyTitle: "Your channel could be here too",
      emptyText: "Send me a message on Discord to work on your next thumbnail together.",
      emptyBtn: "Start a collaboration",
      reviewsEyebrow: "Reviews",
      reviewsTitle: "What creators say",
    },
    order: {
      eyebrow: "Easy to arrange",
      title: "From video idea to thumbnail",
      sub: "Order directly from Mickey Design via Discord. Here's how it works:",
      step1Title: "Send your video",
      step1Text: "Share your video link or tell me what your video is about.",
      step2Title: "Discuss your idea",
      step2Text: "Tell me which style, text and mood you have in mind.",
      step3Title: "Your thumbnail",
      step3Text: "We align the details and get to work on your design.",
      cta: "Start your order via Discord",
      note: "No form needed, just send a message.",
    },
    faq: {
      eyebrow: "Frequently asked questions",
      title: "Everything at a glance",
      sub: "The questions I get most often. Something else? Send me a message on Discord.",
    },
    over: { title: "About me", card: "A custom thumbnail" },
    contact: {
      eyebrow: "Ready to stand out?",
      title: "Your next thumbnail starts here.",
      sub: "Send your idea via Discord and we'll discuss your thumbnail together.",
      orderBtn: "Order via Discord",
      joinBtn: "Join the server",
      note: "You'll be redirected to my Discord server.",
    },
    discord: {
      server: "Discord server",
      loading: "Loading members…",
      join: "Join me on Discord",
      member: "member on the server",
      members: "members on the server",
    },
    footer: { tag: "For all your thumbnails." },
    lb: { view: "Watch video" },
    common: { view: "View", starsAria: "{n} out of 5 stars" },
  },
};
