import fs from "node:fs";
import path from "node:path";

const [englishPath, chinesePath] = process.argv.slice(2);
const omitEnglish = process.argv.includes("--without-english");
if (!englishPath || !chinesePath) {
  throw new Error("Usage: node scripts/extract-company-law.mjs <english.txt> <chinese.txt>");
}

const englishSource = fs.readFileSync(englishPath, "utf8").slice(0, fs.readFileSync(englishPath, "utf8").indexOf("Article 266 This Law" ) + 2500);
const chineseSource = fs.readFileSync(chinesePath, "utf8");

function chineseNumber(n) {
  const digits = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  if (n < 10) return digits[n];
  if (n < 20) return `十${n % 10 ? digits[n % 10] : ""}`;
  if (n < 100) return `${digits[Math.floor(n / 10)]}十${n % 10 ? digits[n % 10] : ""}`;
  const rest = n % 100;
  if (rest === 0) return `${digits[Math.floor(n / 100)]}百`;
  if (rest < 10) return `${digits[Math.floor(n / 100)]}百零${digits[rest]}`;
  const tens = Math.floor(rest / 10);
  const ones = rest % 10;
  return `${digits[Math.floor(n / 100)]}百${digits[tens]}十${ones ? digits[ones] : ""}`;
}

function sequentialSlices(source, markerFor) {
  const starts = [];
  let cursor = 0;
  for (let n = 1; n <= 266; n += 1) {
    const marker = markerFor(n);
    const index = source.indexOf(marker, cursor);
    if (index < 0) throw new Error(`Missing article marker: ${marker}`);
    starts.push({ n, index, marker });
    cursor = index + marker.length;
  }
  return starts.map((item, i) => ({
    n: item.n,
    raw: source.slice(item.index + item.marker.length, starts[i + 1]?.index ?? source.length),
  }));
}

function cleanEnglish(text) {
  return text
    .replace(/\f/g, "\n")
    .replace(/^\s*Company Law of the People's Republic of China \(Revised in 2023\)\s*$/gm, "")
    .replace(/^\s*\d+\/59\s*$/gm, "")
    .replace(/^\s*Chapter [IVXLCDM]+[^\n]*$/gm, "")
    .replace(/^\s*Section \d+[^\n]*$/gm, "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function cleanChinese(text) {
  return text
    .replace(/\f/g, "\n")
    .replace(/^\s*第[一二三四五六七八九十百]+章[^\n]*$/gm, "")
    .replace(/^\s*第[一二三四五六七八九十百]+节[^\n]*$/gm, "")
    .replace(/\s+/g, "")
    .trim();
}

const chapters = [
  [1, 28, "总则", "General Provisions"],
  [29, 41, "公司登记", "Company Registration"],
  [42, 83, "有限责任公司的设立和组织机构", "Formation and Governance of Limited Liability Companies"],
  [84, 90, "有限责任公司的股权转让", "Equity Transfers of Limited Liability Companies"],
  [91, 141, "股份有限公司的设立和组织机构", "Formation and Governance of Joint Stock Companies"],
  [142, 167, "股份有限公司的股份发行和转让", "Share Issuance and Transfer"],
  [168, 177, "国家出资公司组织机构的特别规定", "Special Rules for State-invested Companies"],
  [178, 193, "董事、监事、高级管理人员的资格和义务", "Qualifications and Duties of Directors, Supervisors and Senior Executives"],
  [194, 206, "公司债券", "Corporate Bonds"],
  [207, 215, "公司财务、会计", "Financial Affairs and Accounting"],
  [216, 228, "公司合并、分立、增资、减资", "Merger, Division and Changes in Registered Capital"],
  [229, 242, "公司解散和清算", "Dissolution and Liquidation"],
  [243, 248, "外国公司的分支机构", "Branches of Foreign Companies"],
  [249, 264, "法律责任", "Legal Liability"],
  [265, 266, "附则", "Supplementary Provisions"],
];

const topics = [
  [1, 28, "基础制度", "Corporate foundations"],
  [29, 41, "登记与公示", "Registration & disclosure"],
  [42, 57, "设立与股东出资", "Formation & capital contributions"],
  [58, 83, "有限责任公司治理", "LLC governance"],
  [84, 90, "股权转让", "Equity transfers"],
  [91, 141, "股份公司治理", "Joint stock company governance"],
  [142, 167, "股份发行与转让", "Share issuance & transfers"],
  [168, 177, "国家出资公司", "State-invested companies"],
  [178, 193, "董监高义务与责任", "Directors' and officers' duties"],
  [194, 215, "债券与财务会计", "Bonds & accounting"],
  [216, 228, "公司重大变动", "Corporate restructuring"],
  [229, 242, "解散与清算", "Dissolution & liquidation"],
  [243, 248, "外国公司分支机构", "Foreign company branches"],
  [249, 266, "法律责任与附则", "Liability & supplementary rules"],
];

const englishArticles = sequentialSlices(englishSource, (n) => `Article ${n} `);
const chineseArticles = sequentialSlices(chineseSource, (n) => `第${chineseNumber(n)}条`);

const articles = englishArticles.map(({ n, raw }, index) => {
  const chapterIndex = chapters.findIndex(([start, end]) => n >= start && n <= end);
  const topic = topics.find(([start, end]) => n >= start && n <= end);
  const [chapterStart, chapterEnd, chapterZh, chapterEn] = chapters[chapterIndex];
  return {
    number: n,
    chapter: chapterIndex + 1,
    chapterZh,
    chapterEn,
    chapterRange: [chapterStart, chapterEnd],
    topicZh: topic[2],
    topicEn: topic[3],
    chinese: cleanChinese(chineseArticles[index].raw),
    english: omitEnglish ? "" : cleanEnglish(raw),
  };
});

const output = {
  meta: {
    titleZh: "中华人民共和国公司法",
    titleEn: "Company Law of the People's Republic of China",
    revision: "2023 revision",
    effectiveDate: "2024-07-01",
    articleCount: articles.length,
    noteZh: "中文法条为权威文本；英文为所提供译本，仅供法律英语学习与对照参考。",
  },
  chapters: chapters.map(([start, end, titleZh, titleEn], index) => ({
    number: index + 1,
    start,
    end,
    titleZh,
    titleEn,
  })),
  topics: topics.map(([start, end, titleZh, titleEn], index) => ({ id: index + 1, start, end, titleZh, titleEn })),
  articles,
};

const target = path.join(process.cwd(), "app/data/company-law.json");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${JSON.stringify(output)}\n`, "utf8");
console.log(`Wrote ${articles.length} aligned articles to ${target}`);
