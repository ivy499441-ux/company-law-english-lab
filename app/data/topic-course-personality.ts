export type BilingualText = {
  en: string;
  zh: string;
};

export type TopicTerm = {
  id: string;
  term: string;
  chinese: string;
  tier: "must-know" | "evidence" | "recognition";
  definitionEn: string;
  definitionZh: string;
  collocation: string;
  example: string;
  articleRefs: number[];
  usageNote?: string;
};

export type RuleBlock = {
  id: string;
  label: BilingualText;
  content: BilingualText;
};

export type RuleRoute = {
  id: string;
  title: BilingualText;
  articleParagraph: 1 | 2 | 3;
  articleLabel?: string;
  blocks: RuleBlock[];
  formula: BilingualText;
  feedback: Record<string, BilingualText>;
};

export type StatutoryParagraph = {
  paragraph: number;
  article?: number;
  citation?: string;
  routeId: RuleRoute["id"];
  heading: BilingualText;
  chineseAuthoritative: string;
  courseTranslation: string;
  focusExpressions: Array<{
    en: string;
    zh: string;
    tone: "concept" | "actor" | "conduct" | "threshold" | "consequence" | "evidence";
  }>;
};

export type HighlightLink = {
  id: string;
  en: string;
  zh: string;
  type:
    | "actor"
    | "concept"
    | "conduct"
    | "threshold"
    | "protected-party"
    | "consequence"
    | "liability-object"
    | "actor-structure"
    | "cross-reference"
    | "company-structure"
    | "burden"
    | "evidence-object"
    | "relationship"
    | "comparator";
};

export type Choice = {
  id: string;
  text: string;
  correct: boolean;
};

export type QuizItem = {
  id: string;
  type: "single" | "multiple";
  objective: string;
  prompt: BilingualText;
  choices: Choice[];
  explanation: BilingualText;
  errorTag: string;
  reviewUnitId: string;
};

export type CourseUnit = {
  id: string;
  order: number;
  type: "issue" | "map" | "vocabulary" | "rule-builder" | "statute" | "case" | "review";
  title: BilingualText;
  eyebrow: string;
  purpose: BilingualText;
  completionRule: string;
};

export type TopicCourse = {
  id: string;
  order: number;
  lawAsOf: string;
  title: BilingualText;
  primaryArticles: number[];
  supportingArticles: number[];
  durationMinutes: [number, number];
  difficulty: "foundation" | "application" | "advanced";
  languageMode: "english-first";
  disclaimer: BilingualText;
  objectives: BilingualText[];
  mapInstruction?: BilingualText;
  openingIssue: {
    heading: BilingualText;
    facts: string;
    prompt: BilingualText;
    choices: Choice[];
    explanation: BilingualText;
  };
  conceptMap: {
    defaultRules: Array<{
      id: string;
      article: number;
      title: BilingualText;
      rule: BilingualText;
    }>;
    exception: {
      id: string;
      article: number;
      title: BilingualText;
      rule: BilingualText;
    };
    routes: Array<{
      id: RuleRoute["id"];
      title: BilingualText;
      summary: BilingualText;
    }>;
  };
  terms: TopicTerm[];
  ruleRoutes: RuleRoute[];
  statute: StatutoryParagraph[];
  precisionNotes: BilingualText[];
  highlightMap: HighlightLink[];
  caseStudy: {
    id: string;
    title: BilingualText;
    facts: string;
    tasks: Array<{
      id: string;
      prompt: BilingualText;
      answer: BilingualText;
    }>;
    evidenceRanking: Array<{
      rank: number;
      fact: string;
      weight: "strong" | "supporting";
    }>;
    modelAnswer: string;
    label?: string;
    evidencePrompt?: string;
    writingPrompt?: string;
    writingHint?: string;
    answerPlaceholder?: string;
    minimumWords?: number;
    variant: {
      title: BilingualText;
      facts: string;
      question: BilingualText;
      answer: BilingualText;
    };
  };
  navigation?: {
    article: number;
    chapter: number;
  };
  quiz: QuizItem[];
  finalRecall: {
    prompts: string[];
    answers: string[];
  };
  units: CourseUnit[];
  completion: {
    passingScore: number;
    totalQuestions: number;
    message: BilingualText;
    nextActions: Array<{
      id: string;
      label: BilingualText;
      target: string;
    }>;
  };
  authorityNotes: Array<{
    id: string;
    label: string;
    url?: string;
    note: BilingualText;
  }>;
};

export const disregardingCorporatePersonalityCourse = {
  id: "disregarding-corporate-personality",
  order: 1,
  lawAsOf: "2026-08-20",
  title: {
    en: "Disregarding Corporate Personality",
    zh: "公司法人格否认",
  },
  primaryArticles: [23],
  supportingArticles: [3, 4, 21],
  durationMinutes: [25, 35],
  difficulty: "application",
  languageMode: "english-first",
  disclaimer: {
    en: "The English course text is an original study aid, not an official translation. The learner's imported English statute remains separately labelled as a local reference.",
    zh: "英文课程文案为原创学习译文，不是官方英译。用户导入的英文法条继续单独标注为本地参考译本。",
  },
  objectives: [
    {
      en: "Explain why a company normally bears its own debts.",
      zh: "说明公司原则上以自身财产承担债务。",
    },
    {
      en: "Build the statutory test under Article 23(1).",
      zh: "搭建第23条第1款的法定要件。",
    },
    {
      en: "Distinguish general, horizontal and sole-shareholder routes.",
      zh: "区分一般、横向和一人公司三条路径。",
    },
    {
      en: "Evaluate evidence of commingling without treating control alone as decisive.",
      zh: "判断混同证据的意义，不把控制关系本身视为决定性事实。",
    },
    {
      en: "State the legal consequence in accurate legal English.",
      zh: "用准确的法律英语表达责任后果。",
    },
  ],
  openingIssue: {
    heading: {
      en: "Who should pay the company's debt?",
      zh: "谁应当清偿公司债务？",
    },
    facts:
      "Nova Ltd. owes a supplier RMB 2 million. Its shareholder, Chen, controls every major decision. The company has insufficient assets to pay the debt.",
    prompt: {
      en: "Choose the best preliminary answer.",
      zh: "选择最准确的初步判断。",
    },
    choices: [
      {
        id: "a",
        text: "Chen must pay because a controlling shareholder is always responsible for company debts.",
        correct: false,
      },
      {
        id: "b",
        text: "Nova Ltd. is the debtor unless a statutory exception is established.",
        correct: true,
      },
      {
        id: "c",
        text: "Chen must pay whenever the company cannot pay.",
        correct: false,
      },
      {
        id: "d",
        text: "Control automatically proves commingling.",
        correct: false,
      },
    ],
    explanation: {
      en: "The company is a separate legal person and normally bears its own debts. Control, insolvency or close involvement does not by itself transfer the debt to a shareholder. Article 23 is an exception and must be separately established.",
      zh: "公司原则上自行承担债务。控制关系、资不抵债或深度参与经营都不会自动把债务转给股东；适用第23条必须另行证明其法定条件。",
    },
  },
  conceptMap: {
    defaultRules: [
      {
        id: "separate-personality",
        article: 3,
        title: {
          en: "Separate legal personality",
          zh: "公司独立人格",
        },
        rule: {
          en: "A company is a separate legal person with property of its own and is liable for its debts with all of that property.",
          zh: "公司具有独立法人地位和独立财产，并以全部财产对自身债务承担责任。",
        },
      },
      {
        id: "limited-liability",
        article: 4,
        title: {
          en: "Limited liability",
          zh: "股东有限责任",
        },
        rule: {
          en: "A shareholder is generally liable only to the extent of its subscribed contribution or subscribed shares.",
          zh: "股东原则上以认缴出资额或认购股份为限承担责任。",
        },
      },
    ],
    exception: {
      id: "article-23-exception",
      article: 23,
      title: {
        en: "Statutory exception",
        zh: "法定例外",
      },
      rule: {
        en: "The corporate form does not protect abusive conduct when the conditions in Article 23 are satisfied.",
        zh: "符合第23条条件时，公司形式不能保护滥用行为。",
      },
    },
    routes: [
      {
        id: "general",
        title: { en: "General disregard", zh: "一般人格否认" },
        summary: {
          en: "A shareholder abuses separate legal personality and limited liability to evade debts and seriously prejudice company creditors.",
          zh: "股东滥用公司独立人格和有限责任逃避债务，严重损害公司债权人利益。",
        },
      },
      {
        id: "horizontal",
        title: { en: "Horizontal disregard", zh: "横向人格否认" },
        summary: {
          en: "A shareholder uses two or more controlled companies to engage in the conduct described in paragraph 1.",
          zh: "股东利用其控制的两个以上公司实施第1款规定的行为。",
        },
      },
      {
        id: "sole-shareholder",
        title: { en: "Sole-shareholder rule", zh: "一人公司举证规则" },
        summary: {
          en: "The sole shareholder cannot prove that company property is independent from the shareholder's own property.",
          zh: "唯一股东不能证明公司财产独立于其自身财产。",
        },
      },
    ],
  },
  terms: [
    {
      id: "separate-legal-personality",
      term: "separate legal personality",
      chinese: "独立法人地位；公司独立人格",
      tier: "must-know",
      definitionEn: "The company is legally distinct from its shareholders.",
      definitionZh: "公司在法律上与股东相互独立。",
      collocation: "maintain a separate legal personality",
      example: "Separate legal personality is the starting point of the analysis.",
      articleRefs: [3, 23],
    },
    {
      id: "independent-corporate-property",
      term: "independent corporate property",
      chinese: "独立法人财产；公司独立财产",
      tier: "must-know",
      definitionEn: "Property belonging to the company rather than to its shareholders.",
      definitionZh: "归属于公司而非股东的财产。",
      collocation: "keep corporate property independent",
      example: "Independent property supports the company's ability to bear its own debts.",
      articleRefs: [3, 23],
    },
    {
      id: "limited-liability",
      term: "limited liability",
      chinese: "有限责任",
      tier: "must-know",
      definitionEn: "A shareholder's exposure is generally limited to its investment commitment.",
      definitionZh: "股东的责任原则上以其出资承诺为限。",
      collocation: "enjoy / abuse limited liability",
      example: "Limited liability is not a licence to evade debts.",
      articleRefs: [4, 23],
    },
    {
      id: "disregard-corporate-personality",
      term: "disregard the corporate personality",
      chinese: "否认公司人格",
      tier: "must-know",
      definitionEn: "Impose company-debt liability on another person when statutory conditions are met.",
      definitionZh: "符合法定条件时，使其他主体对公司债务承担责任。",
      collocation: "a court may disregard the corporate personality",
      example: "The corporate personality should be disregarded only in exceptional circumstances.",
      articleRefs: [23],
    },
    {
      id: "abuse",
      term: "abuse",
      chinese: "滥用",
      tier: "must-know",
      definitionEn: "Use a legal right or structure for an improper purpose or effect.",
      definitionZh: "以不当目的或方式利用法律权利或组织形式。",
      collocation: "abuse the company's separate status",
      example: "Mere control is different from abuse.",
      articleRefs: [21, 23],
    },
    {
      id: "evade-debts",
      term: "evade debts",
      chinese: "逃避债务",
      tier: "must-know",
      definitionEn: "Use arrangements to avoid payment of an existing or foreseeable obligation.",
      definitionZh: "利用安排逃避现有或可预见债务的清偿。",
      collocation: "use a company to evade debts",
      example: "The transfer left the debtor company without assets and enabled it to evade debts.",
      articleRefs: [23],
    },
    {
      id: "company-creditor",
      term: "company creditor",
      chinese: "公司债权人",
      tier: "must-know",
      definitionEn: "A person entitled to claim performance from the company.",
      definitionZh: "有权请求公司履行债务的主体。",
      collocation: "seriously prejudice company creditors",
      example: "Article 23 protects company creditors from abusive use of the corporate form.",
      articleRefs: [23],
    },
    {
      id: "joint-and-several-liability",
      term: "joint and several liability",
      chinese: "连带责任",
      tier: "must-know",
      definitionEn: "Liability under which a creditor may seek full performance from any person bearing that liability, subject to applicable rules.",
      definitionZh: "债权人可以依法请求任一连带责任人履行全部债务的责任形态。",
      collocation: "be jointly and severally liable for the debts",
      example: "The shareholder may be jointly and severally liable for the company's debts.",
      articleRefs: [23],
    },
    {
      id: "commingling-assets",
      term: "commingling of assets",
      chinese: "财产混同",
      tier: "evidence",
      definitionEn: "Company and shareholder assets, or assets of affiliated companies, are not separately maintained or distinguishable.",
      definitionZh: "公司与股东或者关联公司之间的财产未独立维持且无法区分。",
      collocation: "evidence of asset commingling",
      example: "Untraceable transfers may support a finding of asset commingling.",
      articleRefs: [23],
    },
    {
      id: "affiliated-company",
      term: "affiliated company",
      chinese: "关联公司",
      tier: "evidence",
      definitionEn: "A company connected through control or another relevant relationship.",
      definitionZh: "通过控制或其他相关关系相互联系的公司。",
      collocation: "affiliated companies under common control",
      example: "The two affiliated companies remained legally separate on paper.",
      articleRefs: [23, 265],
    },
    {
      id: "controlling-shareholder",
      term: "controlling shareholder",
      chinese: "控股股东",
      tier: "evidence",
      definitionEn: "A shareholder satisfying the statutory control standard.",
      definitionZh: "符合公司法法定控制标准的股东。",
      collocation: "companies controlled by the same shareholder",
      example: "A controlling relationship is relevant, but control alone does not establish abuse.",
      articleRefs: [22, 265],
    },
    {
      id: "burden-of-proof",
      term: "burden of proof",
      chinese: "举证责任",
      tier: "must-know",
      definitionEn: "Responsibility for proving a material fact.",
      definitionZh: "对重要事实承担证明责任。",
      collocation: "bear / shift the burden of proof",
      example: "Paragraph 3 places the burden of proof on the sole shareholder.",
      articleRefs: [23],
    },
    {
      id: "sole-shareholder-company",
      term: "sole-shareholder company",
      chinese: "只有一个股东的公司；一人公司",
      tier: "must-know",
      definitionEn: "A company with only one shareholder.",
      definitionZh: "仅有一个股东的公司。",
      collocation: "the sole shareholder must prove property independence",
      example: "The special burden-of-proof rule applies to a sole-shareholder company.",
      articleRefs: [23],
    },
    {
      id: "distinguishable-assets",
      term: "distinguishable assets",
      chinese: "可区分的财产",
      tier: "evidence",
      definitionEn: "Assets whose ownership and transactions can be separately identified.",
      definitionZh: "其所有权归属和交易流向能够分别识别的财产。",
      collocation: "the companies' assets remain distinguishable",
      example: "Separate ledgers may help show that the assets remain distinguishable.",
      articleRefs: [23],
    },
    {
      id: "pierce-corporate-veil",
      term: "pierce the corporate veil",
      chinese: "揭开公司面纱；公司人格否认",
      tier: "recognition",
      definitionEn: "A common comparative-law expression for looking beyond the corporate form.",
      definitionZh: "比较法中用于表示突破公司形式并追究其他主体责任的常见表达。",
      collocation: "pierce the corporate veil",
      example: "The phrase is useful for recognition, but it is not the statutory wording.",
      articleRefs: [23],
      usageNote: "Use 'disregarding corporate personality' as the primary course label for PRC Company Law.",
    },
  ],
  ruleRoutes: [
    {
      id: "general",
      title: { en: "Route A — General disregard", zh: "路径A——一般人格否认" },
      articleParagraph: 1,
      blocks: [
        {
          id: "actor",
          label: { en: "Actor", zh: "主体" },
          content: { en: "a company shareholder", zh: "公司股东" },
        },
        {
          id: "conduct",
          label: { en: "Conduct", zh: "行为" },
          content: {
            en: "abuses the company's separate legal-person status and the shareholder's limited liability",
            zh: "滥用公司法人独立地位和股东有限责任",
          },
        },
        {
          id: "debt-connection",
          label: { en: "Debt connection", zh: "债务联系" },
          content: { en: "uses the abuse to evade debts", zh: "借此逃避债务" },
        },
        {
          id: "harm",
          label: { en: "Harm threshold", zh: "损害门槛" },
          content: {
            en: "seriously prejudices the interests of company creditors",
            zh: "严重损害公司债权人利益",
          },
        },
        {
          id: "consequence",
          label: { en: "Consequence", zh: "法律后果" },
          content: {
            en: "bears joint and several liability for the company's debts",
            zh: "对公司债务承担连带责任",
          },
        },
      ],
      formula: {
        en: "Shareholder + Abuse + Debt evasion + Serious creditor harm → Joint and several liability",
        zh: "股东 + 滥用 + 逃避债务 + 严重损害债权人利益 → 连带责任",
      },
      feedback: {
        "actor-missing": {
          en: "Start by identifying who allegedly abused the corporate form.",
          zh: "先确定被指控滥用公司形式的主体。",
        },
        "abuse-missing": {
          en: "Control or share ownership alone is not the statutory conduct.",
          zh: "控制关系或持股本身不是第23条规定的滥用行为。",
        },
        "debt-connection-missing": {
          en: "Ask how the corporate form was used in relation to the debt.",
          zh: "继续判断公司形式如何被用于逃避债务。",
        },
        "harm-missing": {
          en: "Article 23 requires serious prejudice to company creditors.",
          zh: "第23条要求公司债权人利益受到严重损害。",
        },
        complete: {
          en: "Good. You have separated the actor, conduct, harm and legal consequence.",
          zh: "正确。你已经区分主体、行为、损害和责任后果。",
        },
      },
    },
    {
      id: "horizontal",
      title: { en: "Route B — Horizontal disregard", zh: "路径B——横向人格否认" },
      articleParagraph: 2,
      blocks: [
        {
          id: "controller",
          label: { en: "Controller", zh: "控制主体" },
          content: { en: "one shareholder", zh: "同一股东" },
        },
        {
          id: "companies",
          label: { en: "Company structure", zh: "公司结构" },
          content: { en: "two or more companies under its control", zh: "其控制的两个以上公司" },
        },
        {
          id: "incorporated-conduct",
          label: { en: "Required conduct", zh: "所需行为" },
          content: {
            en: "the conduct described in paragraph 1",
            zh: "第1款规定的滥用、逃债并严重损害债权人的行为",
          },
        },
        {
          id: "cross-company-liability",
          label: { en: "Consequence", zh: "法律后果" },
          content: {
            en: "each company is jointly and severally liable for the debts of any one of those companies",
            zh: "各公司对任一公司的债务承担连带责任",
          },
        },
      ],
      formula: {
        en: "Common control + Two or more companies + Paragraph 1 conduct → Cross-company joint and several liability",
        zh: "共同控制 + 两个以上公司 + 第1款行为 → 公司之间的连带责任",
      },
      feedback: {
        "control-only": {
          en: "Common control alone is insufficient. Return to the conduct described in paragraph 1.",
          zh: "共同控制本身不足以适用第2款，还需回到第1款规定的行为。",
        },
        "wrong-consequence": {
          en: "Paragraph 2 concerns liability across the controlled companies; it does not permanently merge them.",
          zh: "第2款规定受控制公司之间的连带责任，并不使其永久合并为同一主体。",
        },
        complete: {
          en: "Correct. You connected common control to paragraph 1 conduct and the cross-company consequence.",
          zh: "正确。你已经把共同控制、第1款行为和跨公司责任连接起来。",
        },
      },
    },
    {
      id: "sole-shareholder",
      title: { en: "Route C — Sole-shareholder rule", zh: "路径C——一人公司举证规则" },
      articleParagraph: 3,
      blocks: [
        {
          id: "company-structure",
          label: { en: "Company structure", zh: "公司结构" },
          content: { en: "a company with only one shareholder", zh: "只有一个股东的公司" },
        },
        {
          id: "burden-holder",
          label: { en: "Who bears the burden?", zh: "谁承担举证责任？" },
          content: { en: "the sole shareholder", zh: "唯一股东" },
        },
        {
          id: "fact-to-prove",
          label: { en: "What must be proved?", zh: "证明什么？" },
          content: {
            en: "company property is independent from the shareholder's own property",
            zh: "公司财产独立于股东自己的财产",
          },
        },
        {
          id: "failure-consequence",
          label: { en: "If proof fails", zh: "不能证明的后果" },
          content: {
            en: "the shareholder is jointly and severally liable for company debts",
            zh: "股东对公司债务承担连带责任",
          },
        },
      ],
      formula: {
        en: "Only one shareholder + Failure to prove property independence → Joint and several liability",
        zh: "只有一个股东 + 不能证明财产独立 → 连带责任",
      },
      feedback: {
        "wrong-burden-holder": {
          en: "Paragraph 3 places the burden on the sole shareholder, not the creditor.",
          zh: "第3款把举证责任配置给唯一股东，而不是公司债权人。",
        },
        "wrong-fact": {
          en: "The required proof concerns property independence, not merely formal company registration.",
          zh: "需要证明的是财产独立，而不是公司已完成形式上的登记。",
        },
        complete: {
          en: "Correct. You identified who must prove what and the consequence of failure.",
          zh: "正确。你已经确定举证主体、证明对象和举证失败的后果。",
        },
      },
    },
  ],
  statute: [
    {
      paragraph: 1,
      routeId: "general",
      heading: { en: "General disregard", zh: "一般人格否认" },
      chineseAuthoritative:
        "公司股东滥用公司法人独立地位和股东有限责任，逃避债务，严重损害公司债权人利益的，应当对公司债务承担连带责任。",
      courseTranslation:
        "Where a shareholder abuses the company's status as an independent legal person and the shareholder's limited liability to evade debts, thereby seriously prejudicing the interests of the company's creditors, the shareholder shall be jointly and severally liable for the company's debts.",
      focusExpressions: [
        { en: "status as an independent legal person", zh: "公司法人独立地位", tone: "concept" },
        { en: "limited liability", zh: "股东有限责任", tone: "concept" },
        { en: "abuses ... to evade debts", zh: "滥用……逃避债务", tone: "conduct" },
        { en: "seriously prejudicing the interests of", zh: "严重损害……利益", tone: "threshold" },
        { en: "be jointly and severally liable for", zh: "对……承担连带责任", tone: "consequence" },
      ],
    },
    {
      paragraph: 2,
      routeId: "horizontal",
      heading: { en: "Horizontal disregard", zh: "横向人格否认" },
      chineseAuthoritative:
        "股东利用其控制的两个以上公司实施前款规定行为的，各公司应当对任一公司的债务承担连带责任。",
      courseTranslation:
        "Where a shareholder uses two or more companies under its control to engage in the conduct specified in the preceding paragraph, each company shall be jointly and severally liable for the debts of any one of those companies.",
      focusExpressions: [
        { en: "two or more companies under its control", zh: "其控制的两个以上公司", tone: "actor" },
        { en: "conduct specified in the preceding paragraph", zh: "前款规定行为", tone: "conduct" },
        { en: "debts of any one of those companies", zh: "任一公司的债务", tone: "consequence" },
      ],
    },
    {
      paragraph: 3,
      routeId: "sole-shareholder",
      heading: { en: "Sole-shareholder rule", zh: "一人公司举证规则" },
      chineseAuthoritative:
        "只有一个股东的公司，股东不能证明公司财产独立于股东自己的财产的，应当对公司债务承担连带责任。",
      courseTranslation:
        "Where a company has only one shareholder and the shareholder is unable to prove that the company's property is independent from the shareholder's own property, the shareholder shall be jointly and severally liable for the company's debts.",
      focusExpressions: [
        { en: "has only one shareholder", zh: "只有一个股东", tone: "actor" },
        { en: "is unable to prove that", zh: "不能证明", tone: "evidence" },
        { en: "is independent from", zh: "独立于", tone: "evidence" },
        { en: "jointly and severally liable", zh: "承担连带责任", tone: "consequence" },
      ],
    },
  ],
  precisionNotes: [
    {
      en: "Control is not abuse. A controlling relationship is relevant, but paragraph 1 still requires abusive use, debt evasion and serious creditor harm.",
      zh: "控制不等于滥用。控制关系具有相关性，但第1款仍要求滥用、逃避债务和严重损害债权人利益。",
    },
    {
      en: "Shared personnel is not automatically commingling. Ask whether property, accounts and transactions remain separately identifiable.",
      zh: "人员交叉不当然构成混同，应继续判断财产、账户和交易能否分别识别。",
    },
    {
      en: "Insolvency is not enough. Business failure alone does not establish Article 23 liability.",
      zh: "资不抵债本身不足以适用第23条，正常经营失败不等于人格滥用。",
    },
    {
      en: "The consequence is dispute-specific. Imposing liability does not generally cancel the company's legal personality for all future matters.",
      zh: "责任后果针对具体争议，通常不会消灭公司在其他事项中的法人资格。",
    },
  ],
  highlightMap: [
    { id: "shareholder", en: "shareholder", zh: "公司股东|股东", type: "actor" },
    { id: "abuses", en: "abuses", zh: "滥用", type: "conduct" },
    {
      id: "independent-person",
      en: "status as an independent legal person",
      zh: "公司法人独立地位",
      type: "concept",
    },
    { id: "limited-liability", en: "limited liability", zh: "股东有限责任", type: "concept" },
    { id: "evade-debts", en: "evade debts", zh: "逃避债务", type: "conduct" },
    { id: "serious-prejudice", en: "seriously prejudicing", zh: "严重损害", type: "threshold" },
    { id: "creditors", en: "company's creditors", zh: "公司债权人", type: "protected-party" },
    {
      id: "joint-several",
      en: "jointly and severally liable",
      zh: "承担连带责任",
      type: "consequence",
    },
    { id: "company-debts", en: "company's debts", zh: "公司债务", type: "liability-object" },
    {
      id: "controlled-companies",
      en: "two or more companies under its control",
      zh: "其控制的两个以上公司",
      type: "actor-structure",
    },
    {
      id: "preceding-conduct",
      en: "conduct specified in the preceding paragraph",
      zh: "前款规定行为",
      type: "cross-reference",
    },
    {
      id: "any-company-debts",
      en: "debts of any one of those companies",
      zh: "任一公司的债务",
      type: "liability-object",
    },
    { id: "one-shareholder", en: "only one shareholder", zh: "只有一个股东", type: "company-structure" },
    { id: "unable-prove", en: "unable to prove", zh: "不能证明", type: "burden" },
    { id: "company-property", en: "company's property", zh: "公司财产", type: "evidence-object" },
    { id: "independent-from", en: "independent from", zh: "独立于", type: "relationship" },
    {
      id: "shareholder-property",
      en: "shareholder's own property",
      zh: "股东自己的财产",
      type: "comparator",
    },
  ],
  caseStudy: {
    id: "alpha-beta",
    title: { en: "Case file: Alpha and Beta", zh: "案例卷宗：甲公司与乙公司" },
    facts:
      "Lin owns and controls Alpha Ltd. and Beta Ltd. Both companies sell industrial equipment and use the same finance team and office. More importantly, customer payments owed to Alpha are frequently paid into Beta's account without supporting agreements. Funds move between the two accounts according to Lin's oral instructions, and the ledgers do not show which company owns the funds or bears particular expenses. Alpha later owes Supplier S RMB 3 million. After Supplier S demands payment, Alpha's remaining receivables are collected through Beta. Alpha is left without sufficient assets, while Beta continues the same business using the transferred funds.",
    tasks: [
      {
        id: "default-debtor",
        prompt: { en: "Identify the default debtor.", zh: "确定默认债务人。" },
        answer: {
          en: "Alpha is the contractual debtor. The analysis begins with Alpha's separate legal personality and responsibility for its own debts.",
          zh: "甲公司是合同债务人。分析应从甲公司的独立人格和自行承担债务开始。",
        },
      },
      {
        id: "select-route",
        prompt: { en: "Select the potentially applicable route.", zh: "选择可能适用的路径。" },
        answer: {
          en: "Article 23(2), horizontal disregard, is the best route because Lin controlled and used two companies in conduct that may satisfy paragraph 1.",
          zh: "最适合分析的是第23条第2款横向人格否认，因为林某控制并利用两家公司实施可能符合第1款的行为。",
        },
      },
      {
        id: "rank-evidence",
        prompt: { en: "Rank the evidence from strongest to weakest.", zh: "按证明力由强到弱排列证据。" },
        answer: {
          en: "Prioritise diverted receivables, untraceable transfers and indistinguishable ledgers. Shared business, staff and office are supporting context.",
          zh: "应优先考虑被转移的应收账款、无法追踪的资金划转和无法区分的账簿；共同业务、人员和办公地点属于辅助背景。",
        },
      },
      {
        id: "write-conclusion",
        prompt: { en: "Write a 60–100 word conclusion in English.", zh: "用60—100词英文写出结论。" },
        answer: {
          en: "Use an Issue–Rule–Application–Conclusion structure and avoid saying that common control alone proves liability.",
          zh: "采用争点—规则—适用—结论结构，避免把共同控制本身写成责任成立的充分条件。",
        },
      },
    ],
    evidenceRanking: [
      {
        rank: 1,
        fact: "Alpha's receivables were collected through Beta after payment was demanded.",
        weight: "strong",
      },
      {
        rank: 2,
        fact: "Funds moved without supporting transactions and could not be separately traced.",
        weight: "strong",
      },
      {
        rank: 3,
        fact: "The ledgers did not identify ownership of funds or allocation of expenses.",
        weight: "strong",
      },
      {
        rank: 4,
        fact: "Both companies carried on the same business.",
        weight: "supporting",
      },
      {
        rank: 5,
        fact: "Both companies shared staff and office space.",
        weight: "supporting",
      },
    ],
    modelAnswer:
      "Alpha is the contractual debtor and would normally bear the debt with its own property. Article 23(2) may nevertheless apply because Lin controlled both Alpha and Beta and used the two companies to shift Alpha's receivables and funds. The inability to distinguish the companies' assets, together with the transfer of value after the payment demand, supports an inference of abuse aimed at evading Alpha's debt and seriously prejudicing Supplier S. Beta may therefore be jointly and severally liable for Alpha's debt. Shared staff and office space support the analysis but are not decisive on their own.",
    variant: {
      title: { en: "Sole-shareholder variant", zh: "一人公司变体" },
      facts:
        "Assume Alpha has only one shareholder, Lin. Supplier S produces bank records showing repeated personal withdrawals by Lin. Lin provides no separate accounts or other records proving that Alpha's property was maintained independently.",
      question: {
        en: "Who bears the burden of proving property independence?",
        zh: "谁承担证明财产独立的举证责任？",
      },
      answer: {
        en: "Lin. Under Article 23(3), the sole shareholder must prove that company property is independent from the shareholder's own property. If Lin cannot do so, Lin bears joint and several liability for Alpha's debts.",
        zh: "林某。根据第23条第3款，唯一股东必须证明公司财产独立于其自身财产；不能证明的，应对公司债务承担连带责任。",
      },
    },
  },
  quiz: [
    {
      id: "general-test",
      type: "single",
      objective: "Identify conduct that calls for an Article 23(1) analysis.",
      prompt: {
        en: "Which fact pattern most clearly calls for an Article 23(1) analysis?",
        zh: "下列哪一事实组合最需要进行第23条第1款分析？",
      },
      choices: [
        {
          id: "a",
          text: "A shareholder and the company use the same office, but maintain separate accounts and assets.",
          correct: false,
        },
        {
          id: "b",
          text: "After a creditor demands payment, a shareholder directs company revenue into the shareholder's personal account, leaving the company without assets to pay the debt.",
          correct: true,
        },
        {
          id: "c",
          text: "A company becomes unable to pay because its major customer becomes insolvent.",
          correct: false,
        },
        {
          id: "d",
          text: "A shareholder fails to make a capital contribution on time.",
          correct: false,
        },
      ],
      explanation: {
        en: "B links shareholder abuse to debt evasion and creditor harm. A may be relevant context but is insufficient by itself. C describes business failure. D is primarily an unpaid-capital-contribution issue governed by other provisions.",
        zh: "B把股东滥用、逃避债务和债权人损害联系起来。A可能是辅助事实但不能单独定案；C属于经营失败；D主要属于未履行出资义务问题。",
      },
      errorTag: "control-or-insolvency-is-enough",
      reviewUnitId: "unit-4-rule-builder",
    },
    {
      id: "evidence-weight",
      type: "multiple",
      objective: "Distinguish strong and supporting indicators of commingling.",
      prompt: {
        en: "Which facts may be relevant when assessing whether affiliated companies have lost meaningful property separation? Select all that apply.",
        zh: "判断关联公司是否丧失实质财产独立性时，下列哪些事实具有相关性？可多选。",
      },
      choices: [
        { id: "a", text: "They share several senior employees.", correct: true },
        {
          id: "b",
          text: "They use the same bank account and cannot explain which company owns the funds.",
          correct: true,
        },
        {
          id: "c",
          text: "They issue receipts interchangeably and record one company's revenue in another company's books.",
          correct: true,
        },
        {
          id: "d",
          text: "They keep independently audited accounts and can trace every intercompany transaction to a written agreement.",
          correct: false,
        },
      ],
      explanation: {
        en: "A is an auxiliary indicator; B and C are substantially stronger because they concern financial and property separation. D tends to support continued separation rather than commingling.",
        zh: "A属于辅助因素；B、C直接涉及财务和财产能否区分，证明力更强；D反而支持公司继续保持独立。",
      },
      errorTag: "evidence-weight-confused",
      reviewUnitId: "unit-6-case",
    },
    {
      id: "horizontal-effect",
      type: "single",
      objective: "Identify the effect of Article 23(2).",
      prompt: {
        en: "Zhao controls Company X and Company Y and uses both companies to shift X's revenue to Y, evade X's debt and seriously prejudice X's creditor. Which statement is most accurate under Article 23(2)?",
        zh: "赵某控制X、Y两公司，并利用两公司转移X公司收入、逃避X公司债务，严重损害X公司债权人利益。根据第23条第2款，何者最准确？",
      },
      choices: [
        { id: "a", text: "Y may bear joint and several liability for X's debt.", correct: true },
        { id: "b", text: "Only Zhao can ever bear liability.", correct: false },
        { id: "c", text: "X and Y become one company for every legal purpose.", correct: false },
        {
          id: "d",
          text: "Common control alone is sufficient, so no abusive conduct needs to be shown.",
          correct: false,
        },
      ],
      explanation: {
        en: "Paragraph 2 extends joint and several liability across companies used under common control to engage in paragraph 1 conduct. It does not permanently merge the companies or dispense with the abusive-conduct requirement.",
        zh: "第2款使被共同控制并用于实施第1款行为的公司之间承担连带责任，但不会永久合并其人格，也不会免除对滥用行为的证明。",
      },
      errorTag: "wrong-horizontal-effect",
      reviewUnitId: "unit-4-rule-builder",
    },
    {
      id: "sole-shareholder-burden",
      type: "single",
      objective: "Identify the burden holder under Article 23(3).",
      prompt: {
        en: "One Person Ltd. has only one shareholder. In a dispute over the company's debt, who must prove that company property is independent from the shareholder's own property?",
        zh: "某公司只有一个股东。在公司债务纠纷中，谁应证明公司财产独立于股东自己的财产？",
      },
      choices: [
        { id: "a", text: "The company creditor", correct: false },
        { id: "b", text: "The sole shareholder", correct: true },
        { id: "c", text: "The company's employees", correct: false },
        { id: "d", text: "The registration authority", correct: false },
      ],
      explanation: {
        en: "Article 23(3) places this burden on the sole shareholder. Failure to prove property independence results in joint and several liability for company debts.",
        zh: "第23条第3款将该举证责任配置给唯一股东；不能证明财产独立的，股东对公司债务承担连带责任。",
      },
      errorTag: "burden-of-proof-reversed",
      reviewUnitId: "unit-4-rule-builder",
    },
  ],
  finalRecall: {
    prompts: [
      "General route: Shareholder + ______ + debt evasion + serious creditor harm → ______ liability.",
      "Horizontal route: One shareholder uses ______ companies under its control → each company may answer for the debts of ______.",
      "Sole-shareholder route: The ______ shareholder must prove ______ independence.",
    ],
    answers: [
      "abuse; joint and several",
      "two or more; any one of them",
      "sole; property",
    ],
  },
  units: [
    {
      id: "unit-1-issue",
      order: 1,
      type: "issue",
      title: { en: "Issue", zh: "问题导入" },
      eyebrow: "START WITH THE DEBTOR",
      purpose: {
        en: "Identify the default debtor before considering an exception.",
        zh: "先确定默认债务人，再判断是否存在例外。",
      },
      completionRule: "submit-opening-choice",
    },
    {
      id: "unit-2-map",
      order: 2,
      type: "map",
      title: { en: "Concept Map", zh: "概念地图" },
      eyebrow: "DEFAULT → EXCEPTION",
      purpose: {
        en: "Connect Articles 3 and 4 to the three routes under Article 23.",
        zh: "把第3、4条的默认规则与第23条三条路径连接起来。",
      },
      completionRule: "open-all-three-route-nodes",
    },
    {
      id: "unit-3-vocabulary",
      order: 3,
      type: "vocabulary",
      title: { en: "Core Vocabulary", zh: "核心术语" },
      eyebrow: "LANGUAGE BEFORE RULES",
      purpose: {
        en: "Master the expressions needed to read and apply Article 23.",
        zh: "掌握阅读和适用第23条所需的核心表达。",
      },
      completionRule: "review-all-must-know-terms",
    },
    {
      id: "unit-4-rule-builder",
      order: 4,
      type: "rule-builder",
      title: { en: "Rule Builder", zh: "规则构建" },
      eyebrow: "BUILD ALL THREE ROUTES",
      purpose: {
        en: "Separate actors, conduct, proof and legal consequences.",
        zh: "区分主体、行为、举证与责任后果。",
      },
      completionRule: "complete-all-three-rule-routes",
    },
    {
      id: "unit-5-statute",
      order: 5,
      type: "statute",
      title: { en: "Statutory Language", zh: "法条精读" },
      eyebrow: "READ ARTICLE 23",
      purpose: {
        en: "Read the three paragraphs and retain their core collocations.",
        zh: "精读三款规则并记住核心搭配。",
      },
      completionRule: "open-three-paragraphs-and-three-expression-groups",
    },
    {
      id: "unit-6-case",
      order: 6,
      type: "case",
      title: { en: "Apply the Rule", zh: "案例适用" },
      eyebrow: "FACTS → EVIDENCE → CONCLUSION",
      purpose: {
        en: "Apply Article 23 to an original affiliated-company scenario.",
        zh: "把第23条适用于原创关联公司案例。",
      },
      completionRule: "submit-evidence-ranking-and-case-answer",
    },
    {
      id: "unit-7-review",
      order: 7,
      type: "review",
      title: { en: "Check & Review", zh: "检测与复习" },
      eyebrow: "RETRIEVE, DON'T REREAD",
      purpose: {
        en: "Test the three routes and send weak points back to the relevant unit.",
        zh: "检测三条路径，并把薄弱点回送至对应单元。",
      },
      completionRule: "answer-four-questions",
    },
  ],
  completion: {
    passingScore: 3,
    totalQuestions: 4,
    message: {
      en: "You can now separate the default rule from the exception, build all three Article 23 routes, and explain the result in legal English.",
      zh: "你现在能够区分默认规则与例外，搭建第23条三条路径，并用法律英语说明责任后果。",
    },
    nextActions: [
      {
        id: "review-statute",
        label: { en: "Review Article 23", zh: "复习第23条" },
        target: "statute:23",
      },
      {
        id: "retry-weak-points",
        label: { en: "Retry weak points", zh: "重做薄弱点" },
        target: "topic:disregarding-corporate-personality:weak-points",
      },
      {
        id: "chapter-one",
        label: { en: "Go to Chapter 1", zh: "前往第一章" },
        target: "chapter:1",
      },
    ],
  },
  authorityNotes: [
    {
      id: "company-law-2023",
      label: "PRC Company Law (2023 Revision)",
      url: "https://www.npc.gov.cn/npc/c2/c30834/202312/t20231229_433967.html",
      note: {
        en: "The Chinese statutory text is authoritative. The revised law took effect on 1 July 2024.",
        zh: "中文法条为权威文本；修订后的公司法自2024年7月1日起施行。",
      },
    },
    {
      id: "guiding-case-15",
      label: "SPC Guiding Case No. 15",
      url: "https://www.court.gov.cn/shenpan/xiangqing/13321.html",
      note: {
        en: "Used to illustrate the evidentiary analysis of affiliated-company commingling. Its cited article numbers predate the 2023 revision; this course applies current Article 23.",
        zh: "用于说明关联公司人格混同的证据分析。案例所引条文编号早于2023年修法，本课程以现行第23条为核心。",
      },
    },
    {
      id: "nine-minutes",
      label: "National Courts' Civil and Commercial Trial Work Conference Minutes",
      url: "https://www.court.gov.cn/zixun/xiangqing/199691.html",
      note: {
        en: "Used as an explanatory framework for common patterns of abuse; it does not replace the statutory conditions.",
        zh: "用于解释常见滥用类型和识别因素，不替代第23条的法定条件。",
      },
    },
    {
      id: "new-company-law-interpretation-draft",
      label: "Draft SPC Company Law Judicial Interpretation (2025)",
      url: "https://www.court.gov.cn/hudong/xiangqing/477881.html",
      note: {
        en: "The draft is not used as governing law. As of 20 August 2026, no final effective text was located on the SPC's official website; this topic should be reviewed when a final interpretation is issued.",
        zh: "征求意见稿不作为现行法律依据。截至2026年8月20日，未在最高法官网检索到正式生效文本；正式解释发布后应更新本专题。",
      },
    },
  ],
} satisfies TopicCourse;

export default disregardingCorporatePersonalityCourse;
