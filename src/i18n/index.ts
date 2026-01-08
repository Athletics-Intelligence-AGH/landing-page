export const languages = ['en', 'pl'] as const;
export type Lang = (typeof languages)[number];

export const defaultLang: Lang = 'en';

const dict = {
  en: {
    heroHeader: 'Introduce AI into Sports',
    heroDescription:
      'We bring builders, analysts, and creatives together to shape the future of sport with AI. Hands-on projects. Thoughtful experimentation. Real outcomes—crafted by students.',
    joinCtaHeader: 'Want join us?',
    joinCtaDescription: 'Fill up the form and sign up to our team.',
    joinButton: 'Fill up form',
    navAbout: 'About Us',
    navContact: 'Contact',
    langEN: '🇬🇧',
    langPL: '🇵🇱',
    aboutHeader: 'Empowering the sport with AI.',
    aboutSubHeader: 'Get to know our members.',
    aboutLongerDescription:
      'We bring together students who believe the future of sport is data-driven. Our mission is to develop responsible AI that improves performance, supports smarter coaching, and unlocks new ways for fans to experience the game. We run project teams, workshops, and partnerships that turn curiosity into working prototypes.',
    supervisorsTeamGroup: 'Supervisors',
    managementTeamGroup: 'Management',
    contactHeader: 'Contact',
    contactSubHeader: 'Feel free to reach us.',
    contactFormHeader: 'Contact AGH Athletics Intelligence',
    contactFormDescription: 'Have something to say? Send us an email.',
    notFound: 'Page not found.',
    presidentTitle: 'President',
    vicePresidentTitle: 'Vice President',
    supervisorTitle: 'Supervisor SKN',
    academicSupervisorTitle: 'Academic Supervisor SKN'
  },
  pl: {
    heroHeader: 'Wdrażamy AI w Sporcie',
    heroDescription:
      'Łączymy inżynierów, analityków i twórców, aby wspólnie kształtować przyszłość sportu dzięki sztucznej inteligencji. Praktyczne projekty. Przemyślane eksperymenty. Rzeczywiste wyniki — tworzone przez studentów.',
    joinCtaHeader: 'Chcesz do nas dołączyć?',
    joinCtaDescription: 'Wypełnij formularz i zapisz się do naszego zespołu.',
    joinButton: 'Wypełnij formularz',
    navAbout: 'O nas',
    navContact: 'Kontakt',
    langEN: '🇬🇧',
    langPL: '🇵🇱',
    aboutHeader: 'O nas',
    aboutSubHeader: 'Poznaj nasz zespół.',
    aboutLongerDescription:
      'Zrzeszamy studentów, którzy wierzą, że przyszłość sportu opiera się na danych. Naszą misją jest opracowanie odpowiedzialnej sztucznej inteligencji, która poprawia wyniki, wspiera inteligentniejsze treningi i otwiera przed kibicami nowe możliwości doświadczania meczów. Prowadzimy zespoły projektowe, warsztaty i partnerstwa, które przekształcają ciekawość w działające prototypy.',
    supervisorsTeamGroup: 'Opiekunowie',
    managementTeamGroup: 'Zarząd',
    contactHeader: 'Kontakt',
    contactSubHeader: 'Zapraszamy do kontaktu.',
    contactFormHeader: 'Kontakt AGH Athletics Intelligence',
    contactFormDescription: 'Chcesz się czegoś dowiedzieć? Wyślij nam maila.',
    notFound: 'Nie znaleziono strony.',
    presidentTitle: 'Prezes',
    vicePresidentTitle: 'Wiceprezes',
    supervisorTitle: 'Opiekun SKN',
    academicSupervisorTitle: 'Opiekun naukowy SKN'
  }
} satisfies Record<Lang, Record<string, string>>;

export function isLang(x: string): x is Lang {
  return (languages as readonly string[]).includes(x);
}

export function t(lang: Lang, key: keyof (typeof dict)['en']) {
  return dict[lang][key];
}
