// Clicking-Fragenkatalog nach Mario Pricken
// 40 Denkstrategien mit jeweils mehreren Fragen

export interface ThinkingStrategy {
  id: string;
  name: string;
  description: string;
  questions: string[];
  category: 'visual' | 'verbal' | 'conceptual' | 'structural';
}

export const CLICKING_STRATEGIES: ThinkingStrategy[] = [
  {
    id: 'ohne_worte',
    name: 'Ohne Worte',
    description: 'Produktvorteil rein visuell darstellen',
    category: 'visual',
    questions: [
      'Wie lässt sich der Produktvorteil ohne Worte darstellen?',
      'In welcher Szene kann man den Benefit ohne Worte vermitteln?',
      'Wie kann ein einziges Bild den Benefit darstellen?',
      'Wie könnte ein Stummfilm den Produktvorteil vermitteln?'
    ]
  },
  {
    id: 'kombinieren',
    name: 'Kombinieren und Verbinden',
    description: 'Elemente verbinden für neue Perspektiven',
    category: 'conceptual',
    questions: [
      'Womit kann man das Produkt kombinieren, um den USP deutlicher zu kommunizieren?',
      'Eine Mischung versuchen? Eine Collage machen?',
      'Wie lassen sich Problem und Lösung verknüpfen?',
      'Mehrere Objekte zu einem verbinden?'
    ]
  },
  {
    id: 'vergleich',
    name: 'Vergleichende Gegenüberstellung',
    description: 'Vorher/Nachher oder Kontraste nutzen',
    category: 'visual',
    questions: [
      'Welcher Vorher/Nachher-Vergleich könnte den Nutzen unterstreichen?',
      'Womit kann man das Produkt vergleichen?',
      'Wie könnte eine vergleichende Gegenüberstellung die Problemsituation auf überraschende Weise darstellen?',
      'Vergleich mit etwas aus einem völlig anderen Bereich?'
    ]
  },
  {
    id: 'uebertreibung',
    name: 'Übertreibung',
    description: 'Produkteigenschaften ins Extrem steigern',
    category: 'visual',
    questions: [
      'Was könnte man übertreiben: Grösser? Länger? Schwerer?',
      'Die Anzahl vervielfachen? Ins Unermessliche steigern?',
      'Was könnte man extrem reduzieren: Kompakter? Leichter?',
      'Einzelteile darstellen und übertreiben?'
    ]
  },
  {
    id: 'drehung_180',
    name: 'Drehung um 180 Grad',
    description: 'Gewohntes ins Gegenteil verkehren',
    category: 'conceptual',
    questions: [
      'Den Produktvorteil ins Gegenteil verkehren?',
      'Das Negative statt dem Positiven zeigen?',
      'Die Rollen vertauschen?',
      'Ursache und Wirkung verkehren?'
    ]
  },
  {
    id: 'metapher',
    name: 'Metapher und Analogie',
    description: 'Vergleiche aus Natur und Technik',
    category: 'conceptual',
    questions: [
      'Welche Metapher aus Natur und Technik passt: Unser Produkt ist so wie...?',
      'Was hat ein ähnliches Prinzip?',
      'Welche Parallelen lassen sich ziehen?',
      'Vergleich mit etwas Vertrautem, um den Nutzen einleuchten zu lassen?'
    ]
  },
  {
    id: 'perspektivwechsel',
    name: 'Perspektivwechsel',
    description: 'Andere Blickwinkel einnehmen',
    category: 'conceptual',
    questions: [
      'Wie sieht das Produkt aus der Sicht eines Kindes aus?',
      'Perspektive eines Haustieres? Eines Konkurrenten?',
      'Makro- oder Mikroperspektive?',
      'Aus der Sicht des Produkts selbst?'
    ]
  },
  {
    id: 'zeitlinie',
    name: 'Wirkung der Zeit',
    description: 'Lebenszyklus des Produkts nutzen',
    category: 'structural',
    questions: [
      'Wie wird das Produkt die Zukunft verändern?',
      'Wie wurde das Problem früher gelöst?',
      'Welche historischen Ereignisse passen zum Produkt?',
      'Was passiert nach dem Kauf? Die Toilette danach?'
    ]
  },
  {
    id: 'sinneskanaele',
    name: 'Sinneskanäle',
    description: 'Andere Sinne als Sehen nutzen',
    category: 'conceptual',
    questions: [
      'Wie könnte man es hörbar machen?',
      'Wie könnte es spürbar werden?',
      'Gibt es einen Geruch oder Geschmack?',
      'Akustische oder haptische Elemente?'
    ]
  },
  {
    id: 'geschichten',
    name: 'Geschichten ums Produkt',
    description: 'Alltagssituationen dramatisieren',
    category: 'conceptual',
    questions: [
      'In welcher Geschichte wird das Produkt zum Helden?',
      'In welcher Situation zum Star oder Retter?',
      'Welcher Stil passt: Thriller, Komödie, Drama?',
      'Wann bringt es zum Lachen?'
    ]
  },
  {
    id: 'provokation',
    name: 'Provokation und Schock',
    description: 'Aufmerksamkeit durch Tabubruch',
    category: 'verbal',
    questions: [
      'Was wurde noch nie gezeigt?',
      'Was würde sich keiner trauen zu sagen?',
      'Welche Tabubrüche sind möglich?',
      'Wie könnte man daraus einen Skandal machen?'
    ]
  },
  {
    id: 'doppeldeutig',
    name: 'Doppeldeutig',
    description: 'Wortspiele und Mehrdeutigkeiten',
    category: 'verbal',
    questions: [
      'Welche doppeldeutigen Wortspiele stecken im Produkt?',
      'Wie müsste ein doppeldeutiges Bild aussehen?',
      'Sprachliche Doppeldeutigkeiten in Claims?',
      'Anrüchig, provokant oder verspielt?'
    ]
  },
  {
    id: 'reframing',
    name: 'Reframing',
    description: 'Rahmen wechseln für neue Bedeutung',
    category: 'conceptual',
    questions: [
      'Gibt es einen grösseren Rahmen für den Kontext?',
      'Wo bekommen scheinbar negative Aspekte positive Bedeutung?',
      'Ein neues Etikett mit positiven Nebenbedeutungen?',
      'Welcher Kontext überrascht oder verblüfft?'
    ]
  },
  {
    id: 'woertlich_nehmen',
    name: "Nimm's wörtlich",
    description: 'Redewendungen buchstäblich umsetzen',
    category: 'verbal',
    questions: [
      'Welche Bilder entstehen bei wörtlicher Umsetzung von Produktbeschreibungen?',
      'Welche Redewendungen können wörtlich genommen werden?',
      'Welche Metaphern buchstäblich in Bilder wandeln?',
      'Umgangssprachliche Ausdrücke wörtlich übersetzen?'
    ]
  },
  {
    id: 'symbol',
    name: 'Symbole und Zeichen',
    description: 'Visuelle Zeichensprache nutzen',
    category: 'visual',
    questions: [
      'Welche Symbole oder Zeichen vereinfachen die Darstellung?',
      'Gibt es Zeichen, die durch Abwandlung neue Bedeutung erhalten?',
      'Welche Zeichensprache passt zur Botschaft?',
      'Symbole kombinieren für neue Bedeutung?'
    ]
  }
];

// Zielformulierungs-Templates nach Pricken
export const GOAL_FORMULATION_TEMPLATES = [
  {
    type: 'standard',
    template: 'Wie können wir in einer Kampagne vermitteln, dass [PRODUKT] [EIGENSCHAFT] bietet?',
    example: 'Wie können wir vermitteln, dass das neue Objektiv das robusteste ist?'
  },
  {
    type: 'benefit_focused',
    template: 'Wie können wir darstellen, dass [PRODUKT] [KONKRETEN BENEFIT] bietet?',
    example: 'Wie können wir darstellen, dass das Objektiv die höchste Stossfestigkeit bietet?'
  },
  {
    type: 'provocative',
    template: 'Wie können wir auf provokante Weise darstellen, dass [PRODUKT] [BENEFIT] bietet?',
    example: 'Wie können wir provokant zeigen, dass das Objektiv stossfest ist?'
  },
  {
    type: 'medium_focused',
    template: 'Wie könnte [MEDIUM] für den Empfänger erlebbar machen, dass [PRODUKT] [BENEFIT] bietet?',
    example: 'Wie könnte ein Direct Mail erlebbar machen, dass das Objektiv stossfest ist?'
  }
];

// Kriterien für optimale Zielformulierung
export const GOAL_CRITERIA = [
  'Enthält eine Single-Minded-Proposition',
  'Kein "und" verwenden',
  'Als Frage formulieren',
  'Kurz und bündig',
  'Für 12-Jährige verständlich',
  'Keine Fremdwörter oder Fachbegriffe',
  'Vom Kunden akzeptierbar'
];
