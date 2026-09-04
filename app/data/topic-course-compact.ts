import lawData from "./company-law.json";
import { createTopicCourse } from "./topic-course-builder";
import type { BilingualText, Choice, QuizItem, StatutoryParagraph, TopicCourse, TopicTerm } from "./topic-course-personality";

export const b = (en: string, zh: string): BilingualText => ({ en, zh });

type Tone = StatutoryParagraph["focusExpressions"][number]["tone"];
type TermSeed = [english: string, chinese: string, definitionEn: string, article: number, collocation?: string, tier?: TopicTerm["tier"]];
type RouteSeed = {
  id: string;
  title: BilingualText;
  articleLabel: string;
  steps: Array<[labelEn: string, labelZh: string, contentEn: string, contentZh: string]>;
  formula: BilingualText;
};
type StatuteSeed = {
  article: number;
  routeId: string;
  heading: BilingualText;
  translation: string;
  focus: Array<[en: string, zh: string, tone: Tone]>;
};
type QuizSeed = Omit<QuizItem, "reviewUnitId">;

type CompactCourseSeed = {
  id: string;
  order: number;
  title: BilingualText;
  primaryArticles: number[];
  supportingArticles: number[];
  duration?: [number, number];
  difficulty?: TopicCourse["difficulty"];
  objectives: BilingualText[];
  mapInstruction: BilingualText;
  opening: { heading: BilingualText; facts: string; choices: Choice[]; explanation: BilingualText };
  anchors: {
    foundations: Array<{ article: number; title: BilingualText; rule: BilingualText }>;
    core: { article: number; title: BilingualText; rule: BilingualText };
  };
  terms: TermSeed[];
  routes: RouteSeed[];
  statutes: StatuteSeed[];
  caseStudy: {
    title: BilingualText;
    label: string;
    facts: string;
    evidence: string[];
    writingHint: string;
    placeholder: string;
    modelAnswer: string;
  };
  quiz: QuizSeed[];
  navigation: { article: number; chapter: number };
};

type LawRecord = { number: number; chinese: string };
const articles = (lawData as { articles: LawRecord[] }).articles;

function authoritativeText(article: number) {
  const record = articles.find((item) => item.number === article);
  if (!record) throw new Error(`Missing Company Law Article ${article}`);
  return record.chinese;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function defineTopicCourse(seed: CompactCourseSeed): TopicCourse {
  const terms: TopicTerm[] = seed.terms.map(([english, chinese, definitionEn, article, collocation, tier], index) => ({
    id: `${seed.id}-term-${index + 1}`,
    term: english,
    chinese,
    definitionEn,
    definitionZh: `本专题中指“${chinese}”的法定概念或判断用语。`,
    collocation: collocation || `${english} under Article ${article}`,
    example: `The analysis should identify ${english} under Article ${article}.`,
    articleRefs: [article],
    tier: tier || (index < 6 ? "must-know" : index === 6 ? "evidence" : "recognition"),
  }));

  return createTopicCourse({
    id: seed.id,
    order: seed.order,
    title: seed.title,
    primaryArticles: seed.primaryArticles,
    supportingArticles: seed.supportingArticles,
    durationMinutes: seed.duration || [30, 40],
    difficulty: seed.difficulty || "application",
    objectives: seed.objectives,
    mapInstruction: seed.mapInstruction,
    openingIssue: seed.opening,
    conceptMap: {
      defaultRules: seed.anchors.foundations.map((item, index) => ({ id: `${seed.id}-foundation-${index + 1}`, ...item })),
      exception: { id: `${seed.id}-core`, ...seed.anchors.core },
      routes: seed.routes.map((route) => ({ id: route.id, title: route.title, summary: route.formula })),
    },
    terms,
    ruleRoutes: seed.routes.map((route, index) => ({
      id: route.id,
      articleParagraph: (index + 1) as 1 | 2 | 3,
      articleLabel: route.articleLabel,
      title: route.title,
      blocks: route.steps.map(([labelEn, labelZh, contentEn, contentZh], stepIndex) => ({ id: `${route.id}-${slug(labelEn) || stepIndex + 1}`, label: b(labelEn, labelZh), content: b(contentEn, contentZh) })),
      formula: route.formula,
    })),
    statute: seed.statutes.map((item, index) => ({
      paragraph: index + 1,
      article: item.article,
      citation: `Article ${item.article}`,
      routeId: item.routeId,
      heading: item.heading,
      chineseAuthoritative: authoritativeText(item.article),
      courseTranslation: item.translation,
      focusExpressions: item.focus.map(([en, zh, tone]) => ({ en, zh, tone })),
    })),
    caseStudy: {
      title: seed.caseStudy.title,
      label: seed.caseStudy.label,
      facts: seed.caseStudy.facts,
      evidencePrompt: "Which facts determine the statutory route?",
      evidenceRanking: seed.caseStudy.evidence.map((fact, index) => ({ rank: index + 1, fact, weight: index < 2 ? "strong" : "supporting" })),
      writingPrompt: "Write a 50–90 word legal conclusion",
      writingHint: seed.caseStudy.writingHint,
      answerPlaceholder: seed.caseStudy.placeholder,
      minimumWords: 25,
      modelAnswer: seed.caseStudy.modelAnswer,
    },
    quiz: seed.quiz,
    navigation: seed.navigation,
  });
}

export const single = (id: string, objective: string, promptEn: string, promptZh: string, choices: Array<[string, boolean]>, explanationEn: string, explanationZh: string): QuizSeed => ({
  id,
  type: "single",
  objective,
  prompt: b(promptEn, promptZh),
  choices: choices.map(([text, correct], index) => ({ id: String.fromCharCode(97 + index), text, correct })),
  explanation: b(explanationEn, explanationZh),
  errorTag: `${id}-error`,
});

export const multiple = (id: string, objective: string, promptEn: string, promptZh: string, choices: Array<[string, boolean]>, explanationEn: string, explanationZh: string): QuizSeed => ({
  ...single(id, objective, promptEn, promptZh, choices, explanationEn, explanationZh),
  type: "multiple",
});
