import { createTopicCourse } from "./topic-course-builder";
import type { BilingualText, TopicTerm } from "./topic-course-personality";

const b = (en: string, zh: string): BilingualText => ({ en, zh });
const term = (id: string, english: string, chinese: string, definitionEn: string, definitionZh: string, collocation: string, example: string, refs: number[], tier: TopicTerm["tier"] = "must-know"): TopicTerm => ({ id, term: english, chinese, definitionEn, definitionZh, collocation, example, articleRefs: refs, tier });

const course = createTopicCourse({
  id: "capital-contributions-default",
  order: 6,
  title: b("Capital Contributions and Shareholder Default", "股东出资与出资违约"),
  primaryArticles: [47, 51, 52, 54],
  supportingArticles: [48, 49, 50, 53, 88, 96, 98, 99, 107, 252, 253, 266],
  durationMinutes: [30, 40],
  difficulty: "application",
  objectives: [
    b("Place subscription, payment, capital call, forfeiture and acceleration on one timeline.", "把认缴、实缴、催缴、失权和加速到期放进同一时间线。"),
    b("Identify the responsible person and legal consequence at each stage.", "识别各阶段的责任主体和法律后果。"),
    b("Use accurate English for contribution default and creditor protection.", "准确使用出资违约与债权人保护相关英语。"),
  ],
  mapInstruction: b("Follow the contribution from subscription to enforcement.", "沿着认缴、履行、催缴和债权人救济依次查看。"),
  openingIssue: {
    heading: b("Can an unmatured contribution be called early?", "未届期出资能否提前缴纳？"),
    facts: "Harbor Ltd. cannot pay a supplier whose invoice is already due. Shareholder Lin subscribed RMB 3 million, but the articles allow payment two years later.",
    choices: [
      { id: "a", text: "The creditor must always wait until the date stated in the articles.", correct: false },
      { id: "b", text: "The company or the matured creditor may require Lin to pay early under Article 54.", correct: true },
      { id: "c", text: "Lin automatically loses all equity once the company misses a debt payment.", correct: false },
      { id: "d", text: "Only the registration authority may demand early payment.", correct: false },
    ],
    explanation: b("Article 54 protects a company or a creditor with a matured claim when the company cannot pay a matured debt. Forfeiture under Article 52 is a separate company procedure.", "公司不能清偿到期债务时，公司或者已到期债权的债权人可依第54条要求未届期股东提前缴纳出资；第52条失权程序是另一套公司内部程序。"),
  },
  conceptMap: {
    defaultRules: [
      { id: "subscription", article: 47, title: b("Subscription schedule", "认缴期限"), rule: b("LLC contributions must generally be fully paid within five years after formation.", "有限责任公司股东认缴出资原则上应自公司成立之日起五年内缴足。") },
      { id: "performance", article: 49, title: b("Proper performance", "适当履行"), rule: b("Money must enter the company account; title to non-monetary property must be transferred.", "货币应存入公司账户，非货币财产应依法转移财产权。") },
    ],
    exception: { id: "enforcement", article: 51, title: b("Enforcement after default", "违约后的执行"), rule: b("The board verifies contributions; the company calls for payment, and statutory consequences follow if default continues.", "董事会核查出资，公司催缴；违约持续时进入法定后果。") },
    routes: [
      { id: "payment", title: b("Payment and shortfall", "缴纳与出资不足"), summary: b("Determine what was promised, when it was due and whether value or title was fully delivered.", "核对认缴内容、到期时间以及价值或权利是否足额交付。") },
      { id: "call", title: b("Capital call and forfeiture", "催缴与失权"), summary: b("Written call, a grace period of at least 60 days, board resolution and written forfeiture notice.", "书面催缴、不少于60日宽限期、董事会决议和书面失权通知。") },
      { id: "creditor", title: b("Creditor protection", "债权人保护"), summary: b("When the company cannot pay a matured debt, an unmatured contribution may be accelerated.", "公司不能清偿到期债务时，未届期出资可能加速到期。") },
    ],
  },
  terms: [
    term("registered-capital", "registered capital", "注册资本", "The aggregate subscribed contribution registered for an LLC.", "在登记机关登记的有限责任公司全体股东认缴出资额。", "registered capital of the company", "The registered capital is based on the shareholders' subscribed contributions.", [47]),
    term("subscribed-contribution", "subscribed contribution", "认缴出资", "A contribution a shareholder has undertaken to make.", "股东承诺按照章程缴纳的出资。", "pay a subscribed contribution", "The shareholder has subscribed but has not yet paid the contribution.", [47, 49, 54]),
    term("capital-call", "written capital call", "书面催缴书", "A written demand issued by the company after the board identifies contribution default.", "董事会发现出资违约后由公司发出的书面缴纳要求。", "issue a written capital call", "The company issued a written capital call to the defaulting shareholder.", [51, 52]),
    term("grace-period", "grace period", "宽限期", "The additional payment period stated in the call; it must be at least 60 days.", "催缴书载明的额外缴纳期限，不得少于60日。", "a grace period of at least 60 days", "The grace period runs from the date of the capital call.", [52]),
    term("forfeiture", "forfeiture of equity", "股东失权", "Loss of the equity corresponding to an unpaid contribution after the statutory procedure.", "经法定程序丧失与未缴出资相对应的股权。", "issue a forfeiture notice", "The equity is forfeited from the date the written notice is issued.", [52]),
    term("acceleration", "accelerated payment", "出资加速到期", "Early payment of an otherwise unmatured contribution under Article 54.", "依第54条提前缴纳原本尚未届期的出资。", "require accelerated payment", "A matured creditor may require accelerated payment when the company cannot pay.", [54]),
    term("withdrawal", "withdrawal of contribution", "抽逃出资", "Improper removal of contributed capital after company formation.", "公司成立后不当抽回已经投入公司的出资。", "return a withdrawn contribution", "A shareholder that withdraws capital must return it.", [53], "evidence"),
    term("joint-liability", "joint and several liability", "连带责任", "Liability allowing the claimant to pursue any liable person for the full covered amount.", "权利人可在责任范围内请求任一责任主体承担全部责任。", "be jointly and severally liable for the shortfall", "Other formation shareholders may be jointly and severally liable within the shortfall.", [50], "recognition"),
  ],
  ruleRoutes: [
    { id: "payment", articleParagraph: 1, articleLabel: "Arts. 47–50", title: b("Payment and shortfall", "缴纳与出资不足"), blocks: [
      { id: "promise", label: b("PROMISE", "认缴"), content: b("Identify the amount, form and due date in the articles.", "核对章程中的出资额、出资方式和日期。") },
      { id: "performance", label: b("PERFORMANCE", "履行"), content: b("Check payment into the company account or transfer of property title.", "核对货币入账或非货币财产权转移。") },
      { id: "shortfall", label: b("SHORTFALL", "不足"), content: b("The shareholder pays the shortfall and compensates company loss; formation shareholders may share statutory liability.", "违约股东补足出资并赔偿公司损失；设立时其他股东可能承担法定责任。") },
    ], formula: b("Promise + due date + defective performance → payment and statutory liability", "认缴内容 + 到期 + 履行瑕疵 → 补缴及法定责任") },
    { id: "call", articleParagraph: 2, articleLabel: "Arts. 51–52", title: b("Capital call and forfeiture", "催缴与失权"), blocks: [
      { id: "verify", label: b("BOARD CHECK", "董事会核查"), content: b("The board identifies failure to pay in full and on time.", "董事会发现股东未按期足额缴纳出资。") },
      { id: "call", label: b("WRITTEN CALL", "书面催缴"), content: b("The company issues a written call; any grace period must be at least 60 days.", "公司书面催缴；宽限期不得少于60日。") },
      { id: "notice", label: b("FORFEITURE NOTICE", "失权通知"), content: b("After continued default, a board resolution authorizes a written forfeiture notice.", "宽限期届满仍违约的，经董事会决议发出书面失权通知。") },
      { id: "dispose", label: b("FOLLOW-UP", "后续处理"), content: b("Transfer or cancel the equity within six months, or other shareholders pay proportionately.", "六个月内转让或注销股权，否则其他股东按出资比例缴纳。") },
    ], formula: b("Board check → written call → 60-day minimum → board resolution → written notice", "董事会核查 → 书面催缴 → 至少60日 → 董事会决议 → 书面失权通知") },
    { id: "creditor", articleParagraph: 3, articleLabel: "Art. 54", title: b("Accelerated payment", "加速到期"), blocks: [
      { id: "matured-debt", label: b("DEBT", "债务"), content: b("The company has a matured debt and cannot pay it.", "公司存在到期债务且不能清偿。") },
      { id: "unmatured", label: b("CONTRIBUTION", "出资"), content: b("The shareholder has subscribed contribution that is not yet due.", "股东存在已认缴但未届期的出资。") },
      { id: "claimant", label: b("CLAIMANT", "请求主体"), content: b("The company or a creditor with a matured claim may demand early payment.", "公司或者已到期债权的债权人可以请求提前缴纳。") },
    ], formula: b("Inability to pay a matured debt + unmatured subscription → accelerated payment", "不能清偿到期债务 + 未届期认缴出资 → 提前缴纳") },
  ],
  statute: [
    { paragraph: 1, article: 47, citation: "Article 47", routeId: "payment", heading: b("Five-year contribution period", "五年出资期限"), chineseAuthoritative: "有限责任公司的注册资本为在公司登记机关登记的全体股东认缴的出资额。全体股东认缴的出资额由股东按照公司章程的规定自公司成立之日起五年内缴足。法律、行政法规以及国务院决定对有限责任公司注册资本实缴、注册资本最低限额、股东出资期限另有规定的，从其规定。", courseTranslation: "The registered capital of a limited liability company consists of the subscribed contributions registered for all shareholders. The shareholders shall fully pay those contributions, as provided in the articles of association, within five years after the company is formed, unless special rules apply.", focusExpressions: [{ en: "subscribed contributions", zh: "认缴的出资额", tone: "concept" }, { en: "fully pay", zh: "缴足", tone: "conduct" }, { en: "within five years after formation", zh: "自公司成立之日起五年内", tone: "threshold" }] },
    { paragraph: 2, article: 52, citation: "Article 52", routeId: "call", heading: b("Call and forfeiture procedure", "催缴与失权程序"), chineseAuthoritative: "股东未按照公司章程规定的出资日期缴纳出资，公司依照前条第一款规定发出书面催缴书催缴出资的，可以载明缴纳出资的宽限期；宽限期自公司发出催缴书之日起，不得少于六十日。宽限期届满，股东仍未履行出资义务的，公司经董事会决议可以向该股东发出失权通知，通知应当以书面形式发出。自通知发出之日起，该股东丧失其未缴纳出资的股权。依照前款规定丧失的股权应当依法转让，或者相应减少注册资本并注销该股权；六个月内未转让或者注销的，由公司其他股东按照其出资比例足额缴纳相应出资。股东对失权有异议的，应当自接到失权通知之日起三十日内，向人民法院提起诉讼。", courseTranslation: "A written capital call may grant a grace period of no less than 60 days. If default continues, the company may, by board resolution, issue a written forfeiture notice. The shareholder loses the equity corresponding to the unpaid contribution when the notice is issued. The equity must then be transferred or cancelled; if neither occurs within six months, the other shareholders pay proportionately. A shareholder challenging the forfeiture must sue within 30 days after receiving the notice.", focusExpressions: [{ en: "written capital call", zh: "书面催缴书", tone: "conduct" }, { en: "grace period", zh: "宽限期", tone: "threshold" }, { en: "forfeiture notice", zh: "失权通知", tone: "consequence" }, { en: "within 30 days", zh: "三十日内", tone: "threshold" }] },
    { paragraph: 3, article: 54, citation: "Article 54", routeId: "creditor", heading: b("Accelerated payment", "出资加速到期"), chineseAuthoritative: "公司不能清偿到期债务的，公司或者已到期债权的债权人有权要求已认缴出资但未届出资期限的股东提前缴纳出资。", courseTranslation: "Where a company cannot pay a matured debt, the company or a creditor whose claim has matured may require a shareholder to pay early a subscribed contribution that is not yet due.", focusExpressions: [{ en: "cannot pay a matured debt", zh: "不能清偿到期债务", tone: "threshold" }, { en: "a creditor whose claim has matured", zh: "已到期债权的债权人", tone: "actor" }, { en: "require early payment", zh: "要求提前缴纳", tone: "consequence" }] },
  ],
  caseStudy: {
    title: b("The unpaid subscription", "未届期认缴出资"), label: "CASE FILE · HARBOR LTD.",
    facts: "Harbor Ltd. owes a supplier RMB 800,000 under a matured invoice and has only RMB 50,000 available. Lin subscribed RMB 1 million, payable next year. The supplier asks Lin to pay now. The company has not started an Article 52 forfeiture procedure.",
    evidencePrompt: "Which facts determine the correct statutory route?",
    evidenceRanking: [
      { rank: 1, fact: "The supplier's claim is matured and the company cannot pay it.", weight: "strong" },
      { rank: 2, fact: "Lin has an unpaid subscribed contribution that is not yet due.", weight: "strong" },
      { rank: 3, fact: "No capital-call or forfeiture procedure has been started.", weight: "supporting" },
    ],
    writingPrompt: "Write a 50–90 word conclusion", writingHint: "Identify Article 54 and explain why Article 52 is not a prerequisite.", answerPlaceholder: "Article 54 applies because Harbor Ltd. cannot pay...", minimumWords: 25,
    modelAnswer: "Article 54 applies. Harbor Ltd. cannot pay a matured debt, the supplier holds a matured claim, and Lin has a subscribed contribution that is not yet due. The supplier may therefore require Lin to pay the contribution early. Article 52 governs a separate company procedure for capital calls and forfeiture; completing that procedure is not stated as a condition for Article 54 acceleration.",
  },
  quiz: [
    { id: "capital-q1", type: "single", objective: "five-year-rule", prompt: b("Under the general rule, when must LLC shareholders fully pay their subscribed contributions?", "一般规则下，有限责任公司股东应在何时缴足认缴出资？"), choices: [{ id: "a", text: "Within five years after company formation, as provided in the articles.", correct: true }, { id: "b", text: "Only when a creditor requests payment.", correct: false }, { id: "c", text: "Within five years after subscription, regardless of formation.", correct: false }, { id: "d", text: "There is no general time limit.", correct: false }], explanation: b("Article 47 uses company formation as the starting point and preserves special statutory rules.", "第47条以公司成立之日为起点，并保留特别规定。"), errorTag: "wrong-starting-point" },
    { id: "capital-q2", type: "multiple", objective: "forfeiture", prompt: b("Which steps belong to the Article 52 forfeiture route?", "哪些步骤属于第52条失权路径？"), choices: [{ id: "a", text: "A written capital call.", correct: true }, { id: "b", text: "A grace period of at least 60 days if one is stated.", correct: true }, { id: "c", text: "A board resolution and written forfeiture notice after continued default.", correct: true }, { id: "d", text: "Automatic forfeiture on the original due date.", correct: false }], explanation: b("Forfeiture is procedural and is not automatic on the original payment date.", "股东失权必须履行法定程序，不会在原出资日期自动发生。"), errorTag: "automatic-forfeiture" },
    { id: "capital-q3", type: "single", objective: "acceleration", prompt: b("Who may request accelerated payment under Article 54?", "谁可以依第54条请求出资加速到期？"), choices: [{ id: "a", text: "Only the board.", correct: false }, { id: "b", text: "The company or a creditor whose claim has matured.", correct: true }, { id: "c", text: "Any prospective creditor.", correct: false }, { id: "d", text: "Only the registration authority.", correct: false }], explanation: b("The statute expressly names the company and a creditor with a matured claim.", "法条明确规定请求主体为公司或者已到期债权的债权人。"), errorTag: "wrong-claimant" },
    { id: "capital-q4", type: "single", objective: "withdrawal", prompt: b("What is the primary consequence when a shareholder withdraws contribution after formation?", "股东在公司成立后抽逃出资，首要后果是什么？"), choices: [{ id: "a", text: "The shareholder must return the withdrawn contribution.", correct: true }, { id: "b", text: "The company is automatically dissolved.", correct: false }, { id: "c", text: "All shareholders lose voting rights.", correct: false }, { id: "d", text: "The board must cancel all equity.", correct: false }], explanation: b("Article 53 requires return of the withdrawn contribution and may add compensation liability.", "第53条首先要求返还抽逃出资，并可能附加赔偿责任。"), errorTag: "wrong-consequence" },
  ],
  navigation: { article: 52, chapter: 3 },
});

export default course;
