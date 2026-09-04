"use client";

import { ChangeEvent, CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import lawData from "./data/company-law.json";
import defaultEnglishArticles from "./data/default-english.json";
import { glossary } from "./data/glossary";
import { HighlightSegment } from "./data/chapter-one";
import { chapterLearningConfigs } from "./data/chapter-learning";
import { AnnotatedText, HighlightColor, LinkedTermRange, SelectionDraft, TextAnnotation, WordHoverPayload } from "./AnnotatedText";
import TopicCourse, { TopicArticleOrigin, TopicResumeRequest } from "./TopicCourse";

type View = "library" | "learn" | "progress";
type CourseSection = "topics" | "chapters";
type EnglishSource = "default" | "custom";
type LearningStep = 1 | 2 | 3 | 4;
type ArticleStudyOrigin =
  | ({ kind: "topic" } & TopicArticleOrigin)
  | { kind: "chapter"; chapter: number; step: LearningStep };
type StudyState = {
  learned: number[];
  favorites: number[];
  notes: Record<string, string>;
  lastArticle: number;
  masteredTerms: string[];
  learnedExpressions: string[];
  annotations: TextAnnotation[];
};
const initialStudy: StudyState = { learned: [], favorites: [], notes: {}, lastArticle: 1, masteredTerms: [], learnedExpressions: [], annotations: [] };
const storageKey = "company-law-english-lab-v1";
const englishStorageKey = "company-law-english-text-v1";
const layoutStorageKey = "company-law-reader-layout-v1";
const navItems: { id: View; label: string; short: string; sub: string; icon: string }[] = [
  { id: "library", label: "双语条文库", short: "条文", sub: "Bilingual Statute", icon: "▤" },
  { id: "learn", label: "课程学习", short: "课程", sub: "Course Learning", icon: "◇" },
  { id: "progress", label: "学习记录", short: "记录", sub: "Local Progress", icon: "✓" },
];

type TranslatorStatus = "idle" | "checking" | "downloading" | "ready" | "unsupported" | "error";
type TranslatorAvailability = "unavailable" | "downloadable" | "downloading" | "available";
type TranslatorDownloadEvent = Event & { loaded?: number };
type BrowserTranslatorSession = {
  translate: (text: string) => Promise<string>;
  destroy?: () => void;
};
type BrowserTranslatorApi = {
  availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<TranslatorAvailability>;
  create: (options: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (monitor: { addEventListener: (type: "downloadprogress", listener: (event: TranslatorDownloadEvent) => void) => void }) => void;
  }) => Promise<BrowserTranslatorSession>;
};

function getBrowserTranslatorApi() {
  return (globalThis as typeof globalThis & { Translator?: BrowserTranslatorApi }).Translator;
}

function findOccurrences(text: string, phrase: string, caseInsensitive = false) {
  const source = caseInsensitive ? text.toLocaleLowerCase("en") : text;
  const needle = caseInsensitive ? phrase.toLocaleLowerCase("en") : phrase;
  const matches: { start: number; end: number }[] = [];
  if (!needle) return matches;
  let cursor = 0;
  while (cursor < source.length) {
    const start = source.indexOf(needle, cursor);
    if (start < 0) break;
    const end = start + needle.length;
    const leftOk = !caseInsensitive || start === 0 || !/[A-Za-z]/.test(source[start - 1]);
    const rightOk = !caseInsensitive || end === source.length || !/[A-Za-z]/.test(source[end]);
    if (leftOk && rightOk) matches.push({ start, end });
    cursor = Math.max(end, start + 1);
  }
  return matches;
}

function removeOverlaps(ranges: LinkedTermRange[]) {
  const chosen: LinkedTermRange[] = [];
  [...ranges].sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start)).forEach((range) => {
    if (!chosen.some((item) => item.start < range.end && item.end > range.start)) chosen.push(range);
  });
  return chosen.sort((a, b) => a.start - b.start);
}

function segmentWords(text: string, locale: "zh" | "en") {
  if (!text) return [];
  const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
  return [...segmenter.segment(text)]
    .filter((item) => item.isWordLike)
    .map((item) => ({ start: item.index, end: item.index + item.segment.length }));
}

function proportionalIndex(slot: number, slots: number, length: number) {
  if (length <= 1 || slots <= 1) return 0;
  return Math.round((slot / (slots - 1)) * (length - 1));
}

function buildWordAlignmentRanges(chinese: string, english: string) {
  const exactChineseRanges: LinkedTermRange[] = [];
  const exactEnglishRanges: LinkedTermRange[] = [];
  glossary.forEach((term, index) => {
    const enMatches = findOccurrences(english, term.term, true);
    const zhMatches = term.chinese.split(/[／/]/).flatMap((variant) => findOccurrences(chinese, variant.trim()));
    if (!enMatches.length || !zhMatches.length) return;
    const slots = Math.min(enMatches.length, zhMatches.length);
    for (let slot = 0; slot < slots; slot += 1) {
      const id = `exact-${index}-${slot}`;
      const enMatch = enMatches[proportionalIndex(slot, slots, enMatches.length)];
      const zhMatch = zhMatches[proportionalIndex(slot, slots, zhMatches.length)];
      exactEnglishRanges.push({ ...enMatch, id, label: `${term.term} · ${term.chinese}`, priority: 10 });
      exactChineseRanges.push({ ...zhMatch, id, label: `${term.chinese} · ${term.term}`, priority: 10 });
    }
  });

  const chineseWords = segmentWords(chinese, "zh");
  const englishWords = segmentWords(english, "en");
  const autoChineseRanges: LinkedTermRange[] = [];
  const autoEnglishRanges: LinkedTermRange[] = [];
  const slots = Math.max(chineseWords.length, englishWords.length);
  for (let slot = 0; slot < slots; slot += 1) {
    const chineseWord = chineseWords[proportionalIndex(slot, slots, chineseWords.length)];
    const englishWord = englishWords[proportionalIndex(slot, slots, englishWords.length)];
    if (!chineseWord || !englishWord) continue;
    const id = `word-${slot}`;
    autoChineseRanges.push({ ...chineseWord, id, label: "", priority: 1 });
    autoEnglishRanges.push({ ...englishWord, id, label: "", priority: 1 });
  }

  const cleanChineseTerms = removeOverlaps(exactChineseRanges);
  const cleanEnglishTerms = removeOverlaps(exactEnglishRanges);
  const sharedExactIds = new Set(cleanChineseTerms.map((item) => item.id).filter((id) => cleanEnglishTerms.some((item) => item.id === id)));
  return {
    chinese: [...cleanChineseTerms.filter((item) => sharedExactIds.has(item.id)), ...autoChineseRanges],
    english: [...cleanEnglishTerms.filter((item) => sharedExactIds.has(item.id)), ...autoEnglishRanges],
  };
}

function trimTranslation(text: string) {
  return text.trim().replace(/^[\s"'“”‘’.,;:!?，。；：！？、]+|[\s"'“”‘’.,;:!?，。；：！？、]+$/gu, "").trim();
}

function findBestTranslatedRange(target: string, translation: string, locale: "zh" | "en", sourceRatio: number) {
  const clean = trimTranslation(translation);
  if (!clean) return null;
  const direct = findOccurrences(target, clean, locale === "en");
  if (direct.length) {
    return [...direct].sort((a, b) => Math.abs(a.start / Math.max(1, target.length) - sourceRatio) - Math.abs(b.start / Math.max(1, target.length) - sourceRatio))[0];
  }

  const candidateWords = segmentWords(clean, locale)
    .map((range) => ({ ...range, value: clean.slice(range.start, range.end) }))
    .filter((item) => locale === "zh" ? item.value.length > 1 : item.value.length > 2);
  const targetWords = segmentWords(target, locale).map((range) => ({ ...range, value: target.slice(range.start, range.end) }));
  const englishStopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "shall", "may", "not", "any"]);
  let best: { start: number; end: number; score: number } | null = null;
  for (const candidate of candidateWords) {
    const candidateValue = locale === "en" ? candidate.value.toLocaleLowerCase("en") : candidate.value;
    if (locale === "en" && englishStopWords.has(candidateValue)) continue;
    for (const targetWord of targetWords) {
      const targetValue = locale === "en" ? targetWord.value.toLocaleLowerCase("en") : targetWord.value;
      const lexicalMatch = locale === "en"
        ? targetValue === candidateValue || (candidateValue.length > 4 && (targetValue.startsWith(candidateValue) || candidateValue.startsWith(targetValue)))
        : targetValue.includes(candidateValue) || candidateValue.includes(targetValue);
      if (!lexicalMatch) continue;
      const distance = Math.abs(targetWord.start / Math.max(1, target.length) - sourceRatio);
      const score = candidateValue.length * 2 - distance * 10;
      if (!best || score > best.score) best = { start: targetWord.start, end: targetWord.end, score };
    }
  }
  return best ? { start: best.start, end: best.end } : null;
}

export default function LawLab() {
  const [view, setView] = useState<View>("library");
  const [courseSection, setCourseSection] = useState<CourseSection>("topics");
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [articleJumpInput, setArticleJumpInput] = useState("1");
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState(0);
  const [topic, setTopic] = useState(0);
  const [study, setStudy] = useState<StudyState>(initialStudy);
  const [hydrated, setHydrated] = useState(false);
  const [revealedTerm, setRevealedTerm] = useState<string | null>(null);
  const [learningChapter, setLearningChapter] = useState(1);
  const [learningStep, setLearningStep] = useState<LearningStep>(1);
  const [articleStudyOrigin, setArticleStudyOrigin] = useState<ArticleStudyOrigin | null>(null);
  const [topicResumeRequest, setTopicResumeRequest] = useState<TopicResumeRequest | null>(null);
  const [showNoteHistory, setShowNoteHistory] = useState(false);
  const [showAnnotationHistory, setShowAnnotationHistory] = useState(false);
  const [englishArticles, setEnglishArticles] = useState<Record<string, string>>(defaultEnglishArticles);
  const [englishSource, setEnglishSource] = useState<EnglishSource>("default");
  const [importingEnglish, setImportingEnglish] = useState(false);
  const [browserWidth, setBrowserWidth] = useState(33);
  const [translationWidth, setTranslationWidth] = useState(50);
  const [readerFullscreen, setReaderFullscreen] = useState(false);
  const [readerFontScale, setReaderFontScale] = useState(1.1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileReaderOpen, setMobileReaderOpen] = useState(false);
  const [selectionDraft, setSelectionDraft] = useState<SelectionDraft | null>(null);
  const [annotationNoteOpen, setAnnotationNoteOpen] = useState(false);
  const [annotationNoteDraft, setAnnotationNoteDraft] = useState("");
  const [showArticleAnnotations, setShowArticleAnnotations] = useState(false);
  const [activeLinkedTerms, setActiveLinkedTerms] = useState<string[]>([]);
  const [dynamicAlignment, setDynamicAlignment] = useState<{ chinese: LinkedTermRange[]; english: LinkedTermRange[] }>({ chinese: [], english: [] });
  const [translatorStatus, setTranslatorStatus] = useState<TranslatorStatus>("idle");
  const [translatorProgress, setTranslatorProgress] = useState(0);
  const importRef = useRef<HTMLInputElement>(null);
  const englishImportRef = useRef<HTMLInputElement>(null);
  const libraryLayoutRef = useRef<HTMLElement>(null);
  const translationGridRef = useRef<HTMLDivElement>(null);
  const articleReaderRef = useRef<HTMLElement>(null);
  const articleListRef = useRef<HTMLDivElement>(null);
  const articleListScrollRef = useRef(0);
  const pendingArticleListTargetRef = useRef<number | null>(null);
  const noteHistoryRef = useRef<HTMLElement>(null);
  const annotationHistoryRef = useRef<HTMLElement>(null);
  const learningStageRef = useRef<HTMLDivElement>(null);
  const zhToEnTranslatorRef = useRef<BrowserTranslatorSession | null>(null);
  const enToZhTranslatorRef = useRef<BrowserTranslatorSession | null>(null);
  const hoverRequestRef = useRef(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as StudyState;
          setStudy({ ...initialStudy, ...parsed, annotations: Array.isArray(parsed.annotations) ? parsed.annotations : [] });
          setSelectedNumber(parsed.lastArticle || 1);
          setArticleJumpInput(String(parsed.lastArticle || 1));
        }
        const savedEnglish = window.localStorage.getItem(englishStorageKey);
        if (savedEnglish) {
          const parsedEnglish = JSON.parse(savedEnglish) as Record<string, string>;
          if (Object.keys(parsedEnglish).length === 266) {
            setEnglishArticles(parsedEnglish);
            setEnglishSource("custom");
          }
        }
        const savedLayout = window.localStorage.getItem(layoutStorageKey);
        if (savedLayout) {
          const parsedLayout = JSON.parse(savedLayout) as { browserWidth?: number; translationWidth?: number; readerFontScale?: number; sidebarCollapsed?: boolean };
          if (typeof parsedLayout.browserWidth === "number") setBrowserWidth(Math.max(24, Math.min(50, parsedLayout.browserWidth)));
          if (typeof parsedLayout.translationWidth === "number") setTranslationWidth(Math.max(30, Math.min(70, parsedLayout.translationWidth)));
          if (typeof parsedLayout.readerFontScale === "number") setReaderFontScale(Math.max(.8, Math.min(1.8, parsedLayout.readerFontScale)));
          if (typeof parsedLayout.sidebarCollapsed === "boolean") setSidebarCollapsed(parsedLayout.sidebarCollapsed);
        }
      } catch { /* use a clean state when an old backup is malformed */ }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(study));
  }, [study, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(layoutStorageKey, JSON.stringify({ browserWidth, translationWidth, readerFontScale, sidebarCollapsed }));
  }, [browserWidth, translationWidth, readerFontScale, sidebarCollapsed, hydrated]);

  useEffect(() => {
    if (!readerFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setReaderFullscreen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [readerFullscreen]);

  useEffect(() => () => {
    zhToEnTranslatorRef.current?.destroy?.();
    enToZhTranslatorRef.current?.destroy?.();
  }, []);

  useEffect(() => {
    if (!hydrated || view !== "library") return;
    const frame = window.requestAnimationFrame(() => {
      const list = articleListRef.current;
      if (!list) return;
      const pendingTarget = pendingArticleListTargetRef.current;
      if (pendingTarget !== null) {
        list.querySelector<HTMLElement>(`[data-article-number="${pendingTarget}"]`)?.scrollIntoView({ block: "center" });
        articleListScrollRef.current = list.scrollTop;
        pendingArticleListTargetRef.current = null;
        return;
      }
      if (articleListScrollRef.current > 0) list.scrollTop = articleListScrollRef.current;
      else list.querySelector<HTMLElement>(`[data-article-number="${selectedNumber}"]`)?.scrollIntoView({ block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hydrated, selectedNumber, view]);

  useEffect(() => {
    const closeWhenSelectionEnds = () => {
      if (annotationNoteOpen) return;
      window.requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.toString().trim()) setSelectionDraft(null);
      });
    };
    document.addEventListener("selectionchange", closeWhenSelectionEnds);
    return () => document.removeEventListener("selectionchange", closeWhenSelectionEnds);
  }, [annotationNoteOpen]);

  const selected = lawData.articles[selectedNumber - 1];
  const filteredArticles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return lawData.articles.filter((article) => {
      const currentTopic = lawData.topics.find((item) => item.id === topic);
      const english = englishArticles[String(article.number)] || "";
      return (chapter === 0 || article.chapter === chapter) &&
        (!currentTopic || (article.number >= currentTopic.start && article.number <= currentTopic.end)) &&
        (!normalized || String(article.number) === normalized || article.chinese.toLowerCase().includes(normalized) || english.toLowerCase().includes(normalized) || article.topicZh.includes(normalized) || article.topicEn.toLowerCase().includes(normalized));
    });
  }, [chapter, englishArticles, query, topic]);

  const currentLearningChapter = chapterLearningConfigs.find((item) => item.number === learningChapter) || chapterLearningConfigs[0];
  const currentChapterTerms = glossary.filter((item) => currentLearningChapter.conceptTerms.includes(item.term));
  const englishImported = Object.keys(englishArticles).length === 266;
  const chapterMasteredCount = currentChapterTerms.filter((item) => study.masteredTerms.includes(item.term)).length;
  const chapterExpressionCount = currentLearningChapter.expressions.filter((item) => study.learnedExpressions.includes(item.id)).length;
  const chapterProgressTotal = currentChapterTerms.length + currentLearningChapter.expressions.length;
  const chapterProgress = chapterProgressTotal ? Math.round(((chapterMasteredCount + chapterExpressionCount) / chapterProgressTotal) * 100) : 0;
  const linkedTermRanges = useMemo(
    () => buildWordAlignmentRanges(selected.chinese, englishArticles[String(selected.number)] || ""),
    [englishArticles, selected.chinese, selected.number],
  );
  const currentArticleAnnotations = study.annotations.filter((item) => item.article === selectedNumber);
  const savedNotes = Object.entries(study.notes).filter(([, content]) => content.trim()).sort(([a], [b]) => Number(a) - Number(b));
  const selectedAnnotation = selectionDraft ? study.annotations.find((item) =>
    item.article === selectionDraft.article && item.language === selectionDraft.language && item.start === selectionDraft.start && item.end === selectionDraft.end,
  ) : undefined;
  const translatorLabel = translatorStatus === "ready" ? "精准对齐 ✓"
    : translatorStatus === "downloading" ? `模型 ${translatorProgress}%`
      : translatorStatus === "checking" ? "检查模型…"
        : translatorStatus === "unsupported" ? "浏览器不支持"
          : translatorStatus === "error" ? "重试精准对齐" : "启用精准对齐";

  function openArticle(number: number, origin: ArticleStudyOrigin | null = null) {
    if (number < 1 || number > lawData.meta.articleCount) return;
    if (view !== "library") pendingArticleListTargetRef.current = number;
    hoverRequestRef.current += 1;
    setActiveLinkedTerms([]);
    setDynamicAlignment({ chinese: [], english: [] });
    setSelectedNumber(number);
    setArticleJumpInput(String(number));
    setArticleStudyOrigin(origin);
    setStudy((current) => ({ ...current, lastArticle: number }));
    setSelectionDraft(null);
    setAnnotationNoteOpen(false);
    setMobileReaderOpen(true);
    setView("library");
    window.requestAnimationFrame(() => articleReaderRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function returnToArticleList() {
    setReaderFullscreen(false);
    setSelectionDraft(null);
    setAnnotationNoteOpen(false);
    setMobileReaderOpen(false);
    window.requestAnimationFrame(() => {
      articleListRef.current?.querySelector<HTMLElement>(`[data-article-number="${selectedNumber}"]`)?.scrollIntoView({ block: "center" });
    });
  }
  function commitArticleJump() {
    const number = Number(articleJumpInput);
    if (Number.isInteger(number) && number >= 1 && number <= lawData.meta.articleCount) openArticle(number, articleStudyOrigin);
    else setArticleJumpInput(String(selectedNumber));
  }
  function changeView(nextView: View) {
    if (view === "library" && articleListRef.current) articleListScrollRef.current = articleListRef.current.scrollTop;
    if (nextView === "library" && view !== "library") setMobileReaderOpen(false);
    setArticleStudyOrigin(null);
    setView(nextView);
  }

  function openArticleFromChapter(number: number) {
    openArticle(number, { kind: "chapter", chapter: learningChapter, step: learningStep });
  }

  function returnToStudyOrigin() {
    if (!articleStudyOrigin) return;
    setReaderFullscreen(false);
    setSelectionDraft(null);
    setAnnotationNoteOpen(false);
    if (articleStudyOrigin.kind === "topic") {
      setCourseSection("topics");
      setTopicResumeRequest({
        courseId: articleStudyOrigin.courseId,
        unitId: articleStudyOrigin.unitId,
        token: Date.now(),
      });
    } else {
      setCourseSection("chapters");
      setLearningChapter(articleStudyOrigin.chapter);
      setLearningStep(articleStudyOrigin.step);
    }
    setArticleStudyOrigin(null);
    setView("learn");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function toggleFavorite(number: number) {
    setStudy((current) => ({ ...current, favorites: current.favorites.includes(number) ? current.favorites.filter((item) => item !== number) : [...current.favorites, number] }));
  }
  function toggleNamedList(key: "masteredTerms" | "learnedExpressions", value: string) {
    setStudy((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  }
  function openNoteHistory() {
    setShowNoteHistory(true);
    window.setTimeout(() => noteHistoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  function openAnnotationHistory() {
    setShowAnnotationHistory(true);
    window.setTimeout(() => annotationHistoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  function openArticleNote(number: number) {
    openArticle(number);
    window.setTimeout(() => document.getElementById("article-note")?.scrollIntoView({ behavior: "smooth", block: "center" }), 120);
  }
  function openAnnotationFromHistory(annotationId: string) {
    const annotation = study.annotations.find((item) => item.id === annotationId);
    if (!annotation) return;
    openArticle(annotation.article);
    setShowArticleAnnotations(true);
    window.setTimeout(() => {
      const target = [...document.querySelectorAll<HTMLElement>("[data-annotation-ids]")]
        .find((element) => element.dataset.annotationIds?.split(" ").includes(annotationId));
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      openSavedAnnotation(annotationId);
    }, 180);
  }
  function changeLearningStep(step: 1 | 2 | 3 | 4) {
    setLearningStep(step);
    window.requestAnimationFrame(() => learningStageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  function openChapterCourse(number: number) {
    setLearningChapter(number);
    setLearningStep(1);
    setRevealedTerm(null);
    setCourseSection("chapters");
    setView("learn");
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function renderSegments(segments: HighlightSegment[]) {
    return segments.map((segment, index) => segment.tone
      ? <mark key={`${segment.text}-${index}`} className={`mark-${segment.tone}`}>{segment.text}</mark>
      : <span key={`${segment.text}-${index}`}>{segment.text}</span>);
  }
  function beginResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function resizeLibrary(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !libraryLayoutRef.current) return;
    const rect = libraryLayoutRef.current.getBoundingClientRect();
    setBrowserWidth(Math.max(24, Math.min(50, ((event.clientX - rect.left) / rect.width) * 100)));
  }
  function resizeTranslation(event: ReactPointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !translationGridRef.current) return;
    const rect = translationGridRef.current.getBoundingClientRect();
    setTranslationWidth(Math.max(30, Math.min(70, ((event.clientX - rect.left) / rect.width) * 100)));
  }
  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>, target: "library" | "translation") {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const change = event.key === "ArrowLeft" ? -2 : 2;
    if (target === "library") setBrowserWidth((current) => Math.max(24, Math.min(50, current + change)));
    else setTranslationWidth((current) => Math.max(30, Math.min(70, current + change)));
  }
  function receiveSelection(selection: SelectionDraft) {
    const existing = study.annotations.find((item) => item.article === selection.article && item.language === selection.language && item.start === selection.start && item.end === selection.end);
    const halfToolbar = Math.min(185, (window.innerWidth - 24) / 2);
    setSelectionDraft({ ...selection, x: Math.max(halfToolbar + 12, Math.min(window.innerWidth - halfToolbar - 12, selection.x)), y: Math.max(12, selection.y) });
    setAnnotationNoteDraft(existing?.note || "");
    setAnnotationNoteOpen(false);
  }
  function updateSelectionAnnotation(change: { highlight?: HighlightColor | null; bold?: boolean; underline?: boolean; note?: string }) {
    if (!selectionDraft) return;
    setStudy((current) => {
      const existingIndex = current.annotations.findIndex((item) => item.article === selectionDraft.article && item.language === selectionDraft.language && item.start === selectionDraft.start && item.end === selectionDraft.end);
      const existing = existingIndex >= 0 ? current.annotations[existingIndex] : undefined;
      const now = new Date().toISOString();
      const styles = {
        ...(existing?.styles || {}),
        ...(change.highlight !== undefined ? { highlight: change.highlight || undefined } : {}),
        ...(change.bold !== undefined ? { bold: change.bold } : {}),
        ...(change.underline !== undefined ? { underline: change.underline } : {}),
      };
      const next: TextAnnotation = {
        id: existing?.id || (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`),
        article: selectionDraft.article,
        language: selectionDraft.language,
        start: selectionDraft.start,
        end: selectionDraft.end,
        quote: selectionDraft.quote,
        styles,
        note: change.note !== undefined ? change.note.trim() : existing?.note || "",
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };
      const hasStyle = Boolean(next.styles.highlight || next.styles.bold || next.styles.underline);
      if (!hasStyle && !next.note) return { ...current, annotations: current.annotations.filter((_, index) => index !== existingIndex) };
      if (existingIndex < 0) return { ...current, annotations: [...current.annotations, next] };
      return { ...current, annotations: current.annotations.map((item, index) => index === existingIndex ? next : item) };
    });
  }
  function openSavedAnnotation(annotationId: string) {
    const annotation = study.annotations.find((item) => item.id === annotationId);
    if (!annotation) return;
    setSelectionDraft({ ...annotation, x: window.innerWidth / 2, y: 146 });
    setAnnotationNoteDraft(annotation.note);
    setAnnotationNoteOpen(true);
  }
  function removeAnnotation(annotationId: string) {
    if (!window.confirm("确定删除这条文字批注吗？")) return;
    setStudy((current) => ({ ...current, annotations: current.annotations.filter((item) => item.id !== annotationId) }));
    if (selectedAnnotation?.id === annotationId) setSelectionDraft(null);
  }
  function exportStudy() {
    const blob = new Blob([JSON.stringify(study, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "company-law-study-backup.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }
  function importStudy(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StudyState;
        if (!Array.isArray(parsed.learned) || !Array.isArray(parsed.favorites)) throw new Error("Invalid backup");
        setStudy({ ...initialStudy, ...parsed, annotations: Array.isArray(parsed.annotations) ? parsed.annotations : [] });
        setSelectedNumber(parsed.lastArticle || 1);
      } catch { window.alert("无法读取该备份文件，请确认它由本学习工具导出。"); }
    };
    reader.readAsText(file);
    event.target.value = "";
  }
  async function importEnglishPdf(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportingEnglish(true);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url,
      ).toString();
      const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      const pages: string[] = [];
      const pageLimit = Math.min(document.numPages, 60);
      for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(content.items.map((item) => {
          if (!("str" in item)) return "";
          return `${item.str}${"hasEOL" in item && item.hasEOL ? "\n" : " "}`;
        }).join(""));
      }
      const source = pages.join("\n");
      const starts: { number: number; index: number; marker: string }[] = [];
      let cursor = 0;
      for (let number = 1; number <= 266; number += 1) {
        const marker = `Article ${number} `;
        const index = source.indexOf(marker, cursor);
        if (index < 0) throw new Error(`未识别到 Article ${number}`);
        starts.push({ number, index, marker });
        cursor = index + marker.length;
      }
      const imported: Record<string, string> = {};
      starts.forEach((item, index) => {
        const fallbackEnd = source.indexOf("Securities Law of the", item.index);
        const end = starts[index + 1]?.index ?? (fallbackEnd > item.index ? fallbackEnd : source.length);
        imported[String(item.number)] = source.slice(item.index + item.marker.length, end)
          .replace(/Company Law of the People's Republic of China \(Revised in 2023\)/g, "")
          .replace(/\b\d+\s*\/\s*59\b/g, "")
          .replace(/Chapter [IVXLCDM]+[^\n]*/g, "")
          .replace(/Section \d+[^\n]*/g, "")
          .replace(/\s+/g, " ")
          .trim();
      });
      window.localStorage.setItem(englishStorageKey, JSON.stringify(imported));
      setEnglishArticles(imported);
      setEnglishSource("custom");
    } catch (error) {
      window.alert(`英文PDF导入失败：${error instanceof Error ? error.message : "无法识别文件"}`);
    } finally {
      setImportingEnglish(false);
      event.target.value = "";
    }
  }
  async function enablePreciseAlignment(silent = false) {
    if (translatorStatus === "checking" || translatorStatus === "downloading" || translatorStatus === "ready") return;
    const translator = getBrowserTranslatorApi();
    if (!translator) {
      setTranslatorStatus("unsupported");
      if (!silent) window.alert("当前浏览器不支持本机翻译模型。网站会继续使用法律术语库与位置对齐，不影响其他功能。");
      return;
    }
    setTranslatorStatus("checking");
    setTranslatorProgress(0);
    try {
      const pairs = [
        { sourceLanguage: "zh", targetLanguage: "en" },
        { sourceLanguage: "en", targetLanguage: "zh" },
      ];
      const availability = await Promise.all(pairs.map((pair) => translator.availability(pair)));
      if (availability.some((item) => item === "unavailable")) {
        setTranslatorStatus("unsupported");
        if (!silent) window.alert("当前浏览器的本机模型暂不支持中英双向翻译。网站会继续使用内置法律术语库。");
        return;
      }
      if (availability.some((item) => item !== "available")) setTranslatorStatus("downloading");
      const pairProgress = [availability[0] === "available" ? 1 : 0, availability[1] === "available" ? 1 : 0];
      const sessions = await Promise.all(pairs.map((pair, index) => translator.create({
        ...pair,
        monitor(monitor) {
          monitor.addEventListener("downloadprogress", (event) => {
            pairProgress[index] = typeof event.loaded === "number" ? event.loaded : pairProgress[index];
            setTranslatorProgress(Math.round(((pairProgress[0] + pairProgress[1]) / 2) * 100));
          });
        },
      })));
      zhToEnTranslatorRef.current = sessions[0];
      enToZhTranslatorRef.current = sessions[1];
      setTranslatorProgress(100);
      setTranslatorStatus("ready");
    } catch {
      setTranslatorStatus("error");
      if (!silent) window.alert("本机翻译模型没有成功启用。请保持联网后重试一次；下载完成后即可离线使用。");
    }
  }
  function handleWordHover(payload: WordHoverPayload | null) {
    const requestId = hoverRequestRef.current + 1;
    hoverRequestRef.current = requestId;
    setDynamicAlignment({ chinese: [], english: [] });
    if (!payload) {
      setActiveLinkedTerms([]);
      return;
    }
    setActiveLinkedTerms(payload.ids);
    if (payload.exact || translatorStatus !== "ready") return;
    const sourceText = payload.language === "zh" ? selected.chinese : englishArticles[String(selected.number)] || "";
    const targetText = payload.language === "zh" ? englishArticles[String(selected.number)] || "" : selected.chinese;
    const session = payload.language === "zh" ? zhToEnTranslatorRef.current : enToZhTranslatorRef.current;
    const sourceWord = payload.text.trim();
    if (!sourceWord || !targetText || !session) return;
    void session.translate(sourceWord).then((translation) => {
      if (hoverRequestRef.current !== requestId) return;
      const sourceRatio = payload.start / Math.max(1, sourceText.length);
      const targetRange = findBestTranslatedRange(targetText, translation, payload.language === "zh" ? "en" : "zh", sourceRatio);
      if (!targetRange) return;
      const id = `smart-${requestId}`;
      const label = `${sourceWord} · ${trimTranslation(translation)}`;
      const sourceRange: LinkedTermRange = { id, start: payload.start, end: payload.end, label, priority: 20 };
      const translatedRange: LinkedTermRange = { id, ...targetRange, label, priority: 20 };
      setDynamicAlignment(payload.language === "zh"
        ? { chinese: [sourceRange], english: [translatedRange] }
        : { chinese: [translatedRange], english: [sourceRange] });
      setActiveLinkedTerms([id]);
    }).catch(() => { /* keep the deterministic offline fallback for this word */ });
  }
  function resetStudy() {
    if (window.confirm("确定清除本机中的学习进度、收藏、笔记和文字批注吗？建议先导出备份。")) {
      setStudy(initialStudy);
      setSelectedNumber(1);
      setArticleJumpInput("1");
    }
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand-mark">CL</div>
        <div className="brand-copy"><strong>公司法英语学习室</strong><span>Company Law Lab · v3.1.4</span></div>
        <button
          className="sidebar-collapse-toggle"
          type="button"
          onClick={() => setSidebarCollapsed((current) => !current)}
          aria-label={sidebarCollapsed ? "展开主导航" : "折叠主导航"}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? "展开主导航" : "折叠主导航"}
        >
          <span aria-hidden="true">{sidebarCollapsed ? "›" : "‹"}</span>
        </button>
        <nav className="main-nav" aria-label="主要功能">
          {navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => changeView(item.id)}><span className="nav-icon" aria-hidden="true">{item.icon}</span><span className="nav-label-full">{item.label}</span><span className="nav-label-short">{item.short}</span><small>{item.sub}</small></button>)}
        </nav>
        <div className="coming-soon"><span>待补充资料</span><p>司法解释 · 法考练习</p></div>
      </aside>

      <main className={`main-area ${view === "library" ? "library-mode" : ""}`}>
        <header className="topbar">
          <div><span className="eyebrow">2023 REVISION · EFFECTIVE 1 JULY 2024</span><h1>{view === "library" ? "双语条文库" : view === "learn" ? "课程学习" : "我的学习记录"}</h1></div>
        </header>

        {view === "library" && <section ref={libraryLayoutRef} className={`library-layout ${mobileReaderOpen ? "mobile-reader-open" : ""}`} style={{ "--browser-width": `${browserWidth}%` } as CSSProperties}>
          <div className="article-browser">
            <div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索条号、中文或英文关键词" aria-label="搜索条文" /></div>
            <div className="filters"><select value={chapter} onChange={(e) => { setChapter(Number(e.target.value)); setTopic(0); }} aria-label="按章节筛选"><option value={0}>全部章节</option>{lawData.chapters.map((item) => <option key={item.number} value={item.number}>第 {item.number} 章 · {item.titleZh}</option>)}</select><span>{filteredArticles.length} 条</span></div>
            <div className={`english-import ${englishImported ? "ready" : ""}`}><div><strong>{englishSource === "custom" ? "自定义英文译本已导入" : "默认英文译本已内置"}</strong><small>{englishSource === "custom" ? "266条仅保存在本机，可再次替换" : "首次打开即可使用，也可选择自己的PDF替换"}</small></div><button disabled={importingEnglish} onClick={() => englishImportRef.current?.click()}>{importingEnglish ? "解析中…" : "替换PDF"}</button><input ref={englishImportRef} type="file" accept="application/pdf" onChange={importEnglishPdf} hidden /></div>
            <div className="topic-strip" aria-label="知识点筛选"><button className={topic === 0 ? "active" : ""} onClick={() => setTopic(0)}>全部</button>{lawData.topics.map((item) => <button key={item.id} className={topic === item.id ? "active" : ""} onClick={() => { setTopic(item.id); setChapter(0); }}>{item.titleZh}</button>)}</div>
            <div ref={articleListRef} className="article-list" onScroll={(event) => { articleListScrollRef.current = event.currentTarget.scrollTop; }}>
              {filteredArticles.map((article) => { const english = englishArticles[String(article.number)] || "尚未导入英文译本"; return <button key={article.number} data-article-number={article.number} className={selectedNumber === article.number ? "selected" : ""} onClick={() => openArticle(article.number)}><span className="article-no">{String(article.number).padStart(3, "0")}</span><span className="article-preview"><strong>第 {article.number} 条</strong><small>{english.slice(0, 90)}{english.length > 90 ? "…" : ""}</small></span><span className="status-dot">{study.favorites.includes(article.number) ? "★" : ""}</span></button>; })}
              {!filteredArticles.length && <p className="empty-state">没有找到相应条文。</p>}
            </div>
          </div>

          <div className="pane-resizer outer-resizer" role="separator" aria-label="调整条文导航栏宽度" aria-orientation="vertical" tabIndex={0} onPointerDown={beginResize} onPointerMove={resizeLibrary} onKeyDown={(event) => resizeWithKeyboard(event, "library")}><i /></div>

          <article ref={articleReaderRef} className={`article-reader ${readerFullscreen ? "fullscreen" : ""}`} style={{ "--reader-font-scale": readerFontScale } as CSSProperties}>
            <div className="reader-heading">
              <div className="reader-title-cluster"><button className="mobile-reader-back" onClick={returnToArticleList} aria-label="返回条文列表"><span aria-hidden="true">‹</span>条文列表</button><div className="reader-title"><span className="topic-label"><b>{selected.topicZh}</b><em>{selected.topicEn}</em></span><div className="article-title-line"><h2>第 {selected.number} 条 <em>Article {selected.number}</em></h2><p>第 {selected.chapter} 章 · {selected.chapterZh}</p></div></div></div>
              <div className="reader-actions"><div className="reader-stepper"><button disabled={selected.number === 1} onClick={() => openArticle(selected.number - 1, articleStudyOrigin)} aria-label="上一条" title="上一条">‹</button><label><input value={articleJumpInput} inputMode="numeric" aria-label="输入条文编号" onChange={(event) => setArticleJumpInput(event.target.value.replace(/\D/g, "").slice(0, 3))} onBlur={commitArticleJump} onKeyDown={(event) => { if (event.key === "Enter") { event.currentTarget.blur(); } else if (event.key === "Escape") { setArticleJumpInput(String(selectedNumber)); event.currentTarget.blur(); } }} /><span>/ {lawData.meta.articleCount}</span></label><button disabled={selected.number === lawData.meta.articleCount} onClick={() => openArticle(selected.number + 1, articleStudyOrigin)} aria-label="下一条" title="下一条">›</button></div>{readerFullscreen && <div className="font-scale-controls" aria-label="调整正文大小"><button disabled={readerFontScale <= .8} onClick={() => setReaderFontScale((current) => Math.max(.8, Number((current - .1).toFixed(1))))} aria-label="缩小正文">A−</button><span>{Math.round(readerFontScale * 100)}%</span><button disabled={readerFontScale >= 1.8} onClick={() => setReaderFontScale((current) => Math.min(1.8, Number((current + .1).toFixed(1))))} aria-label="放大正文">A＋</button></div>}<button className={`alignment-control ${translatorStatus === "ready" ? "ready" : ""}`} disabled={translatorStatus === "checking" || translatorStatus === "downloading" || translatorStatus === "unsupported" || translatorStatus === "ready"} onClick={() => void enablePreciseAlignment()} title="首次下载浏览器自带的中英模型，之后在本机离线对齐普通词语">{translatorLabel}</button><button className={study.favorites.includes(selected.number) ? "active" : ""} onClick={() => toggleFavorite(selected.number)} aria-label="收藏本条">{study.favorites.includes(selected.number) ? "★ 已收藏" : "☆ 收藏"}</button><button className={showArticleAnnotations ? "annotation-active" : ""} onClick={() => setShowArticleAnnotations((current) => !current)}>批注 {currentArticleAnnotations.length}</button><button onClick={() => setReaderFullscreen((current) => !current)}>{readerFullscreen ? "退出全屏" : "全屏阅读"} <span aria-hidden="true">{readerFullscreen ? "×" : "⛶"}</span></button>{articleStudyOrigin && <button className="reader-context-back" onClick={returnToStudyOrigin} aria-label={articleStudyOrigin.kind === "topic" ? "返回专题学习" : "返回章节学习"} title={articleStudyOrigin.kind === "topic" ? `返回${articleStudyOrigin.courseLabel} · ${articleStudyOrigin.unitLabel}` : `返回第${articleStudyOrigin.chapter}章学习`}>↩</button>}</div>
            </div>

            {showArticleAnnotations && <aside className="article-annotation-panel">
              <div className="annotation-panel-heading"><div><strong>第 {selected.number} 条批注</strong></div><button onClick={() => setShowArticleAnnotations(false)} aria-label="关闭本条批注">×</button></div>
              {currentArticleAnnotations.length ? <div className="article-annotation-list">{currentArticleAnnotations.map((item) => <article key={item.id}>
                <button className="annotation-record-main" onClick={() => openSavedAnnotation(item.id)}><span>{item.language === "zh" ? "中文" : "ENGLISH"} · {item.styles.highlight ? "高亮" : item.styles.bold ? "加粗" : item.styles.underline ? "划线" : "备注"}</span><blockquote>{item.quote}</blockquote>{item.note && <p>{item.note}</p>}</button>
                <button className="delete-annotation" onClick={() => removeAnnotation(item.id)}>删除</button>
              </article>)}</div> : <p className="empty-annotations">在中英文正文中选中文字，即可添加高亮、加粗、划线或备注。</p>}
            </aside>}

            <div ref={translationGridRef} className="translation-grid adjustable" style={{ "--translation-width": `${translationWidth}%` } as CSSProperties}>
              <section lang="en"><span className="language-tag english">ENGLISH · LOCAL REFERENCE</span><h3>Article {selected.number}</h3>{englishArticles[String(selected.number)] ? <AnnotatedText article={selected.number} language="en" text={englishArticles[String(selected.number)]} annotations={study.annotations} termRanges={[...linkedTermRanges.english, ...dynamicAlignment.english]} activeTermIds={activeLinkedTerms} onWordHover={handleWordHover} onSelect={receiveSelection} onOpenAnnotation={openSavedAnnotation} /> : <div className="english-placeholder"><strong>英文文本尚未导入</strong><p>点击左侧“选择PDF”，网站会在本机解析你提供的英文版文件。</p><button onClick={() => englishImportRef.current?.click()}>导入英文PDF</button></div>}</section>
              <div className="pane-resizer translation-resizer" role="separator" aria-label="调整中英文对照宽度" aria-orientation="vertical" tabIndex={0} onPointerDown={beginResize} onPointerMove={resizeTranslation} onKeyDown={(event) => resizeWithKeyboard(event, "translation")}><i /></div>
              <section lang="zh-CN"><span className="language-tag">中文 · 权威文本</span><h3>第 {selected.number} 条</h3><AnnotatedText article={selected.number} language="zh" text={selected.chinese} annotations={study.annotations} termRanges={[...linkedTermRanges.chinese, ...dynamicAlignment.chinese]} activeTermIds={activeLinkedTerms} onWordHover={handleWordHover} onSelect={receiveSelection} onOpenAnnotation={openSavedAnnotation} /></section>
            </div>
            <div className="note-box"><label htmlFor="article-note"><span>我的笔记</span></label><textarea id="article-note" value={study.notes[String(selected.number)] || ""} onChange={(e) => setStudy((current) => ({ ...current, notes: { ...current.notes, [String(selected.number)]: e.target.value } }))} placeholder="记录规则要点、术语或疑问……" /></div>
          </article>
        </section>}

        {view === "library" && selectionDraft && <div className={`selection-toolbar ${annotationNoteOpen ? "note-open" : ""}`} style={{ left: `${selectionDraft.x}px`, top: `${selectionDraft.y}px` }} onMouseDown={(event) => { if (!(event.target as HTMLElement).closest("textarea")) event.preventDefault(); }}>
          <div className="selection-summary"><span>{selectionDraft.language === "zh" ? "中文" : "EN"}</span><p>{selectionDraft.quote.length > 58 ? `${selectionDraft.quote.slice(0, 58)}…` : selectionDraft.quote}</p></div>
          <div className="annotation-tools">
            {(["yellow", "green", "blue", "rose"] as HighlightColor[]).map((color) => <button key={color} className={`color-tool ${color} ${selectedAnnotation?.styles.highlight === color ? "active" : ""}`} aria-label={`${color}高亮`} title="高亮" onClick={() => updateSelectionAnnotation({ highlight: selectedAnnotation?.styles.highlight === color ? null : color })}><i /></button>)}
            <span className="tool-divider" />
            <button className={selectedAnnotation?.styles.bold ? "active" : ""} title="加粗" onClick={() => updateSelectionAnnotation({ bold: !selectedAnnotation?.styles.bold })}><b>B</b></button>
            <button className={selectedAnnotation?.styles.underline ? "active" : ""} title="划线" onClick={() => updateSelectionAnnotation({ underline: !selectedAnnotation?.styles.underline })}><u>U</u></button>
            <button className={annotationNoteOpen ? "active note-tool" : "note-tool"} onClick={() => setAnnotationNoteOpen((current) => !current)}>备注</button>
          </div>
          {annotationNoteOpen && <div className="annotation-note-editor"><textarea autoFocus value={annotationNoteDraft} onChange={(event) => setAnnotationNoteDraft(event.target.value)} placeholder="写下规则要点、翻译辨析或疑问……" /><div><button onClick={() => { setAnnotationNoteOpen(false); setSelectionDraft(null); window.getSelection()?.removeAllRanges(); }}>取消</button><button className="save-note" onClick={() => { updateSelectionAnnotation({ note: annotationNoteDraft }); setAnnotationNoteOpen(false); setSelectionDraft(null); window.getSelection()?.removeAllRanges(); }}>保存备注</button></div></div>}
        </div>}

        {view === "learn" && <section className="course-learning">
          <nav className="course-switcher" aria-label="课程学习分类">
            <button className={courseSection === "topics" ? "active" : ""} onClick={() => setCourseSection("topics")}><span>专题主线</span><small>Topic Courses</small></button>
            <button className={courseSection === "chapters" ? "active" : ""} onClick={() => setCourseSection("chapters")}><span>法条章节</span><small>Statutory Chapters</small></button>
          </nav>

          {courseSection === "topics" ? <TopicCourse key={`topic-course-${topicResumeRequest?.token || 0}`} onOpenArticle={(number, origin) => openArticle(number, { kind: "topic", ...origin })} onOpenChapter={openChapterCourse} resumeRequest={topicResumeRequest} onClearResume={() => setTopicResumeRequest(null)} /> : <section className="chapter-learning simplified">
          <div className="chapter-content">
            <div className="chapter-select-bar"><label htmlFor="learning-chapter">当前章节</label><select id="learning-chapter" value={learningChapter} onChange={(event) => { setLearningChapter(Number(event.target.value)); setLearningStep(1); setRevealedTerm(null); }}>{lawData.chapters.map((item) => <option key={item.number} value={item.number}>第 {item.number} 章 · {item.titleZh}</option>)}</select><span>第 {currentLearningChapter.start}—{currentLearningChapter.end} 条</span></div>

            <section className="chapter-hero compact">
              <div className="chapter-number">{String(currentLearningChapter.number).padStart(2, "0")}</div>
              <div className="chapter-title"><h2>第 {currentLearningChapter.number} 章 · {currentLearningChapter.titleZh}</h2><p>{currentLearningChapter.titleEn}</p></div>
              <div className="chapter-progress"><div><span>本章进度</span><strong>{chapterProgress}%</strong></div><div className="progress-track light"><i style={{ width: `${chapterProgress}%` }} /></div></div>
            </section>

            <nav className="learning-steps clear" aria-label="本章学习路径">
              {([1, 2, 3, 4] as const).map((step) => <button key={step} className={learningStep === step ? "active" : learningStep > step ? "done" : ""} onClick={() => changeLearningStep(step)}><span>{learningStep > step ? "✓" : `0${step}`}</span><strong>{step === 1 ? "章节框架" : step === 2 ? "核心概念" : step === 3 ? "核心表达" : "重点条文"}</strong></button>)}
            </nav>

            <div ref={learningStageRef} className="learning-stage">
              {learningStep === 1 && <section className="learning-section focused">
                <div className="section-heading simple"><h2>章节框架</h2><strong>{currentLearningChapter.themes.length} 个主题</strong></div>
                <div className="overview-grid concise">{currentLearningChapter.themes.map((item) => <article key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><strong>{item.articles}</strong></div></article>)}</div>
              </section>}

              {learningStep === 2 && <section className="learning-section focused">
                <div className="section-heading simple"><h2>核心概念</h2><strong>{chapterMasteredCount} / {currentChapterTerms.length} 已掌握</strong></div>
                <div className="concept-grid">{currentChapterTerms.map((item) => {
                  const revealed = revealedTerm === item.term;
                  const mastered = study.masteredTerms.includes(item.term);
                  return <article key={item.term} className={`${revealed ? "revealed" : ""} ${mastered ? "mastered" : ""}`}>
                    <button className="concept-main" onClick={() => setRevealedTerm(revealed ? null : item.term)} aria-expanded={revealed}><span className="term-category">{item.category}</span><h3>{item.term}</h3><h4>{item.chinese}</h4><span className="concept-toggle">{revealed ? "收起" : "展开"}</span></button>
                    {revealed && <div className="concept-detail"><p>{item.explanation}</p><blockquote>{item.usage}</blockquote><div className="concept-actions"><button className={mastered ? "complete" : ""} onClick={() => toggleNamedList("masteredTerms", item.term)}>{mastered ? "✓ 已掌握" : "标为已掌握"}</button>{item.articles.map((number) => <button key={number} onClick={() => openArticleFromChapter(number)}>Art. {number} →</button>)}</div></div>}
                  </article>;
                })}</div>
              </section>}

              {learningStep === 3 && <section className="learning-section focused">
                <div className="section-heading simple"><h2>核心表达</h2><strong>{chapterExpressionCount} / {currentLearningChapter.expressions.length} 已学</strong></div>
                <div className="highlight-legend"><span><i className="entity" />主体</span><span><i className="rule" />规则</span><span><i className="condition" />条件</span><span><i className="consequence" />后果</span></div>
                <div className="expression-list">{currentLearningChapter.expressions.map((item, index) => {
                  const learned = study.learnedExpressions.includes(item.id);
                  return <article key={item.id} className={learned ? "learned" : ""}><header><div><span>{String(index + 1).padStart(2, "0")} · ARTICLE {item.article}</span><h3>{item.titleZh}</h3></div><button className={learned ? "complete" : ""} onClick={() => toggleNamedList("learnedExpressions", item.id)}>{learned ? "✓ 已学" : "标为已学"}</button></header><div className="expression-text"><p lang="en">{renderSegments(item.english)}</p><p lang="zh-CN">{renderSegments(item.chinese)}</p></div><footer><button onClick={() => openArticleFromChapter(item.article)}>查看第 {item.article} 条全文 →</button></footer></article>;
                })}</div>
              </section>}

              {learningStep === 4 && <section className="learning-section focused">
                <div className="section-heading simple"><h2>重点条文</h2><strong>{currentLearningChapter.keyArticles.length} 条</strong></div>
                <div className="key-article-grid concise">{currentLearningChapter.keyArticles.map((item) => <button key={item.number} onClick={() => openArticleFromChapter(item.number)}><span>ART. {item.number}</span><h3>{item.title}</h3><small>阅读条文 →</small></button>)}</div>
              </section>}
            </div>

            <div className="learning-navigation"><button disabled={learningStep === 1} onClick={() => changeLearningStep((learningStep - 1) as 1 | 2 | 3 | 4)}>← 上一步</button><span>第 {learningStep} 步 / 4</span><button disabled={learningStep === 4} onClick={() => changeLearningStep((learningStep + 1) as 1 | 2 | 3 | 4)}>下一步 →</button></div>
          </div>
          </section>}
        </section>}

        {view === "progress" && <section className="progress-view">
          <div className="stats-grid"><article><span>收藏条文</span><strong>{study.favorites.length}</strong><small>条重点规则</small></article><article className="clickable-stat"><span>已写笔记</span><strong>{savedNotes.length}</strong><button onClick={openNoteHistory}>{savedNotes.length ? "查看笔记内容 →" : "暂无笔记"}</button></article><article className="clickable-stat"><span>文字批注</span><strong>{study.annotations.length}</strong><button onClick={openAnnotationHistory}>{study.annotations.length ? "查看批注内容 →" : "暂无批注"}</button></article><article><span>上次位置</span><strong>Art. {study.lastArticle}</strong><button onClick={() => openArticle(study.lastArticle)}>继续阅读 →</button></article></div>
          <div className="progress-panels"><section><div className="panel-title"><div><h2>最近与收藏</h2><p>直接回到需要复习的条文。</p></div></div><div className="saved-list">{[...new Set([study.lastArticle, ...study.favorites])].slice(0, 12).map((number) => <button key={number} onClick={() => openArticle(number)}><span>第 {number} 条</span><small>{lawData.articles[number - 1].topicZh}</small><b>→</b></button>)}</div></section><section className="data-panel"><div className="panel-title"><div><h2>本地数据</h2><p>学习记录只保存在当前浏览器。建议定期导出备份。</p></div></div><button className="primary" onClick={exportStudy}>导出学习记录</button><button onClick={() => importRef.current?.click()}>导入备份</button><button className="danger" onClick={resetStudy}>清除本机记录</button><input ref={importRef} type="file" accept="application/json" onChange={importStudy} hidden /></section></div>
          {showNoteHistory && <section ref={noteHistoryRef} className="note-history"><div className="panel-title history-section-title"><h2>条文笔记 <span>{savedNotes.length}</span></h2><button onClick={() => setShowNoteHistory(false)}>收起</button></div>{savedNotes.length ? <div className="note-history-list">{savedNotes.map(([number, content]) => <button key={number} onClick={() => openArticleNote(Number(number))}><span>第 {number} 条</span><p>{content}</p><small>打开原条文 →</small></button>)}</div> : <p className="empty-history">还没有条文笔记。</p>}</section>}
          {showAnnotationHistory && <section ref={annotationHistoryRef} className="annotation-history"><div className="panel-title history-section-title"><h2>文字批注 <span>{study.annotations.length}</span></h2><button onClick={() => setShowAnnotationHistory(false)}>收起</button></div>{study.annotations.length ? <div className="annotation-history-list">{[...study.annotations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((item) => <article key={item.id}>
            <button className="history-main" onClick={() => openAnnotationFromHistory(item.id)}><span>第 {item.article} 条 · {item.language === "zh" ? "中文" : "English"}</span><blockquote>{item.quote}</blockquote>{item.note && <p>{item.note}</p>}<small>{item.styles.highlight ? "高亮" : ""}{item.styles.bold ? " · 加粗" : ""}{item.styles.underline ? " · 划线" : ""}{item.note ? " · 备注" : ""}</small></button><button className="history-delete" onClick={() => removeAnnotation(item.id)}>删除</button>
          </article>)}</div> : <p className="empty-history">还没有文字批注。</p>}</section>}
        </section>}
      </main>
    </div>
  );
}
