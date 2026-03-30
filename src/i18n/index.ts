export const languages = ['en', 'pl'] as const;
export type Lang = (typeof languages)[number];

export const defaultLang: Lang = 'en';

const dict = {
  en: {
    // Hero
    heroHeader: 'Building AI for Sport',
    heroDescription:
      'We design intelligent tools for performance analysis, coaching, and fan experience — built by engineers, analysts, and sport scientists.',
    heroCtaPrimary: 'See our projects',
    heroCtaSecondary: 'Join the team',

    // Join CTA
    joinCtaHeader: 'Build the future of sport with us',
    joinCtaDescription:
      'Join a team of engineers, analysts, designers, and sport scientists working on real AI projects in sport.',
    joinButton: 'Apply now',

    // Nav
    navAbout: 'About',
    navContact: 'Contact',
    navProjects: 'Projects',
    langEN: '🇬🇧',
    langPL: '🇵🇱',

    // About
    aboutHeader: 'About us',
    aboutSubHeader: 'Meet the team building AI for sport.',
    aboutLongerDescription:
      'We bring together students who believe the future of sport is intelligence-driven. Our mission is to build AI systems that improve athletic performance, support smarter coaching, and unlock new ways for fans to experience the game. We run cross-disciplinary project teams that turn curiosity into working prototypes.',
    supervisorsTeamGroup: 'Supervisors',
    managementTeamGroup: 'Leadership',

    // Contact
    contactHeader: 'Contact',
    contactSubHeader: 'Get in touch with the team.',
    contactFormHeader: 'AGH Athletics Intelligence',
    contactFormDescription: 'We are based at AGH University of Science and Technology in Kraków, Poland.',
    contactEmailLabel: 'Email',
    contactGithubLabel: 'GitHub',

    // 404
    notFound: 'Page not found.',

    // Team titles
    presidentTitle: 'President',
    vicePresidentTitle: 'Vice President',
    supervisorTitle: 'Supervisor',
    academicSupervisorTitle: 'Academic Supervisor',

    // News / Projects
    newsHeader: 'Projects',
    newsSubHeader: 'What we are building.',
    newsNoNews: "We're building our first public case studies and prototypes. Updates soon.",
    newsReadMoreButton: 'Read more',
    newsBackToList: 'Back',

    // Homepage sections
    whatWeBuildHeader: 'What we build',
    whatWeBuildSubHeader: 'Three applied AI focus areas across the sport ecosystem.',
    featuredProjectsHeader: 'Featured prototypes',
    featuredProjectsSubHeader: 'Early-stage tools and research we are actively developing.',
    howWeWorkHeader: 'How we work',
    howWeWorkSubHeader: 'A research and prototyping lab embedded in sport.',

    // Hero extras
    heroBadge: 'AI · Sport · Intelligence',
    heroDragHint: 'Drag to rotate',

    // CTA
    ctaEyebrow: 'Join the team',
    ctaMeetTeam: 'Meet the team',

    // Footer
    footerTagline: 'Implementing AI solutions into sport — from performance analytics to fan experience.',
    footerNavHeading: 'Navigation',
    footerNavHome: 'Home',
    footerConnectHeading: 'Connect',
    footerCopyright: 'All rights reserved.',
    footerUniversity: 'AGH University of Science and Technology, Kraków',

    // Mobile menu / nav badge
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    navBadgeNew: 'New',

    // What we build cards
    whatWeBuildCard1Title: 'Performance Analytics',
    whatWeBuildCard1Desc: 'Turn raw telemetry and match data into actionable insights for athletes and coaching staff.',
    whatWeBuildCard2Title: 'Computer Vision for Sport',
    whatWeBuildCard2Desc: 'Detect, track, and classify athletes and events in real time from video streams.',
    whatWeBuildCard3Title: 'Fan & Media Intelligence',
    whatWeBuildCard3Desc: 'Enrich the spectator experience with real-time data narratives and intelligent media tools.',

    // How we work pillars + body
    howWeWorkPillar1Title: 'Interdisciplinary teams',
    howWeWorkPillar1Desc: 'Engineers, analysts, designers, and sport scientists working on the same problems.',
    howWeWorkPillar2Title: 'Fast prototyping',
    howWeWorkPillar2Desc: 'Ideas become testable prototypes in weeks, not months. We ship to learn.',
    howWeWorkPillar3Title: 'Data-driven decisions',
    howWeWorkPillar3Desc: 'Every hypothesis is grounded in real sport data. We measure what matters.',
    howWeWorkPillar4Title: 'Sport + AI domain',
    howWeWorkPillar4Desc: 'Deep sport knowledge paired with applied AI expertise — both sides matter.',
    howWeWorkBody:
      'We operate as a cross-disciplinary applied research lab inside the university — combining academic rigour with startup speed.',

    // Project status labels (shared: homepage section + projects page)
    statusPrototype: 'Prototype',
    statusInResearch: 'In research',
    statusExperimental: 'Experimental',
    statusInternalTool: 'Internal tool',

    // Homepage project cards (short descriptions)
    projectMotionTrackDesc:
      'Real-time player tracking and movement analysis from broadcast video using pose estimation.',
    projectCoachLensDesc:
      'AI-assisted coaching feedback that surfaces patterns and anomalies from training session data.',
    projectSportsGraphDesc: 'A knowledge graph connecting athletes, events, and statistics for semantic sport search.',
    projectLiveStatsDesc:
      'A live match data pipeline that aggregates and normalises event streams across multiple sources.',

    // Projects page (full descriptions)
    projectMotionTrackDescFull:
      'Real-time player tracking and movement analysis from broadcast video using pose estimation and optical flow.',
    projectCoachLensDescFull:
      'AI-assisted coaching feedback system that surfaces patterns and anomalies from training session data and session notes.',
    projectSportsGraphDescFull:
      'A knowledge graph connecting athletes, competitions, events, and statistics for semantic sport querying.',
    projectLiveStatsDescFull:
      'A live match data pipeline that aggregates, normalises, and serves event streams across multiple data sources.',
    projectsComingSoon: 'More projects and case studies are on the way.',
    projectsFollowGithub: 'Follow our GitHub for the latest activity.',

    // Contact extras
    contactLocationLabel: 'Location',
    contactJoinLabel: 'Interested in joining?',
    contactJoinDesc:
      'We are always looking for curious builders — engineers, analysts, designers, and sport scientists.'
  },
  pl: {
    // Hero
    heroHeader: 'Wdrażamy AI w Sporcie',
    heroDescription:
      'Tworzymy inteligentne narzędzia do analizy wyników, coachingu i doświadczeń kibiców — budowane przez inżynierów, analityków i specjalistów od sportu.',
    heroCtaPrimary: 'Zobacz projekty',
    heroCtaSecondary: 'Dołącz do zespołu',

    // Join CTA
    joinCtaHeader: 'Buduj przyszłość sportu razem z nami',
    joinCtaDescription:
      'Dołącz do zespołu inżynierów, analityków, projektantów i specjalistów sportu pracujących nad prawdziwymi projektami AI.',
    joinButton: 'Aplikuj teraz',

    // Nav
    navAbout: 'O nas',
    navContact: 'Kontakt',
    navProjects: 'Projekty',
    langEN: '🇬🇧',
    langPL: '🇵🇱',

    // About
    aboutHeader: 'O nas',
    aboutSubHeader: 'Poznaj nasz zespół budujący AI dla sportu.',
    aboutLongerDescription:
      'Zrzeszamy studentów, którzy wierzą, że przyszłość sportu opiera się na inteligencji danych. Naszą misją jest budowanie systemów AI, które poprawiają wyniki sportowców, wspierają mądrzejszy coaching i otwierają przed kibicami nowe możliwości doświadczania sportu. Prowadzimy wielodyscyplinarne zespoły projektowe, które zamieniają ciekawość w działające prototypy.',
    supervisorsTeamGroup: 'Opiekunowie',
    managementTeamGroup: 'Zarząd',

    // Contact
    contactHeader: 'Kontakt',
    contactSubHeader: 'Skontaktuj się z naszym zespołem.',
    contactFormHeader: 'AGH Athletics Intelligence',
    contactFormDescription: 'Jesteśmy na AGH Akademii Górniczo-Hutniczej w Krakowie.',
    contactEmailLabel: 'Email',
    contactGithubLabel: 'GitHub',

    // 404
    notFound: 'Nie znaleziono strony.',

    // Team titles
    presidentTitle: 'Prezes',
    vicePresidentTitle: 'Wiceprezes',
    supervisorTitle: 'Opiekun SKN',
    academicSupervisorTitle: 'Opiekun naukowy SKN',

    // News / Projects
    newsHeader: 'Projekty',
    newsSubHeader: 'Co budujemy.',
    newsNoNews: 'Budujemy nasze pierwsze publiczne case study i prototypy. Wkrótce aktualizacje.',
    newsReadMoreButton: 'Czytaj więcej',
    newsBackToList: 'Wróć',

    // Homepage sections
    whatWeBuildHeader: 'Co budujemy',
    whatWeBuildSubHeader: 'Trzy obszary zastosowań AI w ekosystemie sportu.',
    featuredProjectsHeader: 'Wyróżnione prototypy',
    featuredProjectsSubHeader: 'Wczesne narzędzia i badania, które aktywnie rozwijamy.',
    howWeWorkHeader: 'Jak pracujemy',
    howWeWorkSubHeader: 'Laboratorium badawcze i prototypowe zintegrowane ze sportem.',

    // Hero extras
    heroBadge: 'AI · Sport · Intelligence',
    heroDragHint: 'Przeciągnij, aby obrócić',

    // CTA
    ctaEyebrow: 'Dołącz do nas',
    ctaMeetTeam: 'Poznaj zespół',

    // Footer
    footerTagline: 'Wdrażamy AI w sporcie — od analityki wyników po doświadczenia kibiców.',
    footerNavHeading: 'Nawigacja',
    footerNavHome: 'Strona główna',
    footerConnectHeading: 'Kontakt',
    footerCopyright: 'Wszelkie prawa zastrzeżone.',
    footerUniversity: 'AGH Akademia Górniczo-Hutnicza, Kraków',

    // Mobile menu / nav badge
    menuOpen: 'Otwórz menu',
    menuClose: 'Zamknij menu',
    navBadgeNew: 'Nowość',

    // What we build cards
    whatWeBuildCard1Title: 'Analityka Wydajności',
    whatWeBuildCard1Desc:
      'Zamieniamy surowe dane telemetryczne i meczowe w praktyczne wskazówki dla zawodników i sztabów trenerskich.',
    whatWeBuildCard2Title: 'Wizja Komputerowa dla Sportu',
    whatWeBuildCard2Desc:
      'Wykrywamy, śledzimy i klasyfikujemy zawodników oraz zdarzenia w czasie rzeczywistym z obrazu wideo.',
    whatWeBuildCard3Title: 'Inteligencja Kibiców i Mediów',
    whatWeBuildCard3Desc:
      'Wzbogacamy doświadczenia kibiców o narracje danych w czasie rzeczywistym i inteligentne narzędzia medialne.',

    // How we work pillars + body
    howWeWorkPillar1Title: 'Interdyscyplinarne zespoły',
    howWeWorkPillar1Desc:
      'Inżynierowie, analitycy, projektanci i specjaliści sportu pracujący nad tymi samymi problemami.',
    howWeWorkPillar2Title: 'Szybkie prototypowanie',
    howWeWorkPillar2Desc:
      'Pomysły stają się testowalnymi prototypami w ciągu tygodni, nie miesięcy. Wydajemy, żeby się uczyć.',
    howWeWorkPillar3Title: 'Decyzje oparte na danych',
    howWeWorkPillar3Desc: 'Każda hipoteza jest zakorzeniona w prawdziwych danych sportowych. Mierzymy to, co ważne.',
    howWeWorkPillar4Title: 'Domena Sportu i AI',
    howWeWorkPillar4Desc: 'Głęboka wiedza sportowa połączona z praktyczną ekspertyzą AI — obie strony mają znaczenie.',
    howWeWorkBody:
      'Działamy jako interdyscyplinarne laboratorium badań stosowanych na uczelni — łącząc akademicką rzetelność ze startupową szybkością.',

    // Project status labels (shared: homepage section + projects page)
    statusPrototype: 'Prototyp',
    statusInResearch: 'W badaniu',
    statusExperimental: 'Eksperymentalny',
    statusInternalTool: 'Narzędzie wewnętrzne',

    // Homepage project cards (short descriptions)
    projectMotionTrackDesc:
      'Śledzenie zawodników w czasie rzeczywistym i analiza ruchu z materiałów wideo przy użyciu estymacji pozy.',
    projectCoachLensDesc:
      'Wsparcie trenerskie asystowane przez AI, wydobywające wzorce i anomalie z danych sesji treningowych.',
    projectSportsGraphDesc:
      'Graf wiedzy łączący zawodników, zdarzenia i statystyki na potrzeby semantycznego wyszukiwania sportowego.',
    projectLiveStatsDesc: 'Potok danych meczowych agregujący i normalizujący strumienie zdarzeń z wielu źródeł.',

    // Projects page (full descriptions)
    projectMotionTrackDescFull:
      'Śledzenie zawodników w czasie rzeczywistym i analiza ruchu z materiałów wideo przy użyciu estymacji pozy i przepływu optycznego.',
    projectCoachLensDescFull:
      'System wsparcia trenerskiego asystowany przez AI, wydobywający wzorce i anomalie z danych i notatek z sesji treningowych.',
    projectSportsGraphDescFull:
      'Graf wiedzy łączący zawodników, zawody, zdarzenia i statystyki na potrzeby semantycznego odpytywania danych sportowych.',
    projectLiveStatsDescFull:
      'Potok danych meczowych agregujący, normalizujący i serwujący strumienie zdarzeń z wielu źródeł danych.',
    projectsComingSoon: 'Kolejne projekty i case study są w drodze.',
    projectsFollowGithub: 'Śledź nasze GitHub, aby być na bieżąco.',

    // Contact extras
    contactLocationLabel: 'Lokalizacja',
    contactJoinLabel: 'Chcesz dołączyć?',
    contactJoinDesc: 'Zawsze szukamy ciekawskich twórców — inżynierów, analityków, projektantów i specjalistów sportu.'
  }
} satisfies Record<Lang, Record<string, string>>;

export function isLang(x: string): x is Lang {
  return (languages as readonly string[]).includes(x);
}

export function t(lang: Lang, key: keyof (typeof dict)['en']) {
  return dict[lang][key];
}
