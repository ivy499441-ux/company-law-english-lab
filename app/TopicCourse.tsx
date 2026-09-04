"use client";

import { useEffect, useMemo, useState } from "react";
import personalityCourseSource, { type TopicCourse as TopicCourseData } from "./data/topic-course-personality";
import capitalCourse from "./data/topic-course-capital";
import resolutionsCourse from "./data/topic-course-resolutions";
import dutiesCourse from "./data/topic-course-duties";
import batch2Courses from "./data/topic-courses-batch2";
import batch3Courses from "./data/topic-courses-batch3";
import batch4Courses from "./data/topic-courses-batch4";
import batch5Courses from "./data/topic-courses-batch5";
import batch6Courses from "./data/topic-courses-batch6";
import batch7Courses from "./data/topic-courses-batch7";
import {
  answersMatch,
  calculateQuizScore,
  finalizeProgress,
  getBestScore,
  getCourseStatus,
  markUnitComplete,
  normalizeCourseProgress,
  type CourseProgress,
  type TopicLearningStore,
} from "./topic-learning-state";

type Props = {
  onOpenArticle: (number: number, origin: TopicArticleOrigin) => void;
  onOpenChapter: (number: number) => void;
  resumeRequest?: TopicResumeRequest | null;
  onClearResume?: () => void;
};

export type TopicArticleOrigin = {
  courseId: string;
  courseLabel: string;
  unitId: string;
  unitLabel: string;
};

export type TopicResumeRequest = {
  courseId: string;
  unitId: string;
  token: number;
};

type LegacyState = {
  currentUnit?: number;
  highestUnit?: number;
  issueChoice?: string;
  termIndex?: number;
  routeId?: string;
  paragraphIndex?: number;
  caseAnswer?: string;
  quizIndex?: number;
  quizAnswers?: Record<string, string[]>;
  submittedQuiz?: string[];
};

const storageKey = "company-law-topic-learning-v3";
const legacyStorageKey = "company-law-topic-personality-v2";
const personalityCourse = personalityCourseSource as unknown as TopicCourseData;
const topicCourses: TopicCourseData[] = [
  personalityCourse,
  capitalCourse,
  resolutionsCourse,
  dutiesCourse,
  ...batch2Courses,
  ...batch3Courses,
  ...batch4Courses,
  ...batch5Courses,
  ...batch6Courses,
  ...batch7Courses,
].sort((a, b) => a.order - b.order);
const initialStore: TopicLearningStore = { version: 3, courses: {} };

function unitIdByType(courseData: TopicCourseData, type: TopicCourseData["units"][number]["type"]) {
  return courseData.units.find((unit) => unit.type === type)?.id || "";
}

function migrateLegacyProgress(courseData: TopicCourseData, legacy: LegacyState): CourseProgress {
  const highestUnit = Math.max(1, Math.min(courseData.units.length, legacy.highestUnit || 1));
  const currentUnit = Math.max(1, Math.min(courseData.units.length, legacy.currentUnit || 1));
  const completedUnitIds = courseData.units.filter((unit) => unit.order < highestUnit).map((unit) => unit.id);
  const quizAnswers = legacy.quizAnswers || {};
  const submittedQuiz = Array.isArray(legacy.submittedQuiz) ? legacy.submittedQuiz : [];
  const score = calculateQuizScore(courseData, quizAnswers);
  const allQuizSubmitted = courseData.quiz.every((question) => submittedQuiz.includes(question.id));
  if (legacy.issueChoice) completedUnitIds.push(unitIdByType(courseData, "issue"));
  if (allQuizSubmitted && score >= courseData.completion.passingScore) completedUnitIds.push(unitIdByType(courseData, "review"));
  const migrated = normalizeCourseProgress(courseData, {
    startedAt: new Date().toISOString(),
    currentUnitId: courseData.units[currentUnit - 1].id,
    completedUnitIds,
    issueChoice: legacy.issueChoice || "",
    termIndex: Math.max(0, Math.min(courseData.terms.length - 1, legacy.termIndex || 0)),
    reviewedTermIds: highestUnit > 3 ? courseData.terms.filter((term) => term.tier === "must-know").map((term) => term.id) : [],
    viewedMapRouteIds: highestUnit > 2 ? courseData.conceptMap.routes.map((route) => route.id) : [],
    routeId: legacy.routeId || courseData.ruleRoutes[0]?.id || "",
    viewedRuleRouteIds: highestUnit > 4 ? courseData.ruleRoutes.map((route) => route.id) : [],
    paragraphIndex: Math.max(0, Math.min(courseData.statute.length - 1, legacy.paragraphIndex || 0)),
    viewedParagraphs: highestUnit > 5 ? courseData.statute.map((paragraph) => paragraph.paragraph) : [],
    caseAnswer: legacy.caseAnswer || "",
    caseSubmitted: highestUnit > 6 || Boolean(legacy.caseAnswer?.trim()),
    quizIndex: Math.max(0, Math.min(courseData.quiz.length - 1, legacy.quizIndex || 0)),
    quizAnswers,
    submittedQuiz,
    quizAttempts: allQuizSubmitted ? [{ id: "migrated-v2", submittedAt: new Date().toISOString(), score, answers: quizAnswers }] : [],
  });
  return finalizeProgress(courseData, migrated);
}

function formatCompletedDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function formatPrimaryScope(courseData: TopicCourseData) {
  const articles = courseData.primaryArticles;
  if (articles.length <= 4) return `第${articles.join("、")}条`;
  return `第${articles[0]}条等 ${articles.length} 条`;
}

export default function TopicCourse({ onOpenArticle, onOpenChapter, resumeRequest = null, onClearResume }: Props) {
  const [store, setStore] = useState<TopicLearningStore>(initialStore);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(resumeRequest?.courseId || null);
  const [hydrated, setHydrated] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [outlineExpanded, setOutlineExpanded] = useState(false);
  const [topicNavOpen, setTopicNavOpen] = useState(false);

  const activeCourse = topicCourses.find((item) => item.id === selectedCourseId) || null;
  const activeProgress = activeCourse ? normalizeCourseProgress(activeCourse, store.courses[activeCourse.id]) : null;
  const activeUnit = activeCourse && activeProgress
    ? activeCourse.units.find((item) => item.id === activeProgress.currentUnitId) || activeCourse.units[0]
    : null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as TopicLearningStore;
          const courses = Object.fromEntries(topicCourses.map((item) => [item.id, normalizeCourseProgress(item, parsed.courses?.[item.id])]));
          setStore({ version: 3, courses });
        } else {
          const legacy = window.localStorage.getItem(legacyStorageKey);
          if (legacy) setStore({ version: 3, courses: { [personalityCourse.id]: migrateLegacyProgress(personalityCourse, JSON.parse(legacy) as LegacyState) } });
        }
      } catch { /* keep a clean course record */ }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(store));
  }, [hydrated, store]);

  function progressFor(courseData: TopicCourseData) {
    return normalizeCourseProgress(courseData, store.courses[courseData.id]);
  }

  function updateProgress(courseData: TopicCourseData, reducer: (current: CourseProgress) => CourseProgress) {
    setStore((currentStore) => {
      const current = normalizeCourseProgress(courseData, currentStore.courses[courseData.id]);
      const next = finalizeProgress(courseData, reducer(current));
      return { ...currentStore, version: 3, courses: { ...currentStore.courses, [courseData.id]: next } };
    });
  }

  function openCourse(courseData: TopicCourseData) {
    const current = progressFor(courseData);
    const completed = getCourseStatus(current) === "completed";
    updateProgress(courseData, (value) => {
      const currentUnit = courseData.units.find((unit) => unit.id === value.currentUnitId);
      const routeId = !completed && currentUnit?.type === "rule-builder" ? courseData.ruleRoutes[0]?.id || value.routeId : value.routeId;
      return { ...value, startedAt: value.startedAt || new Date().toISOString(), currentUnitId: completed ? courseData.units[0].id : value.currentUnitId, routeId };
    });
    setSelectedCourseId(courseData.id);
    setTopicNavOpen(false);
    setShowDefinition(false);
    setShowModelAnswer(false);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function openCourseArticle(number: number) {
    if (!activeCourse || !activeUnit) return;
    onOpenArticle(number, {
      courseId: activeCourse.id,
      courseLabel: activeCourse.title.zh,
      unitId: activeUnit.id,
      unitLabel: activeUnit.title.zh,
    });
  }

  function goToUnit(number: number) {
    if (!activeCourse || !activeProgress) return;
    const nextNumber = Math.max(1, Math.min(activeCourse.units.length, number));
    const nextUnit = activeCourse.units[nextNumber - 1];
    updateProgress(activeCourse, (current) => {
      const enteringRuleBuilder = nextUnit.type === "rule-builder" && current.currentUnitId !== nextUnit.id;
      const routeId = enteringRuleBuilder ? activeCourse.ruleRoutes[0]?.id || current.routeId : current.routeId;
      let next: CourseProgress = { ...current, currentUnitId: nextUnit.id, routeId };
      if (nextUnit.type === "rule-builder") {
        const viewed = [...new Set([...next.viewedRuleRouteIds, routeId])];
        next = { ...next, viewedRuleRouteIds: viewed };
        if (activeCourse.ruleRoutes.every((route) => viewed.includes(route.id))) next = markUnitComplete(activeCourse, next, nextUnit.id);
      }
      if (nextUnit.type === "statute") {
        const paragraph = activeCourse.statute[next.paragraphIndex]?.paragraph;
        const viewed = paragraph ? [...new Set([...next.viewedParagraphs, paragraph])] : next.viewedParagraphs;
        next = { ...next, viewedParagraphs: viewed };
        if (activeCourse.statute.every((item) => viewed.includes(item.paragraph))) next = markUnitComplete(activeCourse, next, nextUnit.id);
      }
      return next;
    });
    setShowDefinition(false);
    window.requestAnimationFrame(() => document.getElementById("lesson-focus")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function chooseIssue(choiceId: string) {
    if (!activeCourse) return;
    updateProgress(activeCourse, (current) => markUnitComplete(activeCourse, { ...current, issueChoice: choiceId }, unitIdByType(activeCourse, "issue")));
  }

  function visitMapRoute(routeId: string) {
    if (!activeCourse) return;
    updateProgress(activeCourse, (current) => {
      const viewed = [...new Set([...current.viewedMapRouteIds, routeId])];
      const next = { ...current, routeId, viewedMapRouteIds: viewed };
      return activeCourse.conceptMap.routes.every((route) => viewed.includes(route.id)) ? markUnitComplete(activeCourse, next, unitIdByType(activeCourse, "map")) : next;
    });
  }

  function revealTerm() {
    if (!activeCourse || !activeProgress) return;
    const term = activeCourse.terms[activeProgress.termIndex];
    updateProgress(activeCourse, (current) => {
      const reviewed = [...new Set([...current.reviewedTermIds, term.id])];
      const next = { ...current, reviewedTermIds: reviewed };
      const required = activeCourse.terms.filter((item) => item.tier === "must-know").map((item) => item.id);
      return required.every((id) => reviewed.includes(id)) ? markUnitComplete(activeCourse, next, unitIdByType(activeCourse, "vocabulary")) : next;
    });
    setShowDefinition(true);
  }

  function selectRuleRoute(routeId: string) {
    if (!activeCourse) return;
    updateProgress(activeCourse, (current) => {
      const viewed = [...new Set([...current.viewedRuleRouteIds, routeId])];
      const next = { ...current, routeId, viewedRuleRouteIds: viewed };
      return activeCourse.ruleRoutes.every((route) => viewed.includes(route.id)) ? markUnitComplete(activeCourse, next, unitIdByType(activeCourse, "rule-builder")) : next;
    });
  }

  function selectParagraph(index: number) {
    if (!activeCourse) return;
    updateProgress(activeCourse, (current) => {
      const paragraph = activeCourse.statute[index].paragraph;
      const viewed = [...new Set([...current.viewedParagraphs, paragraph])];
      const next = { ...current, paragraphIndex: index, viewedParagraphs: viewed };
      return activeCourse.statute.every((item) => viewed.includes(item.paragraph)) ? markUnitComplete(activeCourse, next, unitIdByType(activeCourse, "statute")) : next;
    });
  }

  function chooseQuiz(questionId: string, choiceId: string, multiple: boolean) {
    if (!activeCourse) return;
    updateProgress(activeCourse, (current) => {
      const existing = current.quizAnswers[questionId] || [];
      const answers = multiple ? existing.includes(choiceId) ? existing.filter((item) => item !== choiceId) : [...existing, choiceId] : [choiceId];
      return { ...current, quizAnswers: { ...current.quizAnswers, [questionId]: answers }, submittedQuiz: current.submittedQuiz.filter((id) => id !== questionId) };
    });
  }

  function submitQuiz(questionId: string) {
    if (!activeCourse) return;
    updateProgress(activeCourse, (current) => {
      const submittedQuiz = [...new Set([...current.submittedQuiz, questionId])];
      let next: CourseProgress = { ...current, submittedQuiz };
      if (!activeCourse.quiz.every((question) => submittedQuiz.includes(question.id))) return next;
      const score = calculateQuizScore(activeCourse, next.quizAnswers);
      next = { ...next, quizAttempts: [...next.quizAttempts, { id: `attempt-${Date.now()}`, submittedAt: new Date().toISOString(), score, answers: next.quizAnswers }] };
      return score >= activeCourse.completion.passingScore ? markUnitComplete(activeCourse, next, unitIdByType(activeCourse, "review")) : next;
    });
  }

  function startNewQuizRound() {
    if (!activeCourse) return;
    updateProgress(activeCourse, (current) => ({ ...current, quizIndex: 0, quizAnswers: {}, submittedQuiz: [] }));
  }

  const catalogueStats = useMemo(() => {
    const records = topicCourses.map((item) => getCourseStatus(progressFor(item)));
    return { completed: records.filter((status) => status === "completed").length, inProgress: records.filter((status) => status === "in-progress").length };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  function renderTopicNavigator() {
    return <nav className={`topic-jump ${topicNavOpen ? "open" : ""}`} aria-label="专题课程导航">
      <button className="topic-jump-toggle" type="button" aria-expanded={topicNavOpen} onClick={() => setTopicNavOpen((current) => !current)}><span>专题导航</span><strong>{activeCourse ? `${String(activeCourse.order).padStart(2, "0")} · ${activeCourse.title.zh}` : `全部 ${topicCourses.length} 个专题`}</strong><i aria-hidden="true">⌄</i></button>
      {topicNavOpen && <div className="topic-jump-panel" role="listbox" aria-label="选择专题">{topicCourses.map((courseData) => {
        const status = getCourseStatus(progressFor(courseData));
        const statusLabel = status === "completed" ? "已完成" : status === "in-progress" ? "学习中" : "未开始";
        return <button key={courseData.id} className={`${status} ${courseData.id === selectedCourseId ? "active" : ""}`} role="option" aria-selected={courseData.id === selectedCourseId} onClick={() => openCourse(courseData)}><b>{String(courseData.order).padStart(2, "0")}</b><span><strong>{courseData.title.zh}</strong><small>{courseData.title.en}</small></span><em>{statusLabel}</em></button>;
      })}</div>}
    </nav>;
  }

  if (!selectedCourseId || !activeCourse || !activeProgress || !activeUnit) {
    return <>{renderTopicNavigator()}<section className="topic-catalog">
      <header className="topic-catalog-header"><div><span>TOPIC COURSES</span><h2>专题学习</h2><p>沿着问题、规则、法条和案例完成一条学习主线。</p></div><div className="catalog-summary"><strong>{catalogueStats.completed}</strong><span>已完成</span><i /><strong>{catalogueStats.inProgress}</strong><span>学习中</span></div></header>
      <div className="topic-card-list">{topicCourses.map((item) => {
        const progress = progressFor(item);
        const status = getCourseStatus(progress);
        const completedCount = progress.completedUnitIds.length;
        const percent = Math.round((completedCount / item.units.length) * 100);
        const statusLabel = status === "completed" ? "已完成" : status === "in-progress" ? "学习中" : "未开始";
        const actionLabel = status === "completed" ? "重新学习" : status === "in-progress" ? "继续学习" : "开始学习";
        return <article key={item.id} className={`topic-card ${status}`}><div className="topic-card-order"><span>{String(item.order).padStart(2, "0")}</span><i>{status === "completed" ? "✓" : "§"}</i></div><div className="topic-card-main"><div className="topic-card-meta"><span className="course-status">{statusLabel}</span><span>{formatPrimaryScope(item)}</span><span>{item.durationMinutes[0]}–{item.durationMinutes[1]} min</span></div><h3>{item.title.en}</h3><p>{item.title.zh}</p><div className="topic-card-path">{item.units.map((unit) => <span key={unit.id} className={progress.completedUnitIds.includes(unit.id) ? "done" : ""} title={unit.title.zh}>{progress.completedUnitIds.includes(unit.id) ? "✓" : unit.order}</span>)}</div></div><div className="topic-card-action"><div><span>{completedCount} / {item.units.length} 单元</span><strong>{percent}%</strong></div><div className="catalog-progress"><i style={{ width: `${percent}%` }} /></div>{status === "completed" && <small>{formatCompletedDate(progress.completedAt)} · 最佳 {getBestScore(progress)}/{item.quiz.length}</small>}<button onClick={() => openCourse(item)}>{actionLabel} <span>→</span></button></div></article>;
      })}</div>
    </section></>;
  }

  const completedUnits = activeProgress.completedUnitIds.length;
  const score = calculateQuizScore(activeCourse, activeProgress.quizAnswers);
  const activeStatus = getCourseStatus(activeProgress);

  function renderIssue() {
    if (!activeCourse || !activeProgress) return null;
    const selected = activeCourse.openingIssue.choices.find((choice) => choice.id === activeProgress.issueChoice);
    return <div className="focus-stack"><section className="opening-question"><span>Start here</span><h3>{activeCourse.openingIssue.heading.en}</h3><p>{activeCourse.openingIssue.heading.zh}</p></section><section className="reading-passage"><p>{activeCourse.openingIssue.facts}</p></section><section className="decision-area"><h4>What is the best preliminary answer?</h4><div>{activeCourse.openingIssue.choices.map((choice) => <button key={choice.id} className={activeProgress.issueChoice === choice.id ? "selected" : ""} onClick={() => chooseIssue(choice.id)}><b>{choice.id.toUpperCase()}</b><span>{choice.text}</span></button>)}</div></section>{selected && <section className={`answer-feedback ${selected.correct ? "correct" : "retry"}`}><strong>{selected.correct ? "Correct direction" : "Pause and separate the rule from the exception"}</strong><p>{activeCourse.openingIssue.explanation.en}</p><span>{activeCourse.openingIssue.explanation.zh}</span></section>}</div>;
  }

  function renderMap() {
    if (!activeCourse || !activeProgress) return null;
    const instruction = activeCourse.mapInstruction || { en: "Build the rule structure.", zh: "依次查看各条规则路径。" };
    return <div className="focus-stack"><div className="map-instruction"><strong>{instruction.en}</strong><span>{instruction.zh}</span></div><section className="legal-logic-map" aria-label={`${activeCourse.title.zh}规则图`}><div className="default-nodes">{activeCourse.conceptMap.defaultRules.map((rule) => <button key={rule.id} onClick={() => openCourseArticle(rule.article)}><span>Article {rule.article}</span><strong>{rule.title.en}</strong><p>{rule.rule.en}</p></button>)}</div><div className="map-arrow"><span>RULE STRUCTURE</span><i>↓</i></div><div className="exception-node"><span>CORE RULE</span><strong>Article {activeCourse.conceptMap.exception.article} · {activeCourse.conceptMap.exception.title.en}</strong><p>{activeCourse.conceptMap.exception.rule.en}</p></div><div className="map-branches">{activeCourse.conceptMap.routes.map((route, index) => <button key={route.id} className={activeProgress.viewedMapRouteIds.includes(route.id) ? "visited" : ""} onClick={() => visitMapRoute(route.id)}><b>{activeProgress.viewedMapRouteIds.includes(route.id) ? "✓ REVIEWED" : `Path ${String(index + 1).padStart(2, "0")}`}</b><strong>{route.title.en}</strong><span>{route.title.zh}</span><p>{route.summary.en}</p></button>)}</div></section></div>;
  }

  function renderVocabulary() {
    if (!activeCourse || !activeProgress) return null;
    const term = activeCourse.terms[activeProgress.termIndex];
    const reviewed = activeProgress.reviewedTermIds.includes(term.id);
    return <div className="focus-stack"><div className="term-progress"><span>Term {activeProgress.termIndex + 1} of {activeCourse.terms.length}</span><div><i style={{ width: `${((activeProgress.termIndex + 1) / activeCourse.terms.length) * 100}%` }} /></div></div><section className={`single-term ${reviewed ? "reviewed" : ""}`}><span>{reviewed ? "✓ Reviewed" : term.tier === "must-know" ? "Core concept" : term.tier === "evidence" ? "Evidence language" : "Recognition term"}</span><h3>{term.term}</h3><p>{term.chinese}</p>{!showDefinition ? <button className="reveal-button" onClick={revealTerm}>{reviewed ? "再次查看解释" : "先回想含义，再查看解释"}</button> : <div className="term-explanation"><p>{term.definitionEn}</p><span>{term.definitionZh}</span><dl><div><dt>COLLOCATION</dt><dd>{term.collocation}</dd></div><div><dt>IN CONTEXT</dt><dd>{term.example}</dd></div></dl></div>}</section><div className="term-navigation"><button disabled={activeProgress.termIndex === 0} onClick={() => { updateProgress(activeCourse, (current) => ({ ...current, termIndex: current.termIndex - 1 })); setShowDefinition(false); }}>← 上一个</button><button disabled={activeProgress.termIndex === activeCourse.terms.length - 1} onClick={() => { updateProgress(activeCourse, (current) => ({ ...current, termIndex: current.termIndex + 1 })); setShowDefinition(false); }}>下一个 →</button></div></div>;
  }

  function renderRuleBuilder() {
    if (!activeCourse || !activeProgress) return null;
    const route = activeCourse.ruleRoutes.find((item) => item.id === activeProgress.routeId) || activeCourse.ruleRoutes[0];
    return <div className="focus-stack"><nav className="route-switcher">{activeCourse.ruleRoutes.map((item) => <button key={item.id} className={`${activeProgress.routeId === item.id ? "active" : ""} ${activeProgress.viewedRuleRouteIds.includes(item.id) ? "visited" : ""}`} onClick={() => selectRuleRoute(item.id)}><span>{activeProgress.viewedRuleRouteIds.includes(item.id) ? "✓ " : ""}{item.articleLabel || `Art. ${activeCourse.primaryArticles[0]}(${item.articleParagraph})`}</span><strong>{item.title.en.replace(/^Route [A-C] — /, "")}</strong></button>)}</nav><section className="rule-chain" aria-label={`${route.title.en}构成要件`}>{route.blocks.map((block, index) => <div key={block.id} className="rule-chain-step"><span>{String(index + 1).padStart(2, "0")}</span><article><small>{block.label.en}</small><strong>{block.content.en}</strong><p>{block.content.zh}</p></article>{index < route.blocks.length - 1 && <i>→</i>}</div>)}</section><section className="rule-conclusion"><span>Put it together</span><p>{route.formula.en}</p><small>{route.formula.zh}</small></section></div>;
  }

  function renderStatute() {
    if (!activeCourse || !activeProgress) return null;
    const paragraph = activeCourse.statute[activeProgress.paragraphIndex];
    const targetArticle = paragraph.article || activeCourse.primaryArticles[0];
    return <div className="focus-stack"><nav className="paragraph-switcher">{activeCourse.statute.map((item, index) => <button key={item.paragraph} className={`${activeProgress.paragraphIndex === index ? "active" : ""} ${activeProgress.viewedParagraphs.includes(item.paragraph) ? "visited" : ""}`} onClick={() => selectParagraph(index)}><span>{activeProgress.viewedParagraphs.includes(item.paragraph) ? "✓ " : ""}{item.citation || `Article ${item.article || activeCourse.primaryArticles[0]}`}</span><strong>{item.heading.en}</strong></button>)}</nav><section className="statute-focus"><div className="english-rule"><span>COURSE TRANSLATION</span><p>{paragraph.courseTranslation}</p></div><div className="chinese-rule"><span>中文权威文本</span><p>{paragraph.chineseAuthoritative}</p></div></section><section className="expression-focus"><h4>Expressions to retain</h4><div>{paragraph.focusExpressions.map((expression) => <article key={expression.en}><strong>{expression.en}</strong><span>{expression.zh}</span></article>)}</div></section><button className="text-link" onClick={() => openCourseArticle(targetArticle)}>打开第{targetArticle}条双语对照 →</button></div>;
  }

  function renderCase() {
    if (!activeCourse || !activeProgress) return null;
    const wordCount = activeProgress.caseAnswer.trim().split(/\s+/).filter(Boolean).length;
    const minimumWords = activeCourse.caseStudy.minimumWords || 30;
    return <div className="focus-stack"><section className="case-reading"><span>{activeCourse.caseStudy.label || "CASE FILE"} · {activeCourse.caseStudy.title.en}</span><p>{activeCourse.caseStudy.facts}</p></section><section className="evidence-ladder"><h4>{activeCourse.caseStudy.evidencePrompt || "Which facts carry the most weight?"}</h4>{activeCourse.caseStudy.evidenceRanking.map((item) => <article key={item.rank}><b>{item.rank}</b><p>{item.fact}</p><span className={item.weight}>{item.weight === "strong" ? "关键事实" : "辅助事实"}</span></article>)}</section><section className={`case-writing ${activeProgress.caseSubmitted ? "submitted" : ""}`}><label htmlFor="case-answer">{activeCourse.caseStudy.writingPrompt || "Write a short legal conclusion"}</label><p>{activeCourse.caseStudy.writingHint || "Use Issue → Rule → Application → Conclusion."}</p><textarea id="case-answer" value={activeProgress.caseAnswer} onChange={(event) => updateProgress(activeCourse, (current) => ({ ...current, caseAnswer: event.target.value }))} placeholder={activeCourse.caseStudy.answerPlaceholder || "State the applicable rule and apply it to the facts..."} /><div><span>{wordCount} words {activeProgress.caseSubmitted ? "· 已保存" : ""}</span><button disabled={wordCount < minimumWords} onClick={() => updateProgress(activeCourse, (current) => markUnitComplete(activeCourse, { ...current, caseSubmitted: true }, unitIdByType(activeCourse, "case")))}>{activeProgress.caseSubmitted ? "✓ 分析已完成" : "保存分析并完成"}</button><button onClick={() => setShowModelAnswer((current) => !current)}>{showModelAnswer ? "收起参考答案" : "完成后查看参考答案"}</button></div></section>{showModelAnswer && <section className="model-answer"><strong>Model answer</strong><p>{activeCourse.caseStudy.modelAnswer}</p></section>}</div>;
  }

  function renderReview() {
    if (!activeCourse || !activeProgress) return null;
    const question = activeCourse.quiz[activeProgress.quizIndex];
    const selected = activeProgress.quizAnswers[question.id] || [];
    const submitted = activeProgress.submittedQuiz.includes(question.id);
    const expected = question.choices.filter((choice) => choice.correct).map((choice) => choice.id);
    const correct = answersMatch(selected, expected);
    const allSubmitted = activeCourse.quiz.every((item) => activeProgress.submittedQuiz.includes(item.id));
    return <div className="focus-stack"><div className="quiz-progress"><span>Question {activeProgress.quizIndex + 1} / {activeCourse.quiz.length}</span><strong>{score} correct</strong></div><section className="single-question"><span>{question.type === "multiple" ? "SELECT ALL THAT APPLY" : "SELECT ONE"}</span><h3>{question.prompt.en}</h3><p>{question.prompt.zh}</p><div>{question.choices.map((choice) => <button key={choice.id} className={`${selected.includes(choice.id) ? "selected" : ""} ${submitted && choice.correct ? "correct-choice" : ""}`} onClick={() => chooseQuiz(question.id, choice.id, question.type === "multiple")}><b>{choice.id.toUpperCase()}</b><span>{choice.text}</span></button>)}</div></section>{!submitted ? <button className="submit-answer" disabled={!selected.length} onClick={() => submitQuiz(question.id)}>提交答案</button> : <section className={`answer-feedback ${correct ? "correct" : "retry"}`}><strong>{correct ? "Correct" : "Review this rule"}</strong><p>{question.explanation.en}</p><span>{question.explanation.zh}</span></section>}<div className="quiz-navigation"><button disabled={activeProgress.quizIndex === 0} onClick={() => updateProgress(activeCourse, (current) => ({ ...current, quizIndex: current.quizIndex - 1 }))}>← 上一题</button><button disabled={activeProgress.quizIndex === activeCourse.quiz.length - 1} onClick={() => updateProgress(activeCourse, (current) => ({ ...current, quizIndex: current.quizIndex + 1 }))}>下一题 →</button></div>{allSubmitted && <section className="course-result"><strong>{score} / {activeCourse.quiz.length}</strong><div><h4>{score >= activeCourse.completion.passingScore ? "专题检测完成" : "还需要一次针对性复习"}</h4><p>{score >= activeCourse.completion.passingScore ? activeCourse.completion.message.zh : "回到规则构建或案例单元，修正薄弱点后再做一次。"}</p><div className="result-actions"><button onClick={() => setSelectedCourseId(null)}>返回专题目录</button><button onClick={startNewQuizRound}>开始新一轮答题</button></div></div></section>}</div>;
  }

  const content = activeUnit.type === "issue" ? renderIssue() : activeUnit.type === "map" ? renderMap() : activeUnit.type === "vocabulary" ? renderVocabulary() : activeUnit.type === "rule-builder" ? renderRuleBuilder() : activeUnit.type === "statute" ? renderStatute() : activeUnit.type === "case" ? renderCase() : renderReview();

  const navigationArticle = activeCourse.navigation?.article || activeCourse.primaryArticles[0];
  const navigationChapter = activeCourse.navigation?.chapter || 1;
  return <>{renderTopicNavigator()}<section className="topic-course"><header className={`topic-course-header ${activeStatus}`}><button className="back-to-catalog" onClick={() => { setSelectedCourseId(null); onClearResume?.(); }}>← 专题目录</button><div><span>专题 {String(activeCourse.order).padStart(2, "0")} · {formatPrimaryScope(activeCourse)}</span><h2>{activeCourse.title.en}</h2><p>{activeCourse.title.zh}</p></div><div className="course-progress"><div><strong>{completedUnits}</strong><span>/ {activeCourse.units.length} 单元</span></div><div><i style={{ width: `${(completedUnits / activeCourse.units.length) * 100}%` }} /></div>{activeStatus === "completed" && <small>✓ 已完成 · 当前为复习模式</small>}</div></header><div className={`topic-workspace ${outlineExpanded ? "outline-expanded" : "outline-collapsed"}`}><aside className="lesson-outline"><button className="outline-toggle" onClick={() => setOutlineExpanded((current) => !current)} aria-expanded={outlineExpanded} aria-label={outlineExpanded ? "收起学习大纲" : "展开学习大纲"} title={outlineExpanded ? "收起学习大纲" : "展开学习大纲"}>{outlineExpanded ? "‹" : "›"}</button><div className="outline-title"><span>学习大纲</span><strong>{activeStatus === "completed" ? "重新学习" : "从规则到应用"}</strong></div><nav>{activeCourse.units.map((item) => <button key={item.id} title={`${item.order}. ${item.title.zh} · ${item.title.en}`} aria-label={`第${item.order}单元：${item.title.zh}`} className={`${activeUnit.id === item.id ? "active" : ""} ${activeProgress.completedUnitIds.includes(item.id) ? "done" : ""}`} onClick={() => goToUnit(item.order)}><b>{activeProgress.completedUnitIds.includes(item.id) ? "✓" : item.order}</b><span><strong>{item.title.zh}</strong><small>{item.title.en}</small></span></button>)}</nav><div className="outline-links"><button onClick={() => openCourseArticle(navigationArticle)}>第{navigationArticle}条 ↗</button><button onClick={() => onOpenChapter(navigationChapter)}>第{navigationChapter}章 ↗</button></div></aside><main id="lesson-focus" className="lesson-focus"><header className="lesson-heading"><div><span>UNIT {String(activeUnit.order).padStart(2, "0")} {activeProgress.completedUnitIds.includes(activeUnit.id) ? "· ✓ 已完成" : ""}</span><h2>{activeUnit.title.en}</h2><p>{activeUnit.title.zh}</p></div><strong>{activeUnit.purpose.en}</strong></header>{content}<footer className="lesson-navigation"><button disabled={activeUnit.order === 1} onClick={() => goToUnit(activeUnit.order - 1)}>← 上一单元</button><span>{activeUnit.order} / {activeCourse.units.length}</span><button disabled={activeUnit.order === activeCourse.units.length} onClick={() => goToUnit(activeUnit.order + 1)}>下一单元 →</button></footer></main></div></section></>;
}
