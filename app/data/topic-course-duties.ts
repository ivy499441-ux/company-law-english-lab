import { createTopicCourse } from "./topic-course-builder";
import type { BilingualText, TopicTerm } from "./topic-course-personality";

const b = (en: string, zh: string): BilingualText => ({ en, zh });
const term = (id: string, english: string, chinese: string, definitionEn: string, definitionZh: string, collocation: string, example: string, refs: number[], tier: TopicTerm["tier"] = "must-know"): TopicTerm => ({ id, term: english, chinese, definitionEn, definitionZh, collocation, example, articleRefs: refs, tier });

const course = createTopicCourse({
  id: "directors-officers-duties",
  order: 14,
  title: b("Directors' and Officers' Duties", "董监高忠实与勤勉义务"),
  primaryArticles: [180, 182, 183, 184, 185, 186],
  supportingArticles: [22, 178, 179, 181, 188, 189, 190, 191, 192, 193, 265],
  durationMinutes: [35, 45],
  difficulty: "application",
  objectives: [
    b("Distinguish the duty of loyalty from the duty of diligence.", "区分忠实义务与勤勉义务。"),
    b("Apply the reporting, approval and recusal rules to conflict transactions.", "将报告、批准和回避规则适用于利益冲突交易。"),
    b("Identify the statutory exceptions for corporate opportunities and competing business.", "识别公司商业机会与同业竞争的法定规则。"),
  ],
  mapInstruction: b("Start with the general duties, then test the specific conflict route.", "先确定一般忠实、勤勉义务，再进入具体利益冲突路径。"),
  openingIssue: {
    heading: b("May a director contract through a related company without disclosure?", "董事能否通过关联企业与公司交易而不披露？"),
    facts: "Director Zhao arranges for her employer to buy equipment from a company controlled by her spouse. Zhao does not report the relationship, and the board never approves the transaction.",
    choices: [
      { id: "a", text: "Yes, because Zhao is not personally named as the seller.", correct: false },
      { id: "b", text: "No. Article 182 extends reporting and approval duties to specified related persons and controlled entities.", correct: true },
      { id: "c", text: "Yes, if the price later appears reasonable.", correct: false },
      { id: "d", text: "Only shareholders, not directors, have conflict duties.", correct: false },
    ],
    explanation: b("Article 182 covers direct and indirect transactions and extends to specified relatives, controlled enterprises and other related persons. Reporting and approval are required under the articles; Article 185 separately governs interested-director recusal.", "第182条同时规制直接、间接交易，并扩展至特定近亲属、受控企业和其他关联人；相关事项应报告并依章程经董事会或股东会决议，第185条另行规定关联董事回避。"),
  },
  conceptMap: {
    defaultRules: [
      { id: "loyalty", article: 180, title: b("Duty of loyalty", "忠实义务"), rule: b("Avoid conflicts between personal interests and company interests; do not use office for improper benefit.", "避免自身利益与公司利益冲突，不得利用职权牟取不正当利益。") },
      { id: "diligence", article: 180, title: b("Duty of diligence", "勤勉义务"), rule: b("Act for the company's best interests with the reasonable care normally expected of a manager.", "为公司最大利益尽到管理者通常应有的合理注意。") },
    ],
    exception: { id: "conflict", article: 182, title: b("Conflict review", "利益冲突审查"), rule: b("A conflicted matter must pass the applicable disclosure, approval and recusal requirements.", "利益冲突事项必须经过相应的报告、批准和回避审查。") },
    routes: [
      { id: "transaction", title: b("Related transaction", "关联交易"), summary: b("Report the material facts and obtain approval under the articles; an interested director does not vote.", "报告交易事项并依章程取得批准；关联董事不得表决。") },
      { id: "opportunity", title: b("Corporate opportunity", "公司商业机会"), summary: b("Do not divert an opportunity unless it is approved after reporting or the company cannot use it under law or the articles.", "不得侵夺公司机会，除非报告后获批，或公司依法、依章程不能利用该机会。") },
      { id: "competition", title: b("Competing business", "同业竞争"), summary: b("Do not operate a competing business without reporting and approval.", "未经报告并取得批准，不得自营或为他人经营同类业务。") },
    ],
  },
  terms: [
    term("loyalty", "duty of loyalty", "忠实义务", "The obligation to avoid conflicting interests and improper personal benefit.", "避免利益冲突和利用职权牟取不当利益的义务。", "owe a duty of loyalty to the company", "A director owes the duty of loyalty to the company.", [180, 181]),
    term("diligence", "duty of diligence", "勤勉义务", "The obligation to act in the company's best interests with reasonable managerial care.", "为公司最大利益尽到管理者通常应有合理注意的义务。", "exercise reasonable managerial care", "The manager must exercise reasonable care when approving the investment.", [180]),
    term("conflict", "conflict of interest", "利益冲突", "A situation in which personal interests may diverge from company interests.", "个人利益可能与公司利益不一致的情形。", "avoid a conflict of interest", "The director disclosed the conflict of interest before deliberation.", [180, 182, 185]),
    term("related-transaction", "related-party transaction", "关联交易", "A company transaction involving a director, officer or a statutorily related person.", "董事、高管或法定关联人参与的公司交易。", "report a related-party transaction", "The officer must report the related-party transaction.", [182, 185]),
    term("corporate-opportunity", "corporate opportunity", "公司商业机会", "A business opportunity belonging to the company that may not be diverted improperly.", "属于公司的、不得被管理者不当侵夺的商业机会。", "divert a corporate opportunity", "The director diverted the corporate opportunity to a controlled entity.", [183]),
    term("competition", "competing business", "同业竞争业务", "Business of the same type as that of the company served by the officer.", "与任职公司同类的经营业务。", "operate a competing business", "The manager operated a competing business without approval.", [184]),
    term("recusal", "recusal from voting", "表决回避", "Exclusion of an interested director and that director's vote from the board decision.", "关联董事不参与表决且其表决权不计入总数。", "recuse an interested director", "The interested director was recused from voting.", [185], "evidence"),
    term("disgorgement", "disgorgement of income", "收入归入公司", "Transfer to the company of income obtained through specified duty violations.", "将违反特定义务所得收入归公司所有。", "disgorge the income to the company", "The director must disgorge the profit obtained from the diversion.", [186], "recognition"),
  ],
  ruleRoutes: [
    { id: "transaction", articleParagraph: 1, articleLabel: "Arts. 182 & 185", title: b("Related transaction", "关联交易"), blocks: [
      { id: "scope", label: b("SCOPE", "主体范围"), content: b("Identify a direct or indirect transaction involving the officer or a covered related person or entity.", "识别董监高本人或法定关联人、关联企业直接或间接参与的交易。") },
      { id: "report", label: b("REPORT", "报告"), content: b("Report the matters relevant to the contract or transaction to the board or shareholders' meeting.", "向董事会或股东会报告与合同、交易有关的事项。") },
      { id: "approve", label: b("APPROVAL", "批准"), content: b("Obtain approval from the body designated in the articles of association.", "按照公司章程由董事会或股东会决议通过。") },
      { id: "recuse", label: b("RECUSAL", "回避"), content: b("An interested director does not vote; if fewer than three disinterested directors attend, submit the matter to shareholders.", "关联董事不参与表决；无关联董事不足三人时，提交股东会审议。") },
    ], formula: b("Covered transaction → report → approval under the articles → interested-director recusal", "关联交易 → 报告 → 依章程批准 → 关联董事回避") },
    { id: "opportunity", articleParagraph: 2, articleLabel: "Art. 183", title: b("Corporate opportunity", "公司商业机会"), blocks: [
      { id: "belongs", label: b("OPPORTUNITY", "商业机会"), content: b("The opportunity belongs to the company and is obtained through the officer's position.", "该机会属于公司，且管理者利用职务便利取得。") },
      { id: "no-diversion", label: b("DEFAULT", "原则"), content: b("The officer may not take it for self or another person.", "不得为自己或他人谋取该商业机会。") },
      { id: "exception", label: b("EXCEPTION", "例外"), content: b("The matter is reported and approved, or the company cannot use it under law, regulation or the articles.", "报告后依章程获批，或公司依法、依章程不能利用该机会。") },
    ], formula: b("Company opportunity + use of office − statutory exception → prohibited diversion", "公司商业机会 + 利用职务便利 − 法定例外 → 禁止侵夺") },
    { id: "competition", articleParagraph: 3, articleLabel: "Arts. 184–186", title: b("Competing business and consequence", "同业竞争及后果"), blocks: [
      { id: "same-type", label: b("BUSINESS", "业务"), content: b("The officer operates for self or another person a business of the same type as the company.", "管理者自营或为他人经营与任职公司同类的业务。") },
      { id: "approval", label: b("REPORT & APPROVAL", "报告与批准"), content: b("Without reporting and approval, the competing business is prohibited.", "未经报告并依章程获批，不得经营同类业务。") },
      { id: "income", label: b("CONSEQUENCE", "后果"), content: b("Income obtained through a violation of Articles 181–184 belongs to the company; company loss may also trigger compensation.", "违反第181至184条所得收入归公司；造成公司损失的还可能承担赔偿责任。") },
    ], formula: b("Competing business without report and approval → income belongs to company + possible compensation", "未经报告批准经营同类业务 → 所得归公司 + 可能赔偿") },
  ],
  statute: [
    { paragraph: 1, article: 180, citation: "Article 180", routeId: "transaction", heading: b("Loyalty and diligence", "忠实与勤勉"), chineseAuthoritative: "董事、监事、高级管理人员对公司负有忠实义务，应当采取措施避免自身利益与公司利益冲突，不得利用职权牟取不正当利益。董事、监事、高级管理人员对公司负有勤勉义务，执行职务应当为公司的最大利益尽到管理者通常应有的合理注意。公司的控股股东、实际控制人不担任公司董事但实际执行公司事务的，适用前两款规定。", courseTranslation: "Directors, supervisors and senior executives owe duties of loyalty and diligence to the company. They must avoid conflicts and improper benefits, and must act for the company's best interests with the reasonable care normally expected of a manager. The rule also reaches a controlling shareholder or actual controller that in fact conducts company affairs without serving as a director.", focusExpressions: [{ en: "duty of loyalty", zh: "忠实义务", tone: "concept" }, { en: "duty of diligence", zh: "勤勉义务", tone: "concept" }, { en: "reasonable care normally expected of a manager", zh: "管理者通常应有的合理注意", tone: "threshold" }] },
    { paragraph: 2, article: 182, citation: "Article 182", routeId: "transaction", heading: b("Reporting and approval", "关联交易报告与批准"), chineseAuthoritative: "董事、监事、高级管理人员，直接或者间接与本公司订立合同或者进行交易，应当就与订立合同或者进行交易有关的事项向董事会或者股东会报告，并按照公司章程的规定经董事会或者股东会决议通过。董事、监事、高级管理人员的近亲属，董事、监事、高级管理人员或者其近亲属直接或者间接控制的企业，以及与董事、监事、高级管理人员有其他关联关系的关联人，与公司订立合同或者进行交易，适用前款规定。", courseTranslation: "A director, supervisor or senior executive engaging directly or indirectly in a contract or transaction with the company must report the relevant matters and obtain the approval required by the articles. The rule extends to specified relatives, controlled enterprises and other related persons.", focusExpressions: [{ en: "directly or indirectly", zh: "直接或者间接", tone: "evidence" }, { en: "report the relevant matters", zh: "报告有关事项", tone: "conduct" }, { en: "obtain approval under the articles", zh: "依章程经决议通过", tone: "consequence" }] },
    { paragraph: 3, article: 183, citation: "Article 183", routeId: "opportunity", heading: b("Corporate opportunities", "公司商业机会"), chineseAuthoritative: "董事、监事、高级管理人员，不得利用职务便利为自己或者他人谋取属于公司的商业机会。但是，有下列情形之一的除外：（一）向董事会或者股东会报告，并按照公司章程的规定经董事会或者股东会决议通过；（二）根据法律、行政法规或者公司章程的规定，公司不能利用该商业机会。", courseTranslation: "An officer may not use the position to obtain for self or another person a business opportunity belonging to the company, unless the opportunity is reported and approved or the company cannot use it under law, administrative regulation or the articles.", focusExpressions: [{ en: "business opportunity belonging to the company", zh: "属于公司的商业机会", tone: "concept" }, { en: "use the position", zh: "利用职务便利", tone: "conduct" }, { en: "the company cannot use the opportunity", zh: "公司不能利用该商业机会", tone: "threshold" }] },
    { paragraph: 4, article: 184, citation: "Articles 184–186", routeId: "competition", heading: b("Competition, recusal and income", "同业竞争、回避与收入归入"), chineseAuthoritative: "董事、监事、高级管理人员未向董事会或者股东会报告，并按照公司章程的规定经董事会或者股东会决议通过，不得自营或者为他人经营与其任职公司同类的业务。董事会对本法第一百八十二条至第一百八十四条规定的事项决议时，关联董事不得参与表决，其表决权不计入表决权总数。出席董事会会议的无关联关系董事人数不足三人的，应当将该事项提交股东会审议。董事、监事、高级管理人员违反本法第一百八十一条至第一百八十四条规定所得的收入应当归公司所有。", courseTranslation: "Without reporting and approval, an officer may not operate for self or another person a business of the same type as the company. An interested director is excluded from the relevant board vote. If fewer than three disinterested directors attend, the matter goes to the shareholders' meeting. Income obtained through a violation of Articles 181–184 belongs to the company.", focusExpressions: [{ en: "competing business", zh: "同类业务", tone: "conduct" }, { en: "be excluded from voting", zh: "不得参与表决", tone: "consequence" }, { en: "fewer than three disinterested directors", zh: "无关联关系董事不足三人", tone: "threshold" }, { en: "income belongs to the company", zh: "所得收入归公司所有", tone: "consequence" }] },
  ],
  caseStudy: {
    title: b("The diverted software opportunity", "被转移的软件项目"), label: "CASE FILE · NOVA TECH",
    facts: "A client invited Nova Tech to bid for a software project. Director Qian sent the opportunity to an entity controlled by his sister without reporting it. That entity won the project and paid Qian a consulting fee. Nova Tech was capable of performing the work.",
    evidencePrompt: "Which facts establish the duty route and consequence?",
    evidenceRanking: [{ rank: 1, fact: "The opportunity was offered to Nova Tech and Nova Tech could perform it.", weight: "strong" }, { rank: 2, fact: "Qian diverted it to a related controlled entity without report or approval.", weight: "strong" }, { rank: 3, fact: "Qian received a consulting fee from the successful entity.", weight: "strong" }],
    writingPrompt: "Write a 60–100 word conclusion", writingHint: "Apply Articles 180, 183 and 186; identify both prohibition and income consequence.", answerPlaceholder: "Qian likely breached the duty of loyalty because...", minimumWords: 30,
    modelAnswer: "Qian likely breached the duty of loyalty under Article 180 and the corporate-opportunity rule in Article 183. The opportunity belonged to Nova Tech, the company was capable of using it, and Qian diverted it without reporting or approval. Neither statutory exception applies. Under Article 186, income obtained through the violation belongs to Nova Tech; Article 188 may also support compensation if the company proves loss.",
  },
  quiz: [
    { id: "duties-q1", type: "single", objective: "loyalty-diligence", prompt: b("Which statement best describes the duty of diligence under Article 180?", "下列哪项最准确描述第180条勤勉义务？"), choices: [{ id: "a", text: "Act for the company's best interests with the reasonable care normally expected of a manager.", correct: true }, { id: "b", text: "Avoid every business risk regardless of cost.", correct: false }, { id: "c", text: "Guarantee that every decision is profitable.", correct: false }, { id: "d", text: "Follow only shareholder instructions.", correct: false }], explanation: b("Article 180 uses the company's best interests and reasonable managerial care, not guaranteed results.", "第180条采用公司最大利益和管理者通常应有合理注意标准，不要求保证经营结果。"), errorTag: "result-guarantee" },
    { id: "duties-q2", type: "multiple", objective: "related-transaction", prompt: b("Which steps are generally required for a covered related-party transaction?", "受第182条规制的关联交易通常需要哪些步骤？"), choices: [{ id: "a", text: "Report the relevant matters to the board or shareholders' meeting.", correct: true }, { id: "b", text: "Obtain the approval required by the articles of association.", correct: true }, { id: "c", text: "Exclude the interested director from the relevant board vote.", correct: true }, { id: "d", text: "Treat the price as conclusive even without disclosure.", correct: false }], explanation: b("Articles 182 and 185 combine reporting, approval and interested-director recusal.", "第182条与第185条共同形成报告、批准和关联董事回避规则。"), errorTag: "missing-procedure" },
    { id: "duties-q3", type: "single", objective: "opportunity-exception", prompt: b("When may an officer use a corporate opportunity under Article 183?", "依第183条，何时可以利用公司商业机会？"), choices: [{ id: "a", text: "After reporting and approval, or when the company cannot use it under law or the articles.", correct: true }, { id: "b", text: "Whenever the officer first hears about it.", correct: false }, { id: "c", text: "Whenever a relative operates the new business.", correct: false }, { id: "d", text: "Whenever the officer believes the company is unlikely to profit.", correct: false }], explanation: b("Article 183 contains two defined exceptions; personal belief is not one of them.", "第183条规定两项明确例外，管理者个人判断并不当然构成例外。"), errorTag: "invented-exception" },
    { id: "duties-q4", type: "single", objective: "income", prompt: b("What happens to income obtained through a violation of Articles 181–184?", "违反第181至184条所得收入如何处理？"), choices: [{ id: "a", text: "It belongs to the company.", correct: true }, { id: "b", text: "It is divided among all shareholders automatically.", correct: false }, { id: "c", text: "It always belongs to the State.", correct: false }, { id: "d", text: "It remains with the officer if no criminal offence occurred.", correct: false }], explanation: b("Article 186 provides that the income belongs to the company.", "第186条规定相关所得收入归公司所有。"), errorTag: "wrong-beneficiary" },
  ],
  navigation: { article: 180, chapter: 8 },
});

export default course;
