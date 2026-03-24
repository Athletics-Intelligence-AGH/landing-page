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
    howWeWorkSubHeader: 'A research and prototyping lab embedded in sport.'
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
    howWeWorkSubHeader: 'Laboratorium badawcze i prototypowe zintegrowane ze sportem.'
  }
} satisfies Record<Lang, Record<string, string>>;

export function isLang(x: string): x is Lang {
  return (languages as readonly string[]).includes(x);
}

export function t(lang: Lang, key: keyof (typeof dict)['en']) {
  return dict[lang][key];
}
