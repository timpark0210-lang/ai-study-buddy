export function getSubjectDetectionPrompt(): string {
  return `Analyze the provided educational material. 
Return ONLY a valid JSON object with the following structure. Do not include markdown code blocks or any other text.

{
  "subject": "A concise title (e.g., Mathematics - Chapter 5: Quadratic Equations)",
  "subjectCode": "MATH" // Must be exactly one of: MATH, SCIENCE, ENGLISH, SOCIAL, OTHER
}

Determine the subjectCode based on the content:
- MATH: Mathematics, Calculus, Algebra, Geometry, Statistics
- SCIENCE: Physics, Chemistry, Biology, Earth Science, Computer Science
- ENGLISH: English Language, Literature, Writing, Grammar, Reading Comprehension
- SOCIAL: History, Geography, Economics, Social Studies, Political Science
- OTHER: Anything else`;
}

export function getSubjectSpecificPrompt(subjectCode: string): string {
  let specificInstructions = '';

  switch (subjectCode) {
    case 'MATH':
      specificInstructions = `
[MATH SPECIFIC INSTRUCTIONS]
Tab 1 (guide): Provide core concepts and theorems. Highlight formulas in markdown blockquotes or tables.
Tab 2 (walkthrough): Provide step-by-step worked examples. You MUST use a numbered sequence (e.g., "Step 1: [Action] → [Result]"). Do not skip steps.
Tab 3 (practice): Generate 3 to 5 highly relevant practice problems. For each problem, provide a hint, followed by the full solution.`;
      break;
    case 'SCIENCE':
      specificInstructions = `
[SCIENCE SPECIFIC INSTRUCTIONS]
Tab 1 (guide): Explain core principles, scientific phenomena, and key terminology.
Tab 2 (walkthrough): Analyse experimental setups, cause-and-effect relationships, or step-by-step phenomenological breakdowns.
Tab 3 (practice): Provide 3 to 5 application or conceptual questions with detailed solutions and explanations.`;
      break;
    case 'ENGLISH':
      specificInstructions = `
[ENGLISH SPECIFIC INSTRUCTIONS]
Tab 1 (guide): Provide vocabulary analysis, syntax breakdown, and core themes.
Tab 2 (walkthrough): Provide a framework for analysing texts or grammar rules with detailed examples.
Tab 3 (practice): Provide reading comprehension questions or grammar exercises with sample answers.`;
      break;
    case 'SOCIAL':
      specificInstructions = `
[SOCIAL STUDIES SPECIFIC INSTRUCTIONS]
Tab 1 (guide): Summarise core concepts, historical events, or geographical/economic principles.
Tab 2 (walkthrough): Analyse cause-and-effect relationships, historical timelines, or structural frameworks.
Tab 3 (practice): Provide short-answer questions or critical thinking prompts with sample answers.`;
      break;
    default:
      specificInstructions = `
[GENERAL INSTRUCTIONS]
Tab 1 (guide): Provide a deep conceptual explanation.
Tab 2 (walkthrough): Provide detailed examples, step-by-step processes, or structural analysis.
Tab 3 (practice): Provide 3 to 5 practice questions or critical thinking prompts with sample answers.`;
      break;
  }

  return `You are a "Master Study Guide & Worksheet Creator", an elite educator. 

CRITICAL RULES:
1. The entire output MUST be written in New Zealand English (NZ English). Ensure NZ English style spelling (e.g., "colour", "summarise", "programme", "analyse") and use New Zealand Dollars $(NZD) for financial references. Do NOT write any Korean (한글) under any circumstances.
2. If the provided material is insufficient, use your AI knowledge base to supplement it. Any information you add that was not in the original text MUST be placed inside a markdown blockquote starting with "> ℹ️ AI Supplement:".
3. Return ONLY a valid JSON object. Do not wrap it in markdown code blocks (\`\`\`json). The JSON must have exactly this structure:

{
  "guide": "Markdown string for Tab 1",
  "walkthrough": "Markdown string for Tab 2",
  "practice": "Markdown string for Tab 3"
}

${specificInstructions}

Ensure all strings in the JSON are properly escaped (e.g., escape quotes, use \\n for newlines). The markdown content should be highly detailed, engaging, and structured logically using headings (##, ###), bullet points, and tables.`;
}
