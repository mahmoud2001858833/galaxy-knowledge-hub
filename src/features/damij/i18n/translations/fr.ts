import { DamijDict } from '../types';
export const fr: DamijDict = {
  nav: { home: 'Accueil', sign: 'Signes', sensory: 'Sensoriel', autism: 'Autisme', adhd: 'TDAH', braille: 'Braille', clinical: 'Labo', carbon: 'Carbon', show: 'Afficher', hide: 'Masquer' },
  hero: { badge: 'Damij — Éducation inclusive et diagnostic intelligent', title: 'Damij', tagline: 'Un sens alternatif, une chance égale, la science sans barrières',
    desc: 'Six piliers intégrés pour chaque enfant : traducteur universel de langue des signes, Pont sensoriel inversé, diagnostic ludique de l’autisme et du TDAH, traducteur Braille mondial, et laboratoire de simulation clinique.',
    cta: 'Commencer', chips: ['Inclusif', 'Intelligent', 'Fondé sur la science', '15 langues'] },
  sections: {
    sign: { title: 'Traducteur de langue des signes', desc: 'Signes ↔ texte/voix dans 100+ langues et 6 systèmes mondiaux.' },
    sensory: { title: 'Pont sensoriel inversé ⭐', desc: 'Téléchargez tout contenu et convertissez-le vers le sens disponible de l’élève.' },
    autism: { title: 'Autisme — Diagnostic par le jeu', desc: 'Évaluation et thérapie selon DSM-5, M-CHAT-R et ADOS-2.' },
    adhd: { title: 'TDAH — Attention & contrôle', desc: 'Dépistage différentiel et exercices Stroop/N-Back/CPT gamifiés.' },
    braille: { title: 'Braille universel', desc: 'Texte ⟷ Braille pour toutes langues, OCR et leçons interactives.' },
    clinical: { title: 'Laboratoire de simulation clinique', desc: 'Environnement virtuel pour la recherche et les protocoles cliniques.' },
  },
  sources: { title: 'Basé sur des sources scientifiques reconnues', desc: 'DSM-5-TR · M-CHAT-R · ADOS-2 · Conners-3 · WHO ICF-CY · UNESCO · Unicode Braille · WFD', cta: 'Voir les références' },
  loader: { loading: 'Chargement...', preparing: 'Préparation de votre expérience...' },
  assistant: { title: 'Guide intelligent Damij', subtitle: 'Connaît toutes les sections et vous y emmène', placeholder: 'Posez une question sur la plateforme...',
    welcome: 'Bonjour ! Je suis votre guide intelligent sur Damij. Comment puis-je aider ?',
    send: 'Envoyer', listen: 'Parler', open: 'Ouvrir le guide', close: 'Fermer', navigate: 'Emmène-moi là-bas', thinking: 'Réfléchit...', error: 'Impossible de joindre le guide.',
    suggestions: ['Comment utiliser le traducteur de signes ?', 'Qu’est-ce que le Pont sensoriel inversé ?', 'Va aux jeux de diagnostic autisme', 'Explique-moi le Braille'] },
  langSwitch: { label: 'Langue', search: 'Rechercher une langue...' },
  footer: 'Plateforme créée par l’École secondaire Anaba pour garçons',
};
