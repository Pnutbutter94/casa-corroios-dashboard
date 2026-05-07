const QUOTES = [
  "A persistência é o caminho do êxito. — Charles Chaplin",
  "O sucesso nasce do querer, da determinação e persistência. — Ayrton Senna",
  "Grandes realizações são possíveis quando se dá importância aos pequenos começos.",
  "A melhor forma de prever o futuro é criá-lo. — Peter Drucker",
  "Não é sobre ter tempo, é sobre fazer tempo.",
  "Cada dia é uma nova oportunidade de mudar a tua vida.",
  "O investimento em conhecimento paga os melhores juros. — Benjamin Franklin",
  "A jornada de mil milhas começa com um único passo. — Lao Tsé"
];

export function getQuote() {
  return QUOTES[new Date().getDate() % QUOTES.length];
}
