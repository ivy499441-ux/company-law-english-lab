import type { TopicCourse } from "./data/topic-course-personality";

export type QuizAttempt = {
  id: string;
  submittedAt: string;
  score: number;
  answers: Record<string, string[]>;
};

export type CourseProgress = {
  startedAt: string | null;
  completedAt: string | null;
  currentUnitId: string;
  completedUnitIds: string[];
  issueChoice: string;
  termIndex: number;
  reviewedTermIds: string[];
  viewedMapRouteIds: string[];
  routeId: string;
  viewedRuleRouteIds: string[];
  paragraphIndex: number;
  viewedParagraphs: number[];
  caseAnswer: string;
  caseSubmitted: boolean;
  quizIndex: number;
  quizAnswers: Record<string, string[]>;
  submittedQuiz: string[];
  quizAttempts: QuizAttempt[];
};

export type TopicLearningStore = {
  version: 3;
  courses: Record<string, CourseProgress>;
};

export type CourseStatus = "not-started" | "in-progress" | "completed";

export function createCourseProgress(course: TopicCourse): CourseProgress {
  return {
    startedAt: null,
    completedAt: null,
    currentUnitId: course.units[0].id,
    completedUnitIds: [],
    issueChoice: "",
    termIndex: 0,
    reviewedTermIds: [],
    viewedMapRouteIds: [],
    routeId: course.ruleRoutes[0]?.id || "",
    viewedRuleRouteIds: [],
    paragraphIndex: 0,
    viewedParagraphs: [],
    caseAnswer: "",
    caseSubmitted: false,
    quizIndex: 0,
    quizAnswers: {},
    submittedQuiz: [],
    quizAttempts: [],
  };
}

export function normalizeCourseProgress(course: TopicCourse, value?: Partial<CourseProgress>): CourseProgress {
  const clean = { ...createCourseProgress(course), ...value };
  clean.completedUnitIds = Array.isArray(value?.completedUnitIds) ? [...new Set(value.completedUnitIds)] : [];
  clean.reviewedTermIds = Array.isArray(value?.reviewedTermIds) ? [...new Set(value.reviewedTermIds)] : [];
  clean.viewedMapRouteIds = Array.isArray(value?.viewedMapRouteIds) ? [...new Set(value.viewedMapRouteIds)] : [];
  clean.viewedRuleRouteIds = Array.isArray(value?.viewedRuleRouteIds) ? [...new Set(value.viewedRuleRouteIds)] : [];
  clean.viewedParagraphs = Array.isArray(value?.viewedParagraphs) ? [...new Set(value.viewedParagraphs)] : [];
  clean.submittedQuiz = Array.isArray(value?.submittedQuiz) ? [...new Set(value.submittedQuiz)] : [];
  clean.quizAttempts = Array.isArray(value?.quizAttempts) ? value.quizAttempts : [];
  clean.quizAnswers = value?.quizAnswers && typeof value.quizAnswers === "object" ? value.quizAnswers : {};
  if (!course.units.some((unit) => unit.id === clean.currentUnitId)) clean.currentUnitId = course.units[0].id;
  return clean;
}

export function answersMatch(actual: string[], expected: string[]) {
  const left = [...actual].sort();
  const right = [...expected].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function calculateQuizScore(course: TopicCourse, answers: Record<string, string[]>) {
  return course.quiz.reduce((total, question) => {
    const expected = question.choices.filter((choice) => choice.correct).map((choice) => choice.id);
    return total + (answersMatch(answers[question.id] || [], expected) ? 1 : 0);
  }, 0);
}

export function finalizeProgress(course: TopicCourse, value: CourseProgress): CourseProgress {
  const completedUnitIds = [...new Set(value.completedUnitIds)];
  const fullyCompleted = course.units.every((unit) => completedUnitIds.includes(unit.id));
  return {
    ...value,
    completedUnitIds,
    completedAt: fullyCompleted ? value.completedAt || new Date().toISOString() : value.completedAt,
  };
}

export function markUnitComplete(course: TopicCourse, value: CourseProgress, unitId: string) {
  return finalizeProgress(course, { ...value, completedUnitIds: [...value.completedUnitIds, unitId] });
}

export function getCourseStatus(progress: CourseProgress): CourseStatus {
  if (progress.completedAt) return "completed";
  if (progress.startedAt || progress.completedUnitIds.length) return "in-progress";
  return "not-started";
}

export function getBestScore(progress: CourseProgress) {
  return progress.quizAttempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);
}
