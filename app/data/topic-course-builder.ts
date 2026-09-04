import type {
  BilingualText,
  Choice,
  QuizItem,
  RuleRoute,
  StatutoryParagraph,
  TopicCourse,
  TopicTerm,
} from "./topic-course-personality";

type SimpleRuleRoute = Omit<RuleRoute, "feedback">;
type SimpleQuiz = Omit<QuizItem, "reviewUnitId">;

type CourseInput = {
  id: string;
  order: number;
  title: BilingualText;
  primaryArticles: number[];
  supportingArticles: number[];
  durationMinutes: [number, number];
  difficulty: TopicCourse["difficulty"];
  objectives: BilingualText[];
  mapInstruction: BilingualText;
  openingIssue: {
    heading: BilingualText;
    facts: string;
    choices: Choice[];
    explanation: BilingualText;
  };
  conceptMap: TopicCourse["conceptMap"];
  terms: TopicTerm[];
  ruleRoutes: SimpleRuleRoute[];
  statute: StatutoryParagraph[];
  caseStudy: {
    title: BilingualText;
    facts: string;
    evidenceRanking: TopicCourse["caseStudy"]["evidenceRanking"];
    modelAnswer: string;
    label: string;
    evidencePrompt: string;
    writingPrompt: string;
    writingHint: string;
    answerPlaceholder: string;
    minimumWords?: number;
  };
  quiz: SimpleQuiz[];
  navigation: NonNullable<TopicCourse["navigation"]>;
};

export function createTopicCourse(input: CourseInput): TopicCourse {
  const unit = (suffix: string) => `${input.id}-${suffix}`;
  return {
    id: input.id,
    order: input.order,
    lawAsOf: "2026-08-24",
    title: input.title,
    primaryArticles: input.primaryArticles,
    supportingArticles: input.supportingArticles,
    durationMinutes: input.durationMinutes,
    difficulty: input.difficulty,
    languageMode: "english-first",
    disclaimer: {
      en: "Course English is an original study aid. The imported statute remains the local reference text.",
      zh: "课程英文为原创学习文本；导入的英文法条仍作为本地参考译本。",
    },
    objectives: input.objectives,
    mapInstruction: input.mapInstruction,
    openingIssue: {
      ...input.openingIssue,
      prompt: { en: "Choose the best preliminary answer.", zh: "选择最准确的初步判断。" },
    },
    conceptMap: input.conceptMap,
    terms: input.terms,
    ruleRoutes: input.ruleRoutes.map((route) => ({ ...route, feedback: {} })),
    statute: input.statute,
    precisionNotes: [],
    highlightMap: [],
    caseStudy: {
      id: `${input.id}-case`,
      ...input.caseStudy,
      tasks: [],
      variant: {
        title: { en: "Variation", zh: "变体" },
        facts: "",
        question: { en: "How would the result change?", zh: "结论将如何变化？" },
        answer: { en: "Return to the statutory elements.", zh: "应重新核对法定要件。" },
      },
    },
    quiz: input.quiz.map((question) => ({ ...question, reviewUnitId: unit("rule") })),
    finalRecall: { prompts: [], answers: [] },
    units: [
      { id: unit("issue"), order: 1, type: "issue", title: { en: "Issue", zh: "问题导入" }, eyebrow: "ISSUE", purpose: { en: "Identify the legal question before choosing a rule.", zh: "先识别法律问题，再选择规则。" }, completionRule: "answer" },
      { id: unit("map"), order: 2, type: "map", title: { en: "Concept Map", zh: "规则地图" }, eyebrow: "MAP", purpose: { en: "See how the rules connect.", zh: "看清规则之间的连接。" }, completionRule: "visit-routes" },
      { id: unit("vocabulary"), order: 3, type: "vocabulary", title: { en: "Core Vocabulary", zh: "核心术语" }, eyebrow: "TERMS", purpose: { en: "Retain the English needed to state the rule.", zh: "掌握表达规则所需的英语。" }, completionRule: "review-core-terms" },
      { id: unit("rule"), order: 4, type: "rule-builder", title: { en: "Rule Builder", zh: "规则构建" }, eyebrow: "RULE", purpose: { en: "Build the elements, procedure and consequence.", zh: "搭建要件、程序和后果。" }, completionRule: "visit-routes" },
      { id: unit("statute"), order: 5, type: "statute", title: { en: "Statutory Language", zh: "法条精读" }, eyebrow: "STATUTE", purpose: { en: "Connect the legal test with statutory language.", zh: "把法律判断与法条语言对应起来。" }, completionRule: "visit-statutes" },
      { id: unit("case"), order: 6, type: "case", title: { en: "Apply the Rule", zh: "案例适用" }, eyebrow: "CASE", purpose: { en: "Apply the rule to a short fact pattern.", zh: "把规则适用于简短事实。" }, completionRule: "submit-analysis" },
      { id: unit("review"), order: 7, type: "review", title: { en: "Check & Review", zh: "检测复习" }, eyebrow: "REVIEW", purpose: { en: "Test the distinctions that determine the result.", zh: "检测真正影响结论的规则区分。" }, completionRule: "pass-quiz" },
    ],
    completion: {
      passingScore: Math.max(3, input.quiz.length - 1),
      totalQuestions: input.quiz.length,
      message: { en: "The course is complete. Re-entering keeps your answers for review.", zh: "专题已完成；重新进入时保留原答案供复习。" },
      nextActions: [],
    },
    authorityNotes: [{ id: "statute", label: "2023 PRC Company Law", note: { en: "Checked against the local Chinese statute dataset.", zh: "已与本地现行中文法条数据核对。" } }],
    navigation: input.navigation,
  };
}
