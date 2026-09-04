export type HighlightTone = "entity" | "rule" | "condition" | "consequence";

export type HighlightSegment = {
  text: string;
  tone?: HighlightTone;
};

export type CoreExpression = {
  id: string;
  article: number;
  titleZh: string;
  titleEn: string;
  english: HighlightSegment[];
  chinese: HighlightSegment[];
  note: string;
};

export const chapterOneConceptTerms = [
  "enterprise legal person",
  "corporate property",
  "limited liability company",
  "joint stock limited company",
  "articles of association",
  "legal representative",
  "bona fide third party",
  "controlling shareholder",
  "actual controller",
  "related-party relationship",
  "joint and several liability",
  "piercing the corporate veil",
];

export const chapterOneThemes = [
  { number: "01", title: "公司与法人地位", articles: "Art. 2–3", description: "识别公司类型、独立人格与独立财产。" },
  { number: "02", title: "股东责任边界", articles: "Art. 4, 21–23", description: "理解有限责任、权利滥用与人格否认。" },
  { number: "03", title: "章程与组织自治", articles: "Art. 5, 17", description: "掌握章程的约束对象及公司基本自治空间。" },
  { number: "04", title: "法定代表人", articles: "Art. 10–11", description: "区分内部职权限制与对外行为效力。" },
  { number: "05", title: "控制与关联关系", articles: "Art. 22", description: "识别控股股东、实际控制人与关联关系风险。" },
  { number: "06", title: "决议效力", articles: "Art. 25–28", description: "建立无效、撤销与不成立的分析顺序。" },
];

export const chapterOneExpressions: CoreExpression[] = [
  {
    id: "extent-of",
    article: 4,
    titleZh: "表达责任范围",
    titleEn: "Defining the extent of liability",
    english: [
      { text: "A shareholder's liability is limited " },
      { text: "to the extent of", tone: "rule" },
      { text: " the contribution undertaken." },
    ],
    chinese: [
      { text: "股东以其" },
      { text: "认缴的出资额为限", tone: "rule" },
      { text: "承担责任。" },
    ],
    note: "to the extent of 用来限定责任、权利或义务的范围，是公司法英语中的高频结构。",
  },
  {
    id: "binding-on",
    article: 5,
    titleZh: "说明规范的约束对象",
    titleEn: "Identifying who is bound",
    english: [
      { text: "The articles of association " },
      { text: "are binding on", tone: "rule" },
      { text: " the company and its internal participants." },
    ],
    chinese: [
      { text: "公司章程对公司及其内部参与者" },
      { text: "具有约束力", tone: "rule" },
      { text: "。" },
    ],
    note: "be binding on 是表达法律文件、合同或决议对特定主体具有拘束力的标准搭配。",
  },
  {
    id: "bona-fide",
    article: 11,
    titleZh: "处理内部限制与外部交易",
    titleEn: "Protecting an outside party in good faith",
    english: [
      { text: "An internal restriction cannot prejudice a " },
      { text: "bona fide third party", tone: "entity" },
      { text: "." },
    ],
    chinese: [
      { text: "公司内部限制不得对抗" },
      { text: "善意相对人", tone: "entity" },
      { text: "。" },
    ],
    note: "bona fide 表示善意。阅读时要继续追问：谁负担证明责任、相对人是否知情。",
  },
  {
    id: "related-party",
    article: 22,
    titleZh: "识别利益输送媒介",
    titleEn: "Describing an improper connection",
    english: [
      { text: "A controller must not exploit a " },
      { text: "related-party relationship", tone: "condition" },
      { text: " to harm the company." },
    ],
    chinese: [
      { text: "控制主体不得利用" },
      { text: "关联关系", tone: "condition" },
      { text: "损害公司利益。" },
    ],
    note: "related-party relationship 是识别关联交易风险的入口；重点不只是存在关联，还包括是否造成利益损害。",
  },
  {
    id: "joint-several",
    article: 23,
    titleZh: "表达责任后果",
    titleEn: "Stating an enhanced liability consequence",
    english: [
      { text: "The abusing shareholder may bear " },
      { text: "joint and several liability", tone: "consequence" },
      { text: " for company debts." },
    ],
    chinese: [
      { text: "滥用公司独立人格的股东可能对公司债务承担" },
      { text: "连带责任", tone: "consequence" },
      { text: "。" },
    ],
    note: "joint and several liability 对应连带责任；看到它时应立刻识别责任主体、债权人和责任范围。",
  },
  {
    id: "court-revoke",
    article: 26,
    titleZh: "表达司法救济请求",
    titleEn: "Formulating a judicial remedy",
    english: [
      { text: "An eligible shareholder may " },
      { text: "request the people's court to revoke", tone: "consequence" },
      { text: " a defective resolution." },
    ],
    chinese: [
      { text: "符合条件的股东可以" },
      { text: "请求人民法院撤销", tone: "consequence" },
      { text: "存在瑕疵的决议。" },
    ],
    note: "request ... to revoke 是撤销之诉的核心动作表达；同时要核对原告资格、瑕疵类型与除斥期间。",
  },
];

export const chapterOneKeyArticles = [
  { number: 3, title: "独立法人地位", reason: "公司人格与财产独立的基础条款" },
  { number: 5, title: "公司章程", reason: "理解章程对内约束力的起点" },
  { number: 10, title: "法定代表人", reason: "识别任职规则与代表机制" },
  { number: 11, title: "代表行为效力", reason: "连接内部限制与外部交易安全" },
  { number: 15, title: "对外担保", reason: "公司决议程序与交易效力的交叉点" },
  { number: 22, title: "关联关系规制", reason: "控制主体不得损害公司利益" },
  { number: 23, title: "人格否认", reason: "有限责任例外与连带责任" },
  { number: 26, title: "决议撤销", reason: "公司决议瑕疵的主要救济" },
];
