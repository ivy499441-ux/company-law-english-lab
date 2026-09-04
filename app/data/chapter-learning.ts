import {
  chapterOneConceptTerms,
  chapterOneExpressions,
  chapterOneKeyArticles,
  chapterOneThemes,
  CoreExpression,
  HighlightTone,
} from "./chapter-one";

export type ChapterLearningConfig = {
  number: number;
  start: number;
  end: number;
  titleZh: string;
  titleEn: string;
  themes: { number: string; title: string; articles: string }[];
  conceptTerms: string[];
  expressions: CoreExpression[];
  keyArticles: { number: number; title: string }[];
};

function expression(
  id: string,
  article: number,
  titleZh: string,
  english: [string, string, string],
  chinese: [string, string, string],
  tone: HighlightTone = "rule",
): CoreExpression {
  return {
    id,
    article,
    titleZh,
    titleEn: english[1],
    english: [{ text: english[0] }, { text: english[1], tone }, { text: english[2] }],
    chinese: [{ text: chinese[0] }, { text: chinese[1], tone }, { text: chinese[2] }],
    note: `${english[1]} 是本章需要熟悉的核心法律英语搭配。`,
  };
}

export const chapterLearningConfigs: ChapterLearningConfig[] = [
  {
    number: 1, start: 1, end: 28, titleZh: "总则", titleEn: "General Provisions",
    themes: chapterOneThemes,
    conceptTerms: chapterOneConceptTerms,
    expressions: chapterOneExpressions,
    keyArticles: chapterOneKeyArticles,
  },
  {
    number: 2, start: 29, end: 41, titleZh: "公司登记", titleEn: "Company Registration",
    themes: [
      { number: "01", title: "设立登记", articles: "Art. 29–31" },
      { number: "02", title: "登记事项与营业执照", articles: "Art. 32–33" },
      { number: "03", title: "变更、注销与分公司登记", articles: "Art. 34–38" },
      { number: "04", title: "信息公示与登记服务", articles: "Art. 39–41" },
    ],
    conceptTerms: ["company registration", "registration authority", "business license", "change registration", "public disclosure", "registered capital", "legal representative", "bona fide third party"],
    expressions: [
      expression("c2-apply-registration", 29, "提出设立登记申请", ["A company shall ", "apply for formation registration", "."], ["公司应当", "申请设立登记", "。"]),
      expression("c2-against-good-faith", 34, "未经登记不得对抗善意相对人", ["An unregistered change may not be asserted against a ", "bona fide third party", "."], ["未经登记的变更不得对抗", "善意相对人", "。"], "entity"),
      expression("c2-make-public", 40, "依法公示公司信息", ["The company shall ", "make the information available to the public", "."], ["公司应当依法", "公示有关信息", "。"]),
    ],
    keyArticles: [{ number: 29, title: "设立登记" }, { number: 32, title: "登记事项" }, { number: 34, title: "变更登记效力" }, { number: 40, title: "企业信息公示" }],
  },
  {
    number: 3, start: 42, end: 83, titleZh: "有限责任公司的设立和组织机构", titleEn: "Formation and Governance of Limited Liability Companies",
    themes: [
      { number: "01", title: "设立与公司章程", articles: "Art. 42–46" },
      { number: "02", title: "出资、催缴与失权", articles: "Art. 47–54" },
      { number: "03", title: "股东名册与知情权", articles: "Art. 55–57" },
      { number: "04", title: "股东会与董事会", articles: "Art. 58–75" },
      { number: "05", title: "监督机构", articles: "Art. 76–83" },
    ],
    conceptTerms: ["capital contribution", "subscribed capital contribution", "registered capital", "shareholder register", "right to know", "shareholders' meeting", "board of directors", "board of supervisors", "audit committee", "voting rights"],
    expressions: [
      expression("c3-make-contribution", 49, "按期足额缴纳出资", ["A shareholder shall ", "make its capital contribution in full and on time", "."], ["股东应当", "按期足额缴纳出资", "。"]),
      expression("c3-inspect-copy", 57, "行使股东知情权", ["A shareholder is entitled to ", "inspect and copy", " specified company records."], ["股东有权", "查阅、复制", "法定公司资料。"], "entity"),
      expression("c3-voting-rights", 66, "以表决权形成决议", ["A resolution shall be adopted by shareholders representing ", "more than half of the voting rights", "."], ["决议应当经代表", "过半数表决权", "的股东通过。"], "condition"),
    ],
    keyArticles: [{ number: 47, title: "五年出资期限" }, { number: 52, title: "股东失权" }, { number: 54, title: "出资加速到期" }, { number: 57, title: "股东知情权" }, { number: 66, title: "股东会表决" }, { number: 69, title: "审计委员会" }, { number: 78, title: "监事会职权" }],
  },
  {
    number: 4, start: 84, end: 90, titleZh: "有限责任公司的股权转让", titleEn: "Equity Transfers of Limited Liability Companies",
    themes: [
      { number: "01", title: "自愿转让与优先购买权", articles: "Art. 84" },
      { number: "02", title: "强制执行与名册变更", articles: "Art. 85–87" },
      { number: "03", title: "未届期股权的出资责任", articles: "Art. 88" },
      { number: "04", title: "异议股东回购与继承", articles: "Art. 89–90" },
    ],
    conceptTerms: ["equity transfer", "right of first refusal", "shareholder register", "share certificate", "capital contribution", "joint and several liability"],
    expressions: [
      expression("c4-equal-conditions", 84, "同等条件下优先购买", ["Other shareholders have a right of first refusal ", "under equal conditions", "."], ["其他股东在", "同等条件下", "享有优先购买权。"], "condition"),
      expression("c4-notify-company", 86, "书面通知公司", ["The transferor shall ", "notify the company in writing", " of the equity transfer."], ["转让股东应当将股权转让事项", "书面通知公司", "。"]),
      expression("c4-assume-obligation", 88, "受让人承接出资义务", ["The transferee shall ", "assume the obligation to make the contribution", "."], ["受让人应当", "承担缴纳出资的义务", "。"], "consequence"),
    ],
    keyArticles: [{ number: 84, title: "股权对外转让" }, { number: 86, title: "变更股东名册" }, { number: 88, title: "未届期股权责任" }, { number: 89, title: "异议股东回购" }],
  },
  {
    number: 5, start: 91, end: 141, titleZh: "股份有限公司的设立和组织机构", titleEn: "Formation and Governance of Joint Stock Companies",
    themes: [
      { number: "01", title: "发起设立与募集设立", articles: "Art. 91–106" },
      { number: "02", title: "股东资料与知情权", articles: "Art. 107–110" },
      { number: "03", title: "股东会运行", articles: "Art. 111–119" },
      { number: "04", title: "董事会与监督机构", articles: "Art. 120–132" },
      { number: "05", title: "上市公司特别治理", articles: "Art. 133–141" },
    ],
    conceptTerms: ["promoter", "incorporation by promotion", "public offering", "shareholders' meeting", "board of directors", "audit committee", "cumulative voting", "listed company", "right to know"],
    expressions: [
      expression("c5-promotion", 91, "以发起方式设立", ["A joint stock company may be ", "incorporated by promotion", "."], ["股份有限公司可以", "采取发起设立方式", "。"]),
      expression("c5-convene-meeting", 113, "召开临时股东会", ["The company shall ", "convene an interim shareholders' meeting", " when a statutory event occurs."], ["出现法定情形时，公司应当", "召开临时股东会会议", "。"], "condition"),
      expression("c5-cumulative-voting", 117, "实行累积投票", ["The company may adopt the ", "cumulative voting system", "."], ["公司可以实行", "累积投票制", "。"]),
    ],
    keyArticles: [{ number: 91, title: "设立方式" }, { number: 103, title: "公司成立大会" }, { number: 110, title: "股东知情权" }, { number: 116, title: "股份表决权" }, { number: 117, title: "累积投票" }, { number: 121, title: "审计委员会" }, { number: 135, title: "上市公司关联交易" }],
  },
  {
    number: 6, start: 142, end: 167, titleZh: "股份有限公司的股份发行和转让", titleEn: "Share Issuance and Transfer",
    themes: [
      { number: "01", title: "股份类别与发行原则", articles: "Art. 142–150" },
      { number: "02", title: "新股发行与授权资本", articles: "Art. 151–156" },
      { number: "03", title: "股份转让", articles: "Art. 157–161" },
      { number: "04", title: "股份回购与财务资助", articles: "Art. 162–167" },
    ],
    conceptTerms: ["class share", "registered share", "share certificate", "public offering", "share transfer", "share repurchase", "financial assistance", "listed company"],
    expressions: [
      expression("c6-equal-rights", 143, "同类别同权", ["Each share of the same class shall carry ", "equal rights", "."], ["同类别的每一股份应当具有", "同等权利", "。"]),
      expression("c6-transfer-shares", 157, "依法转让股份", ["A shareholder may ", "transfer its shares", " to another person."], ["股东可以向他人", "转让其股份", "。"]),
      expression("c6-repurchase", 162, "例外回购本公司股份", ["A company may ", "repurchase its own shares", " only in statutory circumstances."], ["公司仅在法定情形下可以", "收购本公司股份", "。"], "condition"),
    ],
    keyArticles: [{ number: 142, title: "面额股与无面额股" }, { number: 144, title: "类别股" }, { number: 152, title: "授权发行股份" }, { number: 157, title: "股份转让" }, { number: 160, title: "转让限制" }, { number: 162, title: "股份回购" }, { number: 163, title: "财务资助" }],
  },
  {
    number: 7, start: 168, end: 177, titleZh: "国家出资公司组织机构的特别规定", titleEn: "Special Rules for State-invested Companies",
    themes: [
      { number: "01", title: "国家出资公司范围", articles: "Art. 168–170" },
      { number: "02", title: "国有独资公司决策", articles: "Art. 171–172" },
      { number: "03", title: "董事、经理与外部董事", articles: "Art. 173–176" },
      { number: "04", title: "监督、风控与合规", articles: "Art. 176–177" },
    ],
    conceptTerms: ["state-invested company", "wholly state-owned company", "contributor's duties", "external director", "audit committee", "internal compliance"],
    expressions: [
      expression("c7-perform-duties", 169, "履行出资人职责", ["The designated authority shall ", "perform the contributor's duties", " on behalf of the State."], ["指定机构代表国家", "履行出资人职责", "。"], "entity"),
      expression("c7-external-directors", 173, "外部董事过半数", ["More than half of the board members shall be ", "external directors", "."], ["董事会成员中应当过半数为", "外部董事", "。"], "rule"),
      expression("c7-risk-control", 177, "建立风险控制制度", ["The company shall establish a sound ", "risk-control and compliance system", "."], ["公司应当建立健全", "风险控制和合规管理制度", "。"]),
    ],
    keyArticles: [{ number: 168, title: "国家出资公司定义" }, { number: 172, title: "出资人机构职权" }, { number: 173, title: "外部董事" }, { number: 177, title: "风控与合规" }],
  },
  {
    number: 8, start: 178, end: 193, titleZh: "董事、监事、高级管理人员的资格和义务", titleEn: "Qualifications and Duties of Directors, Supervisors and Senior Executives",
    themes: [
      { number: "01", title: "任职资格", articles: "Art. 178–179" },
      { number: "02", title: "忠实与勤勉义务", articles: "Art. 180–181" },
      { number: "03", title: "关联交易与商业机会", articles: "Art. 182–186" },
      { number: "04", title: "赔偿与诉讼救济", articles: "Art. 187–193" },
    ],
    conceptTerms: ["duty of loyalty", "duty of diligence", "conflict of interest", "related-party transaction", "corporate opportunity", "non-compete restriction", "derivative action", "compensation liability", "senior executive"],
    expressions: [
      expression("c8-loyalty", 180, "承担忠实义务", ["Directors and senior executives ", "owe a duty of loyalty", " to the company."], ["董事、高级管理人员对公司", "负有忠实义务", "。"]),
      expression("c8-corporate-opportunity", 183, "不得攫取公司机会", ["An officer may not ", "exploit a corporate opportunity", " for personal benefit."], ["董监高不得为个人利益", "谋取属于公司的商业机会", "。"], "condition"),
      expression("c8-derivative", 189, "提起股东代表诉讼", ["A qualified shareholder may ", "institute a derivative action", " in its own name."], ["符合条件的股东可以自己的名义", "提起股东代表诉讼", "。"], "consequence"),
    ],
    keyArticles: [{ number: 178, title: "任职禁止" }, { number: 180, title: "忠实与勤勉义务" }, { number: 182, title: "关联交易报告" }, { number: 183, title: "公司机会" }, { number: 184, title: "同业竞争" }, { number: 189, title: "股东代表诉讼" }, { number: 191, title: "对外赔偿责任" }],
  },
  {
    number: 9, start: 194, end: 206, titleZh: "公司债券", titleEn: "Corporate Bonds",
    themes: [
      { number: "01", title: "债券发行与募集文件", articles: "Art. 194–197" },
      { number: "02", title: "持有人名册与转让", articles: "Art. 198–201" },
      { number: "03", title: "可转换公司债券", articles: "Art. 202–203" },
      { number: "04", title: "持有人会议与受托管理", articles: "Art. 204–206" },
    ],
    conceptTerms: ["corporate bond", "bondholders' meeting", "bond trustee", "convertible corporate bond", "registered bond"],
    expressions: [
      expression("c9-issue-bonds", 194, "发行公司债券", ["A company may ", "issue corporate bonds", " publicly or privately."], ["公司可以公开或者非公开", "发行公司债券", "。"]),
      expression("c9-bondholders-meeting", 204, "设立债券持有人会议", ["The issuer shall establish a ", "bondholders' meeting", "."], ["发行人应当设立", "债券持有人会议", "。"], "entity"),
      expression("c9-due-care", 206, "受托管理人勤勉尽责", ["The bond trustee shall ", "act diligently and impartially", "."], ["债券受托管理人应当", "勤勉尽责并公正履职", "。"]),
    ],
    keyArticles: [{ number: 194, title: "公司债券定义" }, { number: 198, title: "债券持有人名册" }, { number: 202, title: "可转换公司债券" }, { number: 204, title: "债券持有人会议" }, { number: 205, title: "债券受托管理人" }],
  },
  {
    number: 10, start: 207, end: 215, titleZh: "公司财务、会计", titleEn: "Financial Affairs and Accounting",
    themes: [
      { number: "01", title: "财务会计制度与报告", articles: "Art. 207–209" },
      { number: "02", title: "利润分配", articles: "Art. 210–212" },
      { number: "03", title: "公积金", articles: "Art. 210, 213–214" },
      { number: "04", title: "审计机构", articles: "Art. 215" },
    ],
    conceptTerms: ["financial accounting report", "statutory common reserve", "profit distribution", "accounting firm", "registered capital"],
    expressions: [
      expression("c10-prepare-report", 208, "编制财务会计报告", ["The company shall ", "prepare a financial accounting report", " for each fiscal year."], ["公司应当在每一会计年度终了时", "编制财务会计报告", "。"]),
      expression("c10-appropriate-reserve", 210, "提取法定公积金", ["The company shall ", "appropriate ten percent to the statutory common reserve", "."], ["公司应当提取税后利润的百分之十列入", "法定公积金", "。"]),
      expression("c10-distribute-profits", 212, "在期限内分配利润", ["The board shall ", "distribute the profits within six months", "."], ["董事会应当在六个月内", "进行利润分配", "。"], "consequence"),
    ],
    keyArticles: [{ number: 208, title: "财务会计报告" }, { number: 210, title: "利润分配与公积金" }, { number: 211, title: "违法分配返还" }, { number: 212, title: "利润分配期限" }, { number: 214, title: "公积金用途" }],
  },
  {
    number: 11, start: 216, end: 228, titleZh: "公司合并、分立、增资、减资", titleEn: "Merger, Division and Changes in Registered Capital",
    themes: [
      { number: "01", title: "会计资料与账簿纪律", articles: "Art. 216–217" },
      { number: "02", title: "公司合并", articles: "Art. 218–221" },
      { number: "03", title: "公司分立", articles: "Art. 222–223" },
      { number: "04", title: "减资与增资", articles: "Art. 224–228" },
    ],
    conceptTerms: ["merger", "division", "capital reduction", "capital increase", "creditor notice", "registered capital", "joint and several liability"],
    expressions: [
      expression("c11-notify-creditors", 220, "通知并公告债权人", ["The company shall ", "notify its creditors", " and publish an announcement."], ["公司应当", "通知债权人", "并发布公告。"]),
      expression("c11-succeed-debts", 221, "承继债权债务", ["The surviving or new company shall ", "succeed to the claims and debts", "."], ["存续或者新设公司应当", "承继债权、债务", "。"], "consequence"),
      expression("c11-reduce-capital", 224, "依法减少注册资本", ["A company reducing capital shall ", "prepare a balance sheet and inventory of property", "."], ["公司减资应当", "编制资产负债表及财产清单", "。"], "condition"),
    ],
    keyArticles: [{ number: 218, title: "合并方式" }, { number: 220, title: "合并债权人保护" }, { number: 223, title: "分立债务承担" }, { number: 224, title: "一般减资" }, { number: 225, title: "弥补亏损减资" }, { number: 227, title: "增资优先认缴" }],
  },
  {
    number: 12, start: 229, end: 242, titleZh: "公司解散和清算", titleEn: "Dissolution and Liquidation",
    themes: [
      { number: "01", title: "解散事由与司法解散", articles: "Art. 229–231" },
      { number: "02", title: "清算义务人与清算组", articles: "Art. 232–234" },
      { number: "03", title: "债权申报与财产分配", articles: "Art. 235–238" },
      { number: "04", title: "注销与破产清算", articles: "Art. 239–242" },
    ],
    conceptTerms: ["dissolution", "liquidation group", "liquidation obligor", "bankruptcy liquidation", "simplified deregistration", "creditor notice", "duty of loyalty", "duty of diligence"],
    expressions: [
      expression("c12-form-group", 232, "及时组成清算组", ["The liquidation obligor shall ", "form a liquidation group", " within the statutory period."], ["清算义务人应当在法定期限内", "组成清算组", "。"]),
      expression("c12-declare-claims", 235, "通知债权人申报债权", ["Creditors may ", "declare their claims", " within the announced period."], ["债权人可以在公告期限内", "申报债权", "。"], "entity"),
      expression("c12-bankruptcy", 237, "申请破产清算", ["If the property is insufficient, the group shall ", "apply for bankruptcy liquidation", "."], ["公司财产不足清偿债务的，清算组应当", "申请破产清算", "。"], "condition"),
    ],
    keyArticles: [{ number: 229, title: "法定解散事由" }, { number: 231, title: "司法解散" }, { number: 232, title: "清算义务人" }, { number: 235, title: "债权申报" }, { number: 237, title: "破产清算" }, { number: 240, title: "简易注销" }],
  },
  {
    number: 13, start: 243, end: 248, titleZh: "外国公司的分支机构", titleEn: "Branches of Foreign Companies",
    themes: [
      { number: "01", title: "外国公司定义", articles: "Art. 243" },
      { number: "02", title: "分支机构设立许可", articles: "Art. 244–245" },
      { number: "03", title: "名称、文件与责任", articles: "Art. 246–247" },
      { number: "04", title: "境内经营规范", articles: "Art. 248" },
    ],
    conceptTerms: ["foreign company", "branch of a foreign company", "legal personality", "civil liability", "business license"],
    expressions: [
      expression("c13-establish-branch", 244, "申请设立境内分支机构", ["A foreign company shall apply to ", "establish a branch within China", "."], ["外国公司应当申请在中国境内", "设立分支机构", "。"]),
      expression("c13-no-personality", 247, "分支机构不具有法人资格", ["The branch does not have ", "Chinese legal-person status", "."], ["外国公司分支机构不具有", "中国法人资格", "。"], "entity"),
      expression("c13-bear-liability", 247, "外国公司承担责任", ["The foreign company shall ", "bear civil liability", " for its branch."], ["外国公司对其分支机构的经营活动", "承担民事责任", "。"], "consequence"),
    ],
    keyArticles: [{ number: 243, title: "外国公司定义" }, { number: 244, title: "设立申请" }, { number: 245, title: "代表人与资金" }, { number: 247, title: "法人资格与责任" }],
  },
  {
    number: 14, start: 249, end: 264, titleZh: "法律责任", titleEn: "Legal Liability",
    themes: [
      { number: "01", title: "外国公司撤销与违法登记", articles: "Art. 249–251" },
      { number: "02", title: "出资违法责任", articles: "Art. 252–253" },
      { number: "03", title: "会计、变动与清算责任", articles: "Art. 254–257" },
      { number: "04", title: "登记监管与名称责任", articles: "Art. 258–262" },
      { number: "05", title: "责任竞合与刑事责任", articles: "Art. 263–264" },
    ],
    conceptTerms: ["administrative liability", "civil compensation", "criminal liability", "business license", "capital contribution", "public disclosure", "liquidation group"],
    expressions: [
      expression("c14-order-correct", 250, "责令改正", ["The registration authority may ", "order the company to make corrections", "."], ["公司登记机关可以", "责令公司改正", "。"], "consequence"),
      expression("c14-subject-fine", 252, "处以罚款", ["The responsible person may ", "be subject to a fine", "."], ["责任主体可以", "被处以罚款", "。"], "consequence"),
      expression("c14-civil-first", 263, "民事赔偿优先", ["Where assets are insufficient, ", "civil compensation takes priority", "."], ["财产不足以支付时，", "先承担民事赔偿责任", "。"], "rule"),
    ],
    keyArticles: [{ number: 250, title: "欺诈登记责任" }, { number: 251, title: "公示违法责任" }, { number: 252, title: "虚假出资责任" }, { number: 255, title: "未通知债权人责任" }, { number: 263, title: "民事赔偿优先" }, { number: 264, title: "刑事责任" }],
  },
  {
    number: 15, start: 265, end: 266, titleZh: "附则", titleEn: "Supplementary Provisions",
    themes: [
      { number: "01", title: "高级管理人员", articles: "Art. 265(1)" },
      { number: "02", title: "控股股东与实际控制人", articles: "Art. 265(2)–(3)" },
      { number: "03", title: "关联关系", articles: "Art. 265(4)" },
      { number: "04", title: "施行与出资期限衔接", articles: "Art. 266" },
    ],
    conceptTerms: ["senior executive", "controlling shareholder", "actual controller", "related-party relationship"],
    expressions: [
      expression("c15-for-purposes", 265, "界定法定用语", ["For the purposes of this Law, ", "senior executive means", " a person within the statutory scope."], ["在本法中，", "高级管理人员是指", "法定范围内的人员。"], "entity"),
      expression("c15-able-control", 265, "定义实际控制人", ["An actual controller is a person able to ", "exercise actual control", " over a company."], ["实际控制人是能够对公司", "实施实际控制", "的人。"], "entity"),
      expression("c15-take-effect", 266, "表达法律施行日期", ["This Law shall ", "come into force on 1 July 2024", "."], ["本法自2024年7月1日起", "施行", "。"], "rule"),
    ],
    keyArticles: [{ number: 265, title: "术语定义" }, { number: 266, title: "施行与衔接" }],
  },
];
