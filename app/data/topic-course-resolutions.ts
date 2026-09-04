import { createTopicCourse } from "./topic-course-builder";
import type { BilingualText, TopicTerm } from "./topic-course-personality";

const b = (en: string, zh: string): BilingualText => ({ en, zh });
const term = (id: string, english: string, chinese: string, definitionEn: string, definitionZh: string, collocation: string, example: string, refs: number[], tier: TopicTerm["tier"] = "must-know"): TopicTerm => ({ id, term: english, chinese, definitionEn, definitionZh, collocation, example, articleRefs: refs, tier });

const course = createTopicCourse({
  id: "corporate-resolutions",
  order: 12,
  title: b("Shareholders' Meetings and Corporate Resolutions", "股东会与公司决议"),
  primaryArticles: [25, 26, 27, 28],
  supportingArticles: [24, 58, 62, 63, 64, 65, 66, 111, 113, 114, 115, 116, 124, 125, 146],
  durationMinutes: [30, 40],
  difficulty: "application",
  objectives: [
    b("Distinguish invalid, revocable and non-existent resolutions.", "区分决议无效、可撤销与不成立。"),
    b("Apply the 60-day period, the one-year long-stop and the minor-defect exception.", "适用60日期限、一年最长期间和轻微瑕疵例外。"),
    b("Explain the protection of a good-faith counterparty under Article 28.", "说明第28条对善意相对人的保护。"),
  ],
  mapInstruction: b("Classify the defect before considering the remedy.", "先判断瑕疵属于内容、程序还是决议形成，再选择救济。"),
  openingIssue: {
    heading: b("Does every procedural defect justify revocation?", "任何程序瑕疵都能撤销决议吗？"),
    facts: "An LLC sent the meeting notice one day late. Every shareholder nevertheless attended, debated the proposal and voted. The voting result would have been the same with timely notice.",
    choices: [
      { id: "a", text: "The resolution is automatically invalid because notice was late.", correct: false },
      { id: "b", text: "Revocation may be excluded if the defect was minor and had no material effect.", correct: true },
      { id: "c", text: "The resolution is non-existent because the notice period was imperfect.", correct: false },
      { id: "d", text: "Only the board may challenge the resolution.", correct: false },
    ],
    explanation: b("Article 26 excludes a merely minor convening or voting defect that had no material effect on the resolution. Classification matters: invalidity concerns unlawful content, while non-existence concerns failure to form a resolution at all.", "第26条排除仅属轻微且未对决议产生实质影响的召集或表决瑕疵。内容违法、程序瑕疵和决议未形成对应不同效力类型。"),
  },
  conceptMap: {
    defaultRules: [
      { id: "meeting", article: 24, title: b("Meeting and vote", "会议与表决"), rule: b("Shareholders' and board meetings and voting may generally use electronic communication.", "股东会、董事会会议和表决原则上可以采用电子通信方式。") },
      { id: "threshold", article: 66, title: b("Voting threshold", "表决门槛"), rule: b("First verify the applicable attendance and approval thresholds under law and the articles.", "先核对法律和章程规定的出席及通过门槛。") },
    ],
    exception: { id: "defect", article: 25, title: b("Defective resolution", "决议瑕疵"), rule: b("The legal effect depends on whether the defect concerns content, procedure or formation.", "法律效果取决于瑕疵涉及内容、程序还是决议形成。") },
    routes: [
      { id: "invalid", title: b("Invalid", "无效"), summary: b("The content violates a law or administrative regulation.", "决议内容违反法律、行政法规。") },
      { id: "revocable", title: b("Revocable", "可撤销"), summary: b("Convening or voting violates law or the articles, or the content violates the articles, subject to limits.", "召集程序或表决方式违法、违章程，或内容违反章程，并受期限及轻微瑕疵规则限制。") },
      { id: "nonexistent", title: b("Non-existent", "不成立"), summary: b("No legally sufficient meeting, vote, quorum or approval occurred.", "未召开会议、未表决或人数、表决权未达到法定或章程门槛。") },
    ],
  },
  terms: [
    term("resolution", "corporate resolution", "公司决议", "A decision adopted through a shareholders' meeting or board process.", "经股东会或董事会程序形成的公司决定。", "adopt a corporate resolution", "The shareholders adopted a resolution to reduce capital.", [25, 26, 27]),
    term("invalid", "invalid resolution", "决议无效", "A resolution whose content violates a law or administrative regulation.", "内容违反法律或行政法规的决议。", "declare a resolution invalid", "The court declared the resolution invalid.", [25, 28]),
    term("revocable", "revocable resolution", "可撤销决议", "A resolution subject to judicial revocation because of a qualifying procedural or articles-of-association defect.", "因法定程序或章程瑕疵可请求法院撤销的决议。", "bring an action for revocation", "A shareholder brought an action for revocation within 60 days.", [26]),
    term("nonexistent", "non-existent resolution", "决议不成立", "A purported resolution that was never formed through the minimum required process or vote.", "未通过最低限度会议或表决程序形成的所谓决议。", "confirm that a resolution is non-existent", "No vote was taken, so the resolution was non-existent.", [27, 28]),
    term("convening", "convening procedure", "会议召集程序", "The rules governing who calls a meeting, notice and related steps.", "关于召集主体、通知等会议启动事项的程序。", "a defect in the convening procedure", "The notice defect concerned the convening procedure.", [26, 62, 63, 64, 114, 115]),
    term("voting", "voting method", "表决方式", "The legally or contractually required manner of voting.", "法律或章程要求的表决方式。", "violate the prescribed voting method", "The voting method violated the articles.", [26]),
    term("minor-defect", "minor defect", "轻微瑕疵", "A limited procedural defect that had no material effect on the resolution.", "未对决议产生实质影响的轻微程序瑕疵。", "a minor defect with no material effect", "The court should assess whether the defect materially affected the result.", [26], "evidence"),
    term("good-faith", "good-faith counterparty", "善意相对人", "A counterparty protected from the internal invalidation of the resolution under Article 28.", "依第28条不因内部决议效力瑕疵而受影响的善意交易相对人。", "protect a good-faith counterparty", "The transaction with a good-faith counterparty remains unaffected.", [28], "recognition"),
  ],
  ruleRoutes: [
    { id: "invalid", articleParagraph: 1, articleLabel: "Art. 25", title: b("Invalid resolution", "决议无效"), blocks: [
      { id: "content", label: b("OBJECT", "审查对象"), content: b("Examine the content of the shareholders' or board resolution.", "审查股东会或董事会决议的内容。") },
      { id: "violation", label: b("VIOLATION", "违反规范"), content: b("The content violates a law or administrative regulation.", "决议内容违反法律或行政法规。") },
      { id: "effect", label: b("EFFECT", "法律效果"), content: b("The resolution is invalid; Article 25 does not impose the Article 26 revocation period.", "决议无效；第25条不适用第26条撤销期间。") },
    ], formula: b("Unlawful content → invalid resolution", "内容违法 → 决议无效") },
    { id: "revocable", articleParagraph: 2, articleLabel: "Art. 26", title: b("Revocable resolution", "可撤销决议"), blocks: [
      { id: "defect", label: b("DEFECT", "瑕疵"), content: b("Convening or voting violates law or the articles, or the content violates the articles.", "召集程序或表决方式违法、违章程，或内容违反章程。") },
      { id: "exception", label: b("EXCEPTION", "例外"), content: b("A minor procedural defect with no material effect does not justify revocation.", "仅属轻微且未产生实质影响的程序瑕疵，不予撤销。") },
      { id: "period", label: b("TIME", "期限"), content: b("Normally 60 days from adoption; an unnotified shareholder has 60 days from knowledge, subject to a one-year long-stop.", "通常自决议作出起60日；未获通知股东自知道或应当知道起60日，但最长不超过决议作出后一年。") },
    ], formula: b("Qualifying defect + timely shareholder action − minor-defect exception → revocation", "法定瑕疵 + 股东及时起诉 − 轻微瑕疵例外 → 撤销") },
    { id: "nonexistent", articleParagraph: 3, articleLabel: "Arts. 27–28", title: b("Non-existent resolution", "决议不成立"), blocks: [
      { id: "formation", label: b("FORMATION", "形成过程"), content: b("No meeting or no vote occurred, or required attendance or approval was not reached.", "未召开会议、未表决，或出席、赞成票未达到要求。") },
      { id: "confirmation", label: b("JUDICIAL EFFECT", "司法确认"), content: b("The purported resolution may be confirmed as non-existent.", "该所谓决议可被确认不成立。") },
      { id: "third-party", label: b("THIRD PARTY", "外部关系"), content: b("Civil relations formed with a good-faith counterparty remain unaffected under Article 28.", "依第28条，与善意相对人形成的民事法律关系不受影响。") },
    ], formula: b("Failure to form a resolution → non-existence; protect good-faith external relations", "决议未形成 → 不成立；保护善意外部交易关系") },
  ],
  statute: [
    { paragraph: 1, article: 25, citation: "Article 25", routeId: "invalid", heading: b("Invalidity", "无效"), chineseAuthoritative: "公司股东会、董事会的决议内容违反法律、行政法规的无效。", courseTranslation: "A shareholders' meeting or board resolution is invalid if its content violates a law or administrative regulation.", focusExpressions: [{ en: "the content violates", zh: "决议内容违反", tone: "conduct" }, { en: "is invalid", zh: "无效", tone: "consequence" }] },
    { paragraph: 2, article: 26, citation: "Article 26", routeId: "revocable", heading: b("Revocation and time limits", "撤销及期限"), chineseAuthoritative: "公司股东会、董事会的会议召集程序、表决方式违反法律、行政法规或者公司章程，或者决议内容违反公司章程的，股东自决议作出之日起六十日内，可以请求人民法院撤销。但是，股东会、董事会的会议召集程序或者表决方式仅有轻微瑕疵，对决议未产生实质影响的除外。未被通知参加股东会会议的股东自知道或者应当知道股东会决议作出之日起六十日内，可以请求人民法院撤销；自决议作出之日起一年内没有行使撤销权的，撤销权消灭。", courseTranslation: "A shareholder may seek judicial revocation for a qualifying convening, voting or articles-of-association defect within the statutory period. A merely minor procedural defect with no material effect is excluded. An unnotified shareholder has 60 days from actual or constructive knowledge, subject to a one-year long-stop from adoption.", focusExpressions: [{ en: "seek judicial revocation", zh: "请求人民法院撤销", tone: "consequence" }, { en: "minor procedural defect", zh: "轻微瑕疵", tone: "threshold" }, { en: "one-year long-stop", zh: "最长一年期间", tone: "threshold" }] },
    { paragraph: 3, article: 27, citation: "Article 27", routeId: "nonexistent", heading: b("Non-existence", "不成立"), chineseAuthoritative: "有下列情形之一的，公司股东会、董事会的决议不成立：（一）未召开股东会、董事会会议作出决议；（二）股东会、董事会会议未对决议事项进行表决；（三）出席会议的人数或者所持表决权数未达到本法或者公司章程规定的人数或者所持表决权数；（四）同意决议事项的人数或者所持表决权数未达到本法或者公司章程规定的人数或者所持表决权数。", courseTranslation: "A resolution is non-existent if no meeting or vote occurred, or if the required attendance, voting rights or affirmative votes were not reached.", focusExpressions: [{ en: "no meeting was held", zh: "未召开会议", tone: "conduct" }, { en: "required quorum", zh: "法定人数或表决权门槛", tone: "threshold" }, { en: "non-existent", zh: "不成立", tone: "consequence" }] },
    { paragraph: 4, article: 28, citation: "Article 28", routeId: "nonexistent", heading: b("Registration and good faith", "登记与善意保护"), chineseAuthoritative: "公司股东会、董事会决议被人民法院宣告无效、撤销或者确认不成立的，公司应当向公司登记机关申请撤销根据该决议已办理的登记。股东会、董事会决议被人民法院宣告无效、撤销或者确认不成立的，公司根据该决议与善意相对人形成的民事法律关系不受影响。", courseTranslation: "After a resolution is invalidated, revoked or confirmed non-existent, the company must seek cancellation of the resulting registration. Civil relations formed with a good-faith counterparty remain unaffected.", focusExpressions: [{ en: "cancel the resulting registration", zh: "撤销根据该决议办理的登记", tone: "consequence" }, { en: "good-faith counterparty", zh: "善意相对人", tone: "actor" }, { en: "remain unaffected", zh: "不受影响", tone: "consequence" }] },
  ],
  caseStudy: {
    title: b("The unnotified minority shareholder", "未获通知的少数股东"), label: "CASE FILE · ORBIT LTD.",
    facts: "Orbit Ltd.'s controlling shareholder held a meeting without notifying Mei, who owns 20%. The attendees approved the sale of the company's main asset. Mei learned of the resolution four months later and sued 40 days after learning. Less than one year has passed since adoption.",
    evidencePrompt: "Which facts determine the remedy and time limit?",
    evidenceRanking: [{ rank: 1, fact: "Mei was not notified of the shareholders' meeting.", weight: "strong" }, { rank: 2, fact: "She sued within 60 days after learning of the resolution.", weight: "strong" }, { rank: 3, fact: "Less than one year has passed since the resolution was adopted.", weight: "strong" }],
    writingPrompt: "Write a 50–90 word conclusion", writingHint: "Classify the defect and apply both Article 26 time limits.", answerPlaceholder: "The lack of notice is a convening defect under Article 26...", minimumWords: 25,
    modelAnswer: "The failure to notify Mei is a convening-procedure defect under Article 26, so the resolution is potentially revocable rather than automatically invalid or non-existent. Because Mei was not notified, the 60-day period runs from when she knew or should have known of the resolution, subject to a one-year long-stop from adoption. Her action was filed within both periods and may proceed.",
  },
  quiz: [
    { id: "resolution-q1", type: "single", objective: "invalidity", prompt: b("A resolution's content violates an administrative regulation. What is the statutory classification?", "决议内容违反行政法规，应如何定性？"), choices: [{ id: "a", text: "Invalid.", correct: true }, { id: "b", text: "Revocable only within 60 days.", correct: false }, { id: "c", text: "Non-existent.", correct: false }, { id: "d", text: "Automatically effective after registration.", correct: false }], explanation: b("Article 25 classifies unlawful content as invalid.", "第25条将内容违反法律、行政法规的决议规定为无效。"), errorTag: "effect-category" },
    { id: "resolution-q2", type: "single", objective: "minor-defect", prompt: b("A voting procedure has a minor defect that had no material effect. What follows?", "表决程序仅有轻微瑕疵且未产生实质影响，结论是什么？"), choices: [{ id: "a", text: "The defect is excluded from Article 26 revocation.", correct: true }, { id: "b", text: "The resolution is always non-existent.", correct: false }, { id: "c", text: "The resolution is automatically invalid.", correct: false }, { id: "d", text: "Every shareholder loses voting rights.", correct: false }], explanation: b("Article 26 expressly excludes this minor-defect situation.", "第26条明确排除该轻微瑕疵情形。"), errorTag: "minor-defect" },
    { id: "resolution-q3", type: "multiple", objective: "nonexistence", prompt: b("Which circumstances may make a resolution non-existent under Article 27?", "哪些情形可能导致决议不成立？"), choices: [{ id: "a", text: "No meeting was held.", correct: true }, { id: "b", text: "No vote was taken.", correct: true }, { id: "c", text: "The affirmative votes did not reach the required threshold.", correct: true }, { id: "d", text: "The content merely violates the articles of association.", correct: false }], explanation: b("Article 27 concerns failure to form a resolution; content that violates the articles falls under Article 26.", "第27条处理决议未形成；内容违反章程属于第26条范围。"), errorTag: "formation-v-content" },
    { id: "resolution-q4", type: "single", objective: "good-faith", prompt: b("A court revokes a resolution after the company contracted with a good-faith counterparty on its basis. What does Article 28 provide?", "决议被撤销前，公司基于该决议与善意相对人订立合同。第28条如何规定？"), choices: [{ id: "a", text: "The civil relationship with the good-faith counterparty remains unaffected.", correct: true }, { id: "b", text: "The contract is automatically void.", correct: false }, { id: "c", text: "The counterparty must return all performance regardless of good faith.", correct: false }, { id: "d", text: "Only registration matters.", correct: false }], explanation: b("Article 28 separates internal resolution defects from protected good-faith external relations.", "第28条将内部决议瑕疵与受保护的善意外部交易关系区分开。"), errorTag: "third-party-effect" },
  ],
  navigation: { article: 26, chapter: 1 },
});

export default course;
