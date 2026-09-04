"use client";

import { useMemo, useRef } from "react";

export type AnnotationLanguage = "zh" | "en";
export type HighlightColor = "yellow" | "green" | "blue" | "rose";

export type TextAnnotation = {
  id: string;
  article: number;
  language: AnnotationLanguage;
  start: number;
  end: number;
  quote: string;
  styles: {
    highlight?: HighlightColor;
    bold?: boolean;
    underline?: boolean;
  };
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type SelectionDraft = {
  article: number;
  language: AnnotationLanguage;
  start: number;
  end: number;
  quote: string;
  x: number;
  y: number;
};

export type LinkedTermRange = {
  id: string;
  start: number;
  end: number;
  label: string;
  priority?: number;
};

export type WordHoverPayload = {
  ids: string[];
  language: AnnotationLanguage;
  start: number;
  end: number;
  text: string;
  exact: boolean;
};

type AnnotatedTextProps = {
  article: number;
  language: AnnotationLanguage;
  text: string;
  annotations: TextAnnotation[];
  termRanges?: LinkedTermRange[];
  activeTermIds?: string[];
  onWordHover?: (payload: WordHoverPayload | null) => void;
  onSelect: (selection: SelectionDraft) => void;
  onOpenAnnotation: (annotationId: string) => void;
};

export function AnnotatedText({ article, language, text, annotations, termRanges = [], activeTermIds = [], onWordHover, onSelect, onOpenAnnotation }: AnnotatedTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const relevantAnnotations = useMemo(
    () => annotations.filter((item) => item.article === article && item.language === language && item.start < text.length && item.end > 0 && text.slice(item.start, item.end) === item.quote),
    [annotations, article, language, text],
  );

  const segments = useMemo(() => {
    const boundaries = new Set([0, text.length]);
    relevantAnnotations.forEach((item) => {
      boundaries.add(Math.max(0, Math.min(text.length, item.start)));
      boundaries.add(Math.max(0, Math.min(text.length, item.end)));
    });
    termRanges.forEach((item) => {
      boundaries.add(Math.max(0, Math.min(text.length, item.start)));
      boundaries.add(Math.max(0, Math.min(text.length, item.end)));
    });
    const points = [...boundaries].sort((a, b) => a - b);
    return points.slice(0, -1).map((start, index) => {
      const end = points[index + 1];
      const active = relevantAnnotations.filter((item) => item.start < end && item.end > start);
      const linkedTerms = termRanges.filter((item) => item.start < end && item.end > start);
      return { start, end, text: text.slice(start, end), active, linkedTerms };
    });
  }, [relevantAnnotations, termRanges, text]);

  function captureSelection() {
    window.setTimeout(() => {
      const selection = window.getSelection();
      const container = textRef.current;
      if (!selection || !container || selection.isCollapsed || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return;

      const before = range.cloneRange();
      before.selectNodeContents(container);
      before.setEnd(range.startContainer, range.startOffset);
      const start = before.toString().length;
      const quote = range.toString();
      const end = start + quote.length;
      if (!quote.trim() || end <= start) return;

      const rect = range.getBoundingClientRect();
      onSelect({
        article,
        language,
        start,
        end,
        quote,
        x: rect.left + rect.width / 2,
        y: rect.top > 170 ? rect.top - 12 : rect.bottom + 12,
      });
    }, 0);
  }

  return <p ref={textRef} className="annotatable-text" onMouseUp={captureSelection} onKeyUp={captureSelection}>
    {segments.map((segment) => {
      const highlight = [...segment.active].reverse().find((item) => item.styles.highlight)?.styles.highlight;
      const bold = segment.active.some((item) => item.styles.bold);
      const underline = segment.active.some((item) => item.styles.underline);
      const hasNote = segment.active.some((item) => Boolean(item.note));
      const exactTerm = segment.linkedTerms.find((item) => (item.priority || 0) > 1);
      const linkedTerm = exactTerm || segment.linkedTerms[0];
      const hoverIds = exactTerm ? [exactTerm.id] : [...new Set(segment.linkedTerms.map((item) => item.id))];
      const termIsActive = segment.linkedTerms.some((item) => activeTermIds.includes(item.id));
      const className = [
        segment.active.length ? "saved-annotation" : "",
        highlight ? `saved-highlight-${highlight}` : "",
        bold ? "saved-bold" : "",
        underline ? "saved-underline" : "",
        hasNote ? "saved-note" : "",
        linkedTerm ? "bilingual-term" : "",
        termIsActive ? "bilingual-term-active" : "",
      ].filter(Boolean).join(" ");
      return <span
        key={`${segment.start}-${segment.end}`}
        className={className}
        data-annotation-ids={segment.active.map((item) => item.id).join(" ") || undefined}
        title={linkedTerm?.label || (hasNote ? "点击查看批注" : segment.active.length ? "已保存的文字标记" : undefined)}
        onMouseEnter={() => hoverIds.length && onWordHover?.({
          ids: hoverIds,
          language,
          start: segment.start,
          end: segment.end,
          text: segment.text,
          exact: Boolean(exactTerm),
        })}
        onMouseLeave={() => hoverIds.length && onWordHover?.(null)}
        onClick={() => segment.active.length && onOpenAnnotation(segment.active[segment.active.length - 1].id)}
      >{segment.text}</span>;
    })}
  </p>;
}
