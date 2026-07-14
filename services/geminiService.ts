
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan, CustomTemplate } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const lessonPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    grade: { type: Type.STRING },
    subject: { type: Type.STRING },
    policy: { type: Type.STRING },
    lessonNumber: { type: Type.STRING },
    subTopic: { type: Type.STRING },
    duration: { type: Type.STRING },
    date: { type: Type.STRING },
    method: { type: Type.STRING },
    strategy: { type: Type.STRING },
    reference: { type: Type.STRING },
    bloomsLevels: { type: Type.ARRAY, items: { type: Type.STRING } },
    objectives: {
      type: Type.OBJECT,
      properties: {
        knowledge: { type: Type.STRING },
        skills: { type: Type.STRING },
        attitude: { type: Type.STRING }
      },
      required: ['knowledge', 'skills', 'attitude']
    },
    materialsTeacher: { type: Type.ARRAY, items: { type: Type.STRING } },
    materialsStudent: { type: Type.ARRAY, items: { type: Type.STRING } },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          duration: { type: Type.STRING },
          teacherActivity: { type: Type.ARRAY, items: { type: Type.STRING } },
          content: { type: Type.ARRAY, items: { type: Type.STRING } },
          studentActivity: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['stepNumber', 'title', 'teacherActivity', 'content', 'studentActivity']
      }
    },
    worksheets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          instructions: { type: Type.STRING },
          wordBank: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }
          },
          questions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['type', 'question']
            }
          }
        },
        required: ['title', 'instructions', 'questions']
      }
    },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'content']
      }
    },
    evaluation: {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.STRING },
        weaknesses: { type: Type.STRING },
        improvements: { type: Type.STRING }
      },
      required: ['strengths', 'weaknesses', 'improvements']
    },
    personalizedModifications: {
      type: Type.ARRAY,
      description: "Personalized adjustments and differentiated instruction strategies for students with specific learning styles or performance notes",
      items: {
        type: Type.OBJECT,
        properties: {
          studentName: { type: Type.STRING },
          learningStyle: { type: Type.STRING },
          originalChallenge: { type: Type.STRING },
          suggestedAccommodation: { type: Type.STRING },
          worksheetDifficultyAdjustment: { type: Type.STRING }
        },
        required: ['studentName', 'learningStyle', 'originalChallenge', 'suggestedAccommodation', 'worksheetDifficultyAdjustment']
      }
    }
  },
  required: ['title', 'grade', 'subject', 'lessonNumber', 'subTopic', 'duration', 'objectives', 'steps', 'worksheets', 'slides', 'evaluation', 'bloomsLevels', 'personalizedModifications']
};

export const generateLessonPlan = async (config: Partial<LessonPlan>, prompt: string, template?: CustomTemplate): Promise<LessonPlan> => {
  const templateInstruction = template 
    ? `\nFollow this custom structure: ${template.structure}. ${template.description}`
    : `\nFollow the standard Cambodian 5-step teaching process.`;

  const lessonDetails = `
  Lesson Number: ${config.lessonNumber || 'N/A'}
  Lesson Title: ${config.title || 'N/A'}
  Sub-topic/Content: ${config.subTopic || 'N/A'}
  `;

  let profilesInstruction = "";
  if (config.studentProfiles && config.studentProfiles.length > 0) {
    profilesInstruction = `
  CRITICAL: PERSONALIZED ADAPTATIONS FOR STUDENT PROFILES (ការកែសម្រួលតាមតម្រូវការសិស្សជាក់ស្តែង)
  - The teacher has provided a roster of student profiles with specific learning styles and performance notes:
  ${config.studentProfiles.map(p => `- សិស្សឈ្មោះ៖ ${p.name} | ស្ទីលរៀន (Learning Style)៖ ${p.learningStyle} | កំណត់សម្គាល់៖ ${p.notes}`).join('\n')}

  - In the "personalizedModifications" array in your JSON output, you MUST map adaptations for EVERY student listed above.
  - For each student profile, provide:
    1. "studentName": Name of the student (exactly as provided above).
    2. "learningStyle": Their learning style or group (exactly as provided above).
    3. "originalChallenge": The specific academic difficulty or challenge they may face with this lesson content.
    4. "suggestedAccommodation": A highly actionable, practical adjustment in your teaching activities or explanations (e.g. providing visual diagrams, peer pairing, extra visual/audio examples, or advanced challenge questions).
    5. "worksheetDifficultyAdjustment": Recommendations for personalizing their worksheet or worksheet tasks (e.g. simplified numbers, extra visual guides, scaffolded step-by-step instructions, or advanced challenge extensions).
  `;
  } else {
    profilesInstruction = `
  CRITICAL: PERSONALIZED ADAPTATIONS & DIFFERENTIATED INSTRUCTION (ការកែសម្រួលតាមតម្រូវការសិស្សជាក់ស្តែង)
  - Although the teacher hasn't input individual student profiles yet, you MUST generate exactly 3 hypothetical student profiles representing typical learners in a Cambodian classroom to showcase this feature (e.g., 1 Slow Learner who struggles with formulas/abstract concepts, 1 Visual/Kinesthetic Learner who needs tactile or diagrammatic aids, and 1 Fast/Advanced Learner who finishes quickly and needs extension tasks).
  - Map out personalized modifications for these 3 typical profiles in the "personalizedModifications" array so the teacher sees clear examples of how to differentiate the lesson and adjust worksheet difficulties.
  `;
  }

  const systemPrompt = `You are a professional Cambodian education expert. Generate a detailed lesson plan in Khmer.
  
  Lesson Context:
  ${lessonDetails}
  Additional Instructions: ${prompt || 'None'}

  METHODOLOGIES & CONTENT SOURCES (សៀវភៅពុម្ព និង សៀវភៅគ្រូ) [CRITICAL]:
  - All lesson plan content, explanation steps, activities, exercises, evaluation rubrics, and answer keys MUST draw patterns, examples, and structures directly from the official MoEYS curriculum, specifically "MoEYS Textbooks" (សៀវភៅសិក្សាគោល/សៀវភៅពុម្ព) and "Teacher Guides/Answer Keys" (សៀវភៅគ្រូ/សៀវភៅកំណែ).
  - This is especially critical for Step 3 (មេរៀនថ្មី - New Lesson: incorporating inquiry key questions, student activities/experiments, expected results, and main rules/formulas/summaries) and Step 4 (ពង្រឹងចំណេះដឹង/ពង្រឹងពុទ្ធិ - Knowledge Reinforcement: providing practical exercises with clear step-by-step rubrics).

  ${profilesInstruction}

  CRITICAL RULES FOR MATHEMATICS AND FORMULAS:
  - All mathematical formulas, equations, calculations, operations, or expressions MUST be written in plain text.
  - NEVER use LaTeX, dollar signs ($ or $$), markdown math notation, or complex formula representations.
  - Use standard readable Unicode mathematical symbols immediately: +, -, ×, ÷, =, √, ², ³.
  - For fractions, use standard slash notation (e.g., 1/2, 3/4) instead of LaTeX fraction commands.
  - This ensures perfect rendering in Word export files (.doc).

  CRITICAL: AUTOMATIC WORKSHEET GENERATION
  - You MUST generate 1 comprehensive worksheet that is DIRECTLY RELATED to the specific lesson content and objectives you just created.
  - The worksheet questions should test the knowledge and skills mentioned in the lesson plan's "មេរៀនថ្មី" (New Lesson) and "ពង្រឹងចំណេះដឹង" (Knowledge Reinforcement) sections.
  - Use a mix of: multiple-choice (4 options), true-false, fill-in-the-blanks (with wordBank), and short-answer.

  CRITICAL: INTEGRATION OF BLOOM'S TAXONOMY COGNITIVE LEVELS
  - The teacher has selected the following cognitive level(s) from Bloom's Taxonomy for this lesson: ${(config.bloomsLevels || []).join(', ')}.
  - You MUST ensure that the lesson plan's learning objectives ("objectives") and activities ("steps") are specifically aligned with these levels:
    - If "Remember" is selected: include objectives and questions targeting recall, defining terms, naming, repeating, or memorizing.
    - If "Understand" is selected: include objectives and activities targeting explaining ideas, describing concepts, translating, identifying, or classifying.
    - If "Apply" is selected: include objectives and steps focused on solving problems, executing, calculating, demonstrating, or implementing in a new context.
    - If "Analyze" is selected: include objectives and activities focused on comparing, contrasting, differentiating, or distinguishing different parts.
    - If "Evaluate" is selected: include objectives and discussions focused on defending a stand, critiquing, justifying a decision, or verifying results.
    - If "Create" is selected: include objectives and steps focused on producing original work, designing, constructing, composing, or formulating.

  CRITICAL: LESSON SELF-EVALUATION (ការស្វ័យវាយតម្លៃមេរៀន)
  - You MUST generate highly realistic, constructive, and professional self-reflection comments for the teacher under "evaluation":
    - "strengths": What are the strengths of this lesson's delivery or structure? (e.g., use of visual materials, student engagement in group work, clarity of explanations). Provide 2-3 specific points in bullet format (•).
    - "weaknesses": What are the likely challenges or weaknesses? (e.g., time management in step 4, some students struggling with specific concepts, some groups working too slowly). Provide 1-2 points in bullet format (•).
    - "improvements": What are the concrete, actionable next-steps or adjustments the teacher can make for future lessons? (e.g., adding supplementary handouts, restructuring group roles, adjusting timing). Provide 1-2 points in bullet format (•).

  Other Details:
  - Grade: ${config.grade}
  - Subject: ${config.subject}
  - Policy: ${config.policy}
  - Method: ${config.method}
  - Strategy: ${config.strategy}
  ${templateInstruction}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: systemPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: lessonPlanSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  const parsed = JSON.parse(text);
  return {
    ...parsed,
    id: Date.now().toString(),
    date: config.date || parsed.date,
    studentCount: config.studentCount || 0,
    groupMemberCount: config.groupMemberCount || 5,
    taughtBy: config.taughtBy || 'គ្រូបង្រៀន',
    templateId: template?.id,
    lessonNumber: config.lessonNumber || parsed.lessonNumber,
    title: config.title || parsed.title,
    subTopic: config.subTopic || parsed.subTopic,
    bloomsLevels: parsed.bloomsLevels || config.bloomsLevels || [],
    studentProfiles: config.studentProfiles || [],
    personalizedModifications: parsed.personalizedModifications || [],
  };
};

export const generateExamAndWorksheet = async (
  lessonText: string,
  subject: string,
  grade: string,
  duration: string,
  author: string,
  phone: string,
  mcqCount: number,
  writtenCount: number
): Promise<string> => {
  const systemPrompt = `# ROLE (តួនាទី)
អ្នកគឺជាគ្រូបង្រៀនកម្រិតបឋមសិក្សានៅកម្ពុជា ដែលមានបទពិសោធន៍ខ្ពស់ និងមានជំនាញគរុកោសល្យច្បាស់លាស់។ តួនាទីរបស់អ្នកគឺជួយបង្កើតផែនការបង្រៀន វិញ្ញាសាសាកល្បង និងសន្លឹកកិច្ចការ ផ្អែកលើអត្ថបទមេរៀនដែល User បានបញ្ចូលមក។

# RULES (ច្បាប់ទម្លាប់តឹងរ៉ឹង)
១. ការសរសេររូបមន្ត ឬលំហាត់គណិតវិទ្យា៖ "សូមសរសេរគណិតវិទ្យាជា អក្សរធម្មតា (Plain Text)។ ហាមប្រើកូដ LaTeX ឬសញ្ញា $ ដាច់ខាត។ រាល់និមិត្តសញ្ញាទាំងអស់ (ដូចជា +, -, ×, ÷, =, √, ²) ត្រូវប្រើជានិមិត្តសញ្ញាអក្សរទូទៅ (Standard Unicode) ដែលអាចមើលឃើញភ្លាមៗ។"
២. ទម្រង់លទ្ធផល (Output Format)៖ រាល់ពេលបញ្ចេញលទ្ធផលវិញ្ញាសា ឬសន្លឹកកិច្ចការ អ្នកត្រូវតែបញ្ចេញលទ្ធផលជាកូដ HTML សុទ្ធ (HTML Code block) ដើម្បីឱ្យមានភាពងាយស្រួលក្នុងការទាញយក និងត្រូវតែភ្ជាប់មកជាមួយនូវប៊ូតុង (Button) សម្រាប់ទាញយកជាឯកសារ Word (.doc)។
៣. ការរក្សាទម្រង់៖ ត្រូវរក្សាទម្រង់តារាង (Table) ចំនួនជួរឈរ (Columns) ជួរដេក (Rows) និងចំណងជើងនៃផ្នែកនីមួយៗឱ្យបាន ១០០% ដូចគំរូខាងក្រោម ហាមកាត់ចោល ឬកែប្រែទម្រង់ដើមដាច់ខាត។

# វិធីសាស្រ្តដំណើរការ (PROCESS)
១. វិភាគមេរៀនដែល User បានផ្ដល់ឱ្យ។
២. បង្កើតសំណួរពហុជ្រើសរើស (Multiple Choice) និងសំណួរសរសេរអធិប្បាយ (Written) រួមទាំងចម្លើយត្រឹមត្រូវ និងការដាក់ពិន្ទុ។
៣. បញ្ចូលខ្លឹមសារទាំងនោះទៅក្នុងទម្រង់ HTML ខាងក្រោម។
  - ត្រូវគណនា និងបំពេញព័ត៌មានលម្អិតសមស្របសម្រាប់កម្រិតបឋមសិក្សានៅកម្ពុជា។
  - ធានាថាចំនួនសំណួរពហុជ្រើសរើសត្រូវស្មើនឹង ${mcqCount} និងសំណួរសរសេរត្រូវស្មើនឹង ${writtenCount} ជាក់លាក់បំផុត!
  - សម្រាប់ប្រភពលំហាត់ (Checkbox) ត្រូវជ្រើសរើសដោយប្តូរ ☐ ទៅជា ☑ ឱ្យបានសមស្រប (ឧទាហរណ៍៖ ☑ សៀវភៅសិក្សាគោល ឬ ☑ សៀវភៅគ្រូ)។
  - សម្រាប់កម្រិតលំបាក (Checkbox) ត្រូវជ្រើសរើសដោយប្តូរ ☐ ទៅជា ☑ ឱ្យបានសមស្រប (ឧទាហរណ៍៖ ☑ ងាយ, ☑ មធ្យម, ឬ ☑ លំបាក)។

# DUAL-VIEW CAPABILITY FOR STUDENTS & TEACHERS (CRITICAL)
- You MUST mark the answers, rubrics, and grading rows as "teacher-only" by adding class="teacher-only" to their respective <tr> elements.
- Specifically, MCQ rows containing "ចម្លើយត្រឹមត្រូវ" and "ការវិភាគជម្រើសចម្លើយ" MUST have class="teacher-only".
- Written question rows containing "អត្រាកំណែ" and "ការដាក់ពិន្ទុ" MUST have class="teacher-only".
- You MUST add class="student-only" to elements intended ONLY for students when they print/view the worksheet.
- Specifically, for each Written Question table, right after the main question row, you MUST insert a student answer row with class="student-only" that has dotted line spaces for students to write their answer. Example:
  <tr class="student-only">
      <td><b>ចម្លើយសិស្ស៖</b></td>
      <td colspan="3" style="height: 120px; vertical-align: top;">
          <div style="border-bottom: 1px dashed #cbd5e1; height: 30px; margin-top: 10px;"></div>
          <div style="border-bottom: 1px dashed #cbd5e1; height: 30px;"></div>
          <div style="border-bottom: 1px dashed #cbd5e1; height: 30px;"></div>
          <div style="border-bottom: 1px dashed #cbd5e1; height: 30px;"></div>
      </td>
  </tr>

# ទម្រង់កូដ HTML សម្រាប់ផលិតវិញ្ញាសា (HTML TEMPLATES TO USE)
<!DOCTYPE html>
<html lang="km">
<head>
<meta charset="UTF-8">
<title>ទម្រង់វិញ្ញាសា និង សន្លឹកកិច្ចការ</title>
<style>
    @media print {
        .no-print { display: none !important; }
    }
    body { font-family: 'Khmer OS Siemreap', 'Khmer OS Battambang', sans-serif; font-size: 14px; margin: 20px; color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; }
    .btn-download { padding: 12px 24px; background-color: #007bff; color: white; border: none; cursor: pointer; font-family: inherit; font-size: 16px; margin-bottom: 20px; border-radius: 5px; font-weight: bold; }
    .btn-download:hover { background-color: #0056b3; }
    .tip-banner { background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-family: inherit; color: #1e3a8a; font-size: 13px; font-weight: bold; line-height: 1.5; }
    
    /* Dual view styling */
    .student-only { display: none; }
    .teacher-only { display: table-row; }
    
    body.student-view .teacher-only { display: none !important; }
    body.student-view .student-only { display: block !important; }
    body.student-view tr.student-only { display: table-row !important; }
    body.student-view td.student-only { display: table-cell !important; }
</style>
</head>
<body>

<div class="tip-banner no-print">✍️ <b>លោកគ្រូអ្នកគ្រូអាចកែសម្រួលផ្ទាល់បាន៖</b> ចុចលើអត្ថបទ ឬតារាងណាមួយនៅក្នុងខ្លឹមសារខាងក្រោមដើម្បីកែសម្រួល ឬសរសេរបន្ថែមបានភ្លាមៗនៅក្នុងកម្មវិធីរុករក (Browser) មុនពេលទាញយកជាឯកសារ Word!</div>

<button class="btn-download no-print" onclick="Export2Word('exam-content', 'វិញ្ញាសា_សន្លឹកកិច្ចការ')">ទាញយកជាឯកសារ Word (Download DOCX)</button>

<div id="exam-content" contenteditable="true" style="outline: none; padding: 10px; border-radius: 8px;">

    <!-- Student Header (Only shown when printing/viewing as student) -->
    <div class="student-only" style="margin-bottom: 30px; border: 2px solid #000000; padding: 18px; border-radius: 8px; background-color: #ffffff;">
        <h2 style="text-align: center; margin-top: 0; color: #000000; border: none; font-size: 16pt; font-family: 'Khmer OS Muol Light', sans-serif;">សន្លឹកកិច្ចការប្រលងរបស់សិស្ស (Student Exam Worksheet)</h2>
        <table style="border: none !important; margin-bottom: 0;">
            <tr style="border: none !important;">
                <td style="border: none !important; width: 50%; padding: 6px; border: none !important;"><b>ឈ្មោះសិស្ស៖</b> .......................................................</td>
                <td style="border: none !important; width: 25%; padding: 6px; border: none !important;"><b>ថ្នាក់ទី៖</b> ${grade}</td>
                <td style="border: none !important; width: 25%; padding: 6px; border: none !important;"><b>កាលបរិច្ឆេទ៖</b> ..................................</td>
            </tr>
            <tr style="border: none !important;">
                <td style="border: none !important; padding: 6px; border: none !important;"><b>សម័យប្រលង៖</b> .......................................................</td>
                <td style="border: none !important; padding: 6px; border: none !important;"><b>លេខតុ៖</b> ...............</td>
                <td style="border: none !important; padding: 6px; border: none !important;"><b>លេខវិញ្ញាសា៖</b> ..................................</td>
            </tr>
        </table>
        <div style="margin-top: 15px; border-top: 1px dashed #000000; padding-top: 12px; display: flex; justify-content: space-between; font-weight: bold; font-size: 11pt;">
            <span>មុខវិជ្ជា៖ ${subject}</span>
            <span>រយៈពេល៖ ${duration}</span>
            <span>ពិន្ទុទទួលបាន៖ ............ / ១០</span>
        </div>
    </div>

    <h2>១. ទម្រង់ប័ណ្ណសំណួរពហុជ្រើសរើស</h2>
    <!-- REPEAT FOR EACH Multiple-Choice Question (Total: ${mcqCount}) -->
    <table>
        <tr>
            <td>លេខកូដលំហាត់</td>
            <td>[បញ្ចូលលេខកូដ]</td>
            <td colspan="4"><b>ប្រភព</b></td>
        </tr>
        <tr>
            <td>មុខវិជ្ជា</td>
            <td>[បញ្ចូលមុខវិជ្ជា]</td>
            <td colspan="4">☐ សៀវភៅសិក្សាគោល</td>
        </tr>
        <tr>
            <td>ថ្នាក់ទី</td>
            <td>[បញ្ចូលថ្នាក់]</td>
            <td colspan="4">☐ សៀវភៅគ្រូ</td>
        </tr>
        <tr>
            <td>សមត្ថភាព មុខវិជ្ជារង</td>
            <td>[បញ្ចូលសមត្ថភាព]</td>
            <td colspan="4">☐ អ្នកនិពន្ធ</td>
        </tr>
        <tr>
            <td>លទ្ធផលសិក្សា</td>
            <td>[បញ្ចូលលទ្ធផលសិក្សា]</td>
            <td colspan="4">☐ ស្ដង់ដាកម្មវិធីសិក្សា</td>
        </tr>
        <tr>
            <td>កម្រិតពុទ្ធិ</td>
            <td>[បញ្ចូលកម្រិតពុទ្ធិ]</td>
            <td colspan="4">កម្រិតលំបាក</td>
        </tr>
        <tr>
            <td>ប្រភេទសំណួរ</td>
            <td>[បញ្ចូលប្រភេទសំណួរ]</td>
            <td colspan="4">☐ ងាយ</td>
        </tr>
        <tr>
            <td>រយៈពេល</td>
            <td>[បញ្ចូលរយៈពេល]</td>
            <td colspan="4">☐ មធ្យម</td>
        </tr>
        <tr>
            <td>ពិន្ទុ</td>
            <td>[បញ្ចូលពិន្ទុ]</td>
            <td colspan="4">☐ លំបាក</td>
        </tr>
        <tr>
            <td colspan="2"><b>សំណួរ៖ [បញ្ចូលសំណួរនៅទីនេះ]</b></td>
            <td>ក. [ជម្រើសក]</td>
            <td>ខ. [ជម្រើសខ]</td>
            <td>គ. [ជម្រើសគ]</td>
            <td>ឃ. [ជម្រើសឃ]</td>
        </tr>
        <tr class="teacher-only">
            <td></td>
            <td colspan="5"><b>ចម្លើយត្រឹមត្រូវ៖ [បញ្ចូលចម្លើយត្រឹមត្រូវ]</b></td>
        </tr>
        <tr class="teacher-only">
            <td><b>ការវិភាគជម្រើសចម្លើយ៖</b></td>
            <td colspan="5">
                ក. [ការវិភាគជម្រើសក]<br>
                ខ. [ការវិភាគជម្រើសខ]<br>
                គ. [ការវិភាគជម្រើសគ]<br>
                ឃ. [ការវិភាគជម្រើសឃ]
            </td>
        </tr>
        <tr class="teacher-only">
            <td colspan="3">ឈ្មោះអ្នកនិពន្ធ៖ ${author}</td>
            <td colspan="3">លេខទូរស័ព្ទ៖ ${phone}</td>
        </tr>
    </table>

    <br>

    <h2>២. ទម្រង់ប័ណ្ណសំណួរសរសេរ</h2>
    <!-- REPEAT FOR EACH Written Question (Total: ${writtenCount}) -->
    <table>
        <tr>
            <td>លេខកូដលំហាត់</td>
            <td>[បញ្ចូលលេខកូដ]</td>
            <td colspan="2"><b>ប្រភព</b></td>
        </tr>
        <tr>
            <td>មុខវិជ្ជា</td>
            <td>[បញ្ចូលមុខវិជ្ជា]</td>
            <td colspan="2">☐ សៀវភៅសិក្សាគោល</td>
        </tr>
        <tr>
            <td>ថ្នាក់ទី</td>
            <td>[បញ្ចូលថ្នាក់]</td>
            <td colspan="2">☐ សៀវភៅគ្រូ</td>
        </tr>
        <tr>
            <td>សមត្ថភាព/មុខវិជ្ជារង</td>
            <td>[បញ្ចូលសមត្ថភាព]</td>
            <td colspan="2">☐ អ្នកនិពន្ធ</td>
        </tr>
        <tr>
            <td>លទ្ធផលសិក្សា</td>
            <td>[បញ្ចូលលទ្ធផលសិក្សា]</td>
            <td colspan="2">☐ ស្ដង់ដាកម្នវិធីសិក្សា</td>
        </tr>
        <tr>
            <td>កម្រិតពុទ្ធិ</td>
            <td>[បញ្ចូលកម្រិតពុទ្ធិ]</td>
            <td colspan="2">កម្រិតលំបាក</td>
        </tr>
        <tr>
            <td>ប្រភេទសំណួរ</td>
            <td>[បញ្ចូលប្រភេទសំណួរ]</td>
            <td colspan="2">☐ ងាយ</td>
        </tr>
        <tr>
            <td>រយៈពេល</td>
            <td>[បញ្ចូលរយៈពេល]</td>
            <td colspan="2">☐ មធ្យម</td>
        </tr>
        <tr>
            <td>ពិន្ទុ</td>
            <td>[បញ្ចូលពិន្ទុ]</td>
            <td colspan="2">☐ លំបាក</td>
        </tr>
        <tr>
            <td colspan="4"><b>សំណួរ៖</b> [បញ្ចូលសំណួរ]</td>
        </tr>
        <tr class="student-only">
            <td><b>ចម្លើយសិស្ស៖</b></td>
            <td colspan="3" style="height: 120px; vertical-align: top;">
                <div style="border-bottom: 1px dashed #cbd5e1; height: 30px; margin-top: 10px;"></div>
                <div style="border-bottom: 1px dashed #cbd5e1; height: 30px;"></div>
                <div style="border-bottom: 1px dashed #cbd5e1; height: 30px;"></div>
                <div style="border-bottom: 1px dashed #cbd5e1; height: 30px;"></div>
            </td>
        </tr>
        <tr class="teacher-only">
            <td><b>អត្រាកំណែ</b></td>
            <td colspan="3"><b>គោលបំណងនៃសំណួរ៖</b> [បញ្ចូលគោលបំណងនៃសំណួរ]</td>
        </tr>
        <tr class="teacher-only">
            <td></td>
            <td><b>ការដាក់ពិន្ទុ៖</b></td>
            <td colspan="2"><b>កូដពិន្ទុ១៖</b> [បញ្ចូលលក្ខខណ្ឌកូដពិន្ទុ១]</td>
        </tr>
        <tr class="teacher-only">
            <td></td>
            <td></td>
            <td colspan="2"><b>កូដពិន្ទុ០៖</b> [បញ្ចូលលក្ខខណ្ឌកូដពិន្ទុ០]</td>
        </tr>
        <tr class="teacher-only">
            <td colspan="2">ឈ្មោះអ្នកនិពន្ធ៖ ${author}</td>
            <td colspan="2">លេខទូរស័ព្ទ៖ ${phone}</td>
       You must output ONLY the filled HTML code, starting with <!DOCTYPE html> and ending with </html>.


    <br>

    <h2>៣. សន្លឹកកិច្ចការ</h2>
    <p>[បញ្ចូលចំណុចសំខាន់នៃមេរៀន]</p>
    <b>សំណួរគន្លឹះ៖</b>
    <ul>
        <li>[បញ្ចូលសំណួរ]</li>
    </ul>
    <b>សម្មតិកម្ម៖</b>
    <p>.......................................................................................................................................</p>
    <b>តេស្តសម្មតិកម្ម៖</b>
    <p>.......................................................................................................................................</p>
    <b>លទ្ធផល៖</b>
    <p>.......................................................................................................................................</p>
    <b>សន្និដ្ឋាន៖</b>
    <p>.......................................................................................................................................</p>

</div>

<script>
function Export2Word(element, filename = ''){
    var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
                  "<head><meta charset='utf-8'><title>Export HTML To Doc</title>" +
                  "<style>" +
                  "  @page Section1 { size: 21.0cm 29.7cm; margin: 1.0in 1.0in 1.0in 1.0in; mso-header-margin: 0.5in; mso-footer-margin: 0.5in; mso-paper-source: 0; }" +
                  "  div.Section1 { page: Section1; }" +
                  "  body { font-family: 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Arial Unicode MS', sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b; mso-line-height-rule: exactly; }" +
                  "  table { width: 100% !important; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; mso-table-lspace: 0pt; mso-table-rspace: 0pt; table-layout: auto; }" +
                  "  td, th { border: 1px solid black; padding: 8px; vertical-align: top; mso-border-alt: solid black 1.0pt; word-break: break-word; }" +
                  "  th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; text-align: center; }" +
                  "  h2 { font-family: 'Khmer OS Muol Light', 'Khmer OS Siemreap', sans-serif; font-size: 13pt; font-weight: bold; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-top: 25px; margin-bottom: 15px; }" +
                  "  h3 { font-family: 'Khmer OS Siemreap', sans-serif; font-size: 11pt; font-weight: bold; color: #1e3a8a; margin-top: 15px; margin-bottom: 10px; }" +
                  "  .text-center { text-align: center !important; }" +
                  "  .font-bold { font-weight: bold !important; }" +
                  "</style></head><body><div class='Section1'>";
    var postHtml = "</div></body></html>";
    
    // Clean up contenteditable and no-print classes before saving to preserve clean formatting in Word
    var originalEl = document.getElementById(element);
    var clone = originalEl.cloneNode(true) as HTMLElement;
    clone.removeAttribute('contenteditable');
    clone.removeAttribute('style');
    
    var allEditable = clone.querySelectorAll('[contenteditable]');
    for(var i = 0; i < allEditable.length; i++) {
        allEditable[i].removeAttribute('contenteditable');
    }

    // Determine view mode based on iframe body class at export time
    var isStudent = document.body.classList.contains('student-view');
    if (isStudent) {
        // Remove teacher-only rows/blocks
        var teachers = clone.querySelectorAll('.teacher-only');
        for(var i = 0; i < teachers.length; i++) {
            teachers[i].remove();
        }
        // Style student-only blocks for Word compatibility
        var students = clone.querySelectorAll('.student-only');
        for(var i = 0; i < students.length; i++) {
            (students[i] as HTMLElement).style.display = 'block';
            if (students[i].tagName === 'TR') {
                (students[i] as HTMLElement).style.display = 'table-row';
            }
        }
    } else {
        // Remove student-only rows/blocks
        var students = clone.querySelectorAll('.student-only');
        for(var i = 0; i < students.length; i++) {
            students[i].remove();
        }
        // Ensure teacher-only blocks are displayed
        var teachers = clone.querySelectorAll('.teacher-only');
        for(var i = 0; i < teachers.length; i++) {
            (teachers[i] as HTMLElement).style.display = 'block';
            if (teachers[i].tagName === 'TR') {
                (teachers[i] as HTMLElement).style.display = 'table-row';
            }
        }
    }
    
    var noPrint = clone.querySelectorAll('.no-print');
    for(var i = 0; i < noPrint.length; i++) {
        noPrint[i].remove();
    }
    
    var html = preHtml + clone.innerHTML + postHtml;
    var blob = new Blob(['\\ufeff', html], { type: 'application/msword;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    
    var finalFilename = filename ? filename + (isStudent ? '_សន្លឹកកិច្ចការសិស្ស' : '_វិញ្ញាសាគ្រូ') : 'វិញ្ញាសា_សន្លឹកកិច្ចការ';
    finalFilename += '.doc';
    
    var downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    
    downloadLink.href = url;
    downloadLink.download = finalFilename;
    downloadLink.click();
    
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}
</script>
</body>
</html>

USER INPUT SPECIFICS:
- Lesson Text: ${lessonText}
- Subject: ${subject}
- Grade: ${grade}
- Duration: ${duration}
- Author: ${author}
- Phone Number: ${phone}
- Number of Multiple Choice Questions to generate: ${mcqCount}
- Number of Written Exercises/Questions to generate: ${writtenCount}

You must output ONLY the filled HTML code, starting with <!DOCTYPE html> and ending with </html>.
Avoid extra text or chat prefixes. Use a markdown code block starting with \`\`\`html and ending with \`\`\`.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: systemPrompt,
  });

  let html = response.text || '';
  if (html.includes('```html')) {
    html = html.split('```html')[1].split('```')[0];
  } else if (html.includes('```')) {
    html = html.split('```')[1].split('```')[0];
  }
  return html.trim();
};

export const generateLessonPlanHtml = async (
  newLessonTitle: string,
  grade: string,
  oldLessonContent: string,
  subject: string,
  duration: string,
  author: string,
  date: string
): Promise<string> => {
  const systemPrompt = `អ្នកគឺជាគ្រូបង្រៀនដ៏ឆ្នើម និងជាអ្នកជំនាញគរុកោសល្យកម្រិតបឋមសិក្សានៅប្រទេសកម្ពុជា។ តួនាទីរបស់អ្នកគឺជួយបង្កើត «កិច្ចតែងការបង្រៀន» (Lesson Plan) ដ៏ល្អឥតខ្ចោះ និងមានវិជ្ជាជីវៈខ្ពស់ ផ្អែកលើព័ត៌មានដែល User បានផ្ដល់ឱ្យ។

# Methodologies & Content Sources
1. គោលវិធីបង្រៀន (IBL)៖ អ្នកត្រូវសរសេរកិច្ចតែងការបង្រៀនដោយប្រើប្រាស់គោលវិធី «បង្រៀននិងរៀនតាមបែបរិះរក (Inquiry-Based Learning - IBL)»។ ពិសេសក្នុងជំហានទី៣ ត្រូវមានរចនាសម្ព័ន្ធ៖ សំណួរគន្លឹះ -> សកម្មភាព/ពិសោធន៍ -> លទ្ធផល -> វិធាន/សេចក្ដីសន្និដ្ឋាន។
2. ខ្លឹមសារមេរៀន និងអត្រាកំណែ៖ រាល់ខ្លឹមសារ លំហាត់ និងចម្លើយ ត្រូវតែដកស្រង់ ឬរៀបចំឡើងដោយទាញយកលំនាំពី «សៀវភៅពុម្ព» (MoEYS Textbooks) និង «សៀវភៅកំណែ» (Teacher Guides/Answer Keys) កម្រិតបឋមសិក្សារបស់ក្រសួងអប់រំ យុវជន និងកីឡា ដើម្បីដាក់បញ្ចូលក្នុងជំហានទី៣ (មេរៀនថ្មី) និងជំហានទី៤ (ពង្រឹងពុទ្ធិ/ការវាយតម្លៃលំហាត់ និងអត្រាកំណែការដាក់ពិន្ទុ) ឱ្យបានត្រឹមត្រូវ ១០០%។

# Rules & Constraints
1. ទម្រង់លទ្ធផល (Output Format)៖ អ្នកត្រូវបញ្ចេញលទ្ធផលជាកូដ HTML ទាំងស្រុង (ដោយប្រើ HTML, CSS, និង JavaScript) ដែលមើលទៅឃើញជាទម្រង់កិច្ចតែងការបង្រៀនផ្លូវការ ១០០%។ ត្រូវមានប៊ូតុង "Download ជា Word" នៅផ្នែកខាងលើនៃឯកសារ។
2. ទម្រង់គណិតវិទ្យា (Math Formatting Strict Rule)៖ សូមសរសេរគណិតវិទ្យាជា អក្សរធម្មតា (Plain Text) ទាំងអស់។ ហាមប្រើកូដ LaTeX ឬសញ្ញា $ ដាច់ខាត។ រាល់និមិត្តសញ្ញាទាំងអស់ (ដូចជា +, -, ×, ÷, =, √, ²) ត្រូវប្រើជានិមិត្តសញ្ញាអក្សរទូទៅ (Standard Unicode) ដែលអាចមើលឃើញភ្លាមៗ។
3. រក្សាទម្រង់ (Strict Layout)៖ តារាងដំណើរការបង្រៀនត្រូវតែមាន ៣ ជួរឈរ (សកម្មភាពគ្រូ, ខ្លឹមសារមេរៀន, សកម្មភាពសិស្ស) និងបែងចែកជា ៥ ជំហានឱ្យបានច្បាស់លាស់ តាមទម្រង់គំរូ។ ជំហានទី២ ត្រូវមានរំលឹកមេរៀនចាស់ និងការផ្សារភ្ជាប់យ៉ាងរលូន។

# HTML Template Structure 
អ្នកត្រូវតែបង្កើតកូដ HTML តាមទម្រង់ខាងក្រោមនេះជានិច្ច ជាមួយនឹងទិន្នន័យដែលបានបង្កើតរួច៖

<!DOCTYPE html>
<html lang="km">
<head>
<meta charset="UTF-8">
<title>កិច្ចតែងការបង្រៀន</title>
<style>
    @media print {
        .no-print { display: none !important; }
    }
    body { font-family: 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Arial Unicode MS', sans-serif; line-height: 1.6; color: #000; padding: 20px; }
    .btn-download { background-color: #0056b3; color: white; padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px; font-family: 'Khmer OS Siemreap', sans-serif; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .btn-download:hover { background-color: #004494; }
    .tip-banner { background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-family: inherit; color: #1e3a8a; font-size: 13px; font-weight: bold; line-height: 1.5; }
    .document-container { max-width: 1000px; margin: 0 auto; background: #fff; padding: 40px; border: 1px solid #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h2, h3, h4 { font-family: 'Khmer OS Muol Light', serif; text-align: center; margin-bottom: 20px;}
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
    th { font-family: 'Khmer OS Muol Light', serif; text-align: center; background-color: #f2f2f2;}
    .step-title { font-family: 'Khmer OS Muol Light', serif; color: red; text-align: center; text-decoration: underline; margin-bottom: 10px; font-weight: bold;}
    .content-title { color: blue; font-family: 'Khmer OS Muol Light', serif; font-weight: bold;}
    .header-info { display: grid; grid-template-columns: 280px auto; gap: 5px; margin-bottom: 20px;}
    .section-title { font-family: 'Khmer OS Muol Light', serif; margin-top: 20px; font-size: 16px; font-weight: bold;}
    .footer-sign { display: flex; justify-content: space-between; margin-top: 60px; text-align: center;}
</style>
</head>
<body>

<div class="tip-banner no-print">✍️ <b>លោកគ្រូអ្នកគ្រូអាចកែសម្រួលផ្ទាល់បាន៖</b> ចុចលើអត្ថបទ ឬតារាងណាមួយនៅក្នុងខ្លឹមសារខាងក្រោមដើម្បីកែសម្រួល ឬសរសេរបន្ថែមបានភ្លាមៗនៅក្នុងកម្មវិធីរុករក (Browser) មុនពេលទាញយកជាឯកសារ Word!</div>

<button class="btn-download no-print" onclick="Export2Word('lesson-plan', 'កិច្ចតែងការបង្រៀន')">📥 ទាញយកកិច្ចតែងការជា Word (Download DOCX)</button>

<div id="lesson-plan" class="document-container" contenteditable="true" style="outline: none; padding: 10px; border-radius: 8px;">
    <h2>កិច្ចតែងការបង្រៀន (Lesson Plan)</h2>
    <div class="header-info">
        <div><strong>កាលបរិច្ឆេទ (Date)</strong></div><div>: \${date}</div>
        <div><strong>មុខវិជ្ជា (Subject)</strong></div><div>: \${subject}</div>
        <div><strong>ថ្នាក់ទី (Grade)</strong></div><div>: \${grade}</div>
        <div><strong>ជំពូកទី (Chapter)</strong></div><div>: [បំពេញដោយគិតគូរលម្អិតតាមកម្រងសៀវភៅពុម្ពក្រសួង]</div>
        <div><strong>មេរៀនទី (Unit)</strong></div><div>: [បំពេញដោយគិតគូរលម្អិតតាមកម្រងសៀវភៅពុម្ពក្រសួង]</div>
        <div><strong>ខ្លឹមសារ Content/Topic</strong></div><div>: \${newLessonTitle}</div>
        <div><strong>រយៈពេល (Duration)</strong></div><div>: \${duration}</div>
        <div><strong>បង្រៀនដោយ Taught by</strong></div><div>: \${author}</div>
        <div><strong>គោលវិធី Methodology</strong></div><div>: បង្រៀននិងរៀនតាមបែបរិះរក (Inquiry-Based Learning)</div>
    </div>

    <div class="section-title">I. វត្ថុបំណងមេរៀន (Aim of Lesson)</div>
    <div style="padding-left: 20px;">
        <p><strong>- វិជ្ជាសម្បទា (Knowledge) :</strong> [បំពេញដោយផ្អែកលើមេរៀនថ្មី៖ សិស្សប្រាប់ពី...] តាមរយៈសំណួរគន្លឹះ និងការសង្កេតបានត្រឹមត្រូវ។</p>
        <p><strong>- បំណិនសម្បទា (Skills) :</strong> [បំពេញដោយផ្អែកលើមេរៀនថ្មី៖ សិស្សគណនា/អនុវត្ត...] បានត្រឹមត្រូវនិងរហ័ស តាមរយៈការងារជាបុគ្គល និងការងារក្រុម។</p>
        <p><strong>- ចរិយាសម្បទា (Attitude) :</strong> សិស្សមានភាពប្រុងប្រយ័ត្ន និងយកចិត្តទុកដាក់ខ្ពស់ក្នុងការយកចំណេះដឹងទៅប្រើប្រាស់ក្នុងជីវភាពរស់នៅ។</p>
    </div>

    <div class="section-title">II. សម្ភារឧបទេស (Teaching Materials)</div>
    <div style="padding-left: 20px;">
        <p><strong>- ចំពោះគ្រូ (For the teacher) :</strong> សៀវភៅពុម្ព កិច្ចតែងការបង្រៀន ប៊ិកហ្វឹត [និងសម្ភារពាក់ព័ន្ធនឹងសកម្មភាពពិសោធន៍ឬមេរៀនជាក់ស្តែង]</p>
        <p><strong>- ចំពោះសិស្ស (For the students) :</strong> សៀវភៅពុម្ព ប៊ិក បន្ទាត់ ក្ដារឈ្នួន [និងសម្ភារពាក់ព័ន្ធនឹងសកម្មភាពពិសោធន៍ឬមេរៀនជាក់ស្តែង]</p>
    </div>

    <div class="section-title">III. ដំណើរការបង្រៀន និងរៀន (Teaching and Learning Process)</div>
    <table>
        <thead>
            <tr>
                <th width="30%">សកម្មភាពគ្រូ<br>(Teacher’s Activities)</th>
                <th width="40%">ខ្លឹមសារមេរៀន<br>(Lesson Content)</th>
                <th width="30%">សកម្មភាពសិស្ស<br>(Students’ Activities)</th>
            </tr>
        </thead>
        <tbody>
            <!-- ជំហានទី ១ -->
            <tr>
                <td>
                    - តើថ្ងៃនេះមានសិស្សអវត្តមានប៉ុន្មាននាក់?<br>
                    - តើកូនៗបានសម្អាតថ្នាក់រៀនហើយឬនៅ?<br>
                    - ពង្រឹងវិន័យ ដោយឱ្យសិស្សអង្គុយមានសណ្តាប់ធ្នាប់ល្អ។
                </td>
                <td>
                    <div class="step-title">ជំហានទី ១ (៣ នាទី)<br>រដ្ឋបាលថ្នាក់</div>
                    - វត្តមានសិស្ស<br>
                    - អនាម័យថ្នាក់រៀន (Classroom hygiene/cleanliness)<br>
                    - ពង្រឹងវិន័យ និងសណ្ដាប់ធ្នាប់ (Strengthen discipline)
                </td>
                <td>
                    - ប្រធានថ្នាក់រាយការណ៍ជូនគ្រូ<br>
                    - បាទ/ចាស សម្អាតរួចរាល់<br>
                    - អង្គុយយ៉ាងស្ងៀមស្ងាត់ ដាក់ដៃលើតុ
                </td>
            </tr>
            
            <!-- ជំហានទី ២ -->
            <tr>
                <td>
                    - សូមកូនៗដូរសៀវភៅកិច្ចការផ្ទះជាមួយមិត្តភក្ដិ ដើម្បីកែចម្លើយ<br><br>
                    - [សួរសំណួរទាក់ទងនឹងមេរៀនចាស់៖ \${oldLessonContent}]
                </td>
                <td>
                    <div class="step-title">ជំហានទី ២ (៧ នាទី)</div>
                    <span class="content-title">- កែកិច្ចការចាស់ (Correct old assignments)</span><br>
                    [ដាក់ចម្លើយកិច្ចការចាស់ជា Plain text math ដោយផ្អែកតាមសៀវភៅកំណែ]<br><br>
                    
                    <span class="content-title">- រំលឹកមេរៀនចាស់ (Review old lesson)</span><br>
                    [បង្ហាញខ្លឹមសារ ឬលំហាត់រំលឹកមេរៀនចាស់ពី៖ \${oldLessonContent} ដោយប្រើ Plain Text Math]<br><br>
                    
                    <span class="content-title">- ទំនាក់ទំនងមេរៀនថ្មី (Connect to new lesson)</span><br>
                    [បង្កើតចំណោទបញ្ហា ឬសំណួរទាក់ទាញចូលមេរៀនថ្មី៖ \${newLessonTitle}]
                </td>
                <td>
                    - ដូរសៀវភៅជាមួយមិត្ត និងផ្ទៀងផ្ទាត់ចម្លើយ<br><br>
                    - ឆ្លើយតបសំណួរគ្រូ និងកត់ត្រា
                </td>
            </tr>

            <!-- ជំហានទី ៣ -->
            <tr>
                <td>
                    - គ្រូសរសេរចំណងជើងមេរៀនដាក់លើក្ដារខៀន<br><br>
                    - គ្រូដាក់សំណួរគន្លឹះឱ្យសិស្សអាន និងគិតជាដៃគូ<br><br>
                    - គ្រូដើរសម្របសម្រួល និងតាមដានសកម្មភាពសិស្សពេលកំពុងពិសោធន៍/ពិភាក្សា<br><br>
                    - គ្រូសំយោគចម្លើយជាមួយសិស្ស និងពន្យល់បន្ថែម<br><br>
                    - គ្រូណែនាំសិស្សឱ្យកត់សេចក្ដីសន្និដ្ឋានចូលសៀវភៅមេរៀន
                </td>
                <td>
                    <div class="step-title">ជំហានទី ៣ (២០ នាទី)<br>មេរៀនថ្មី</div>
                    <div style="text-align:center; color:blue; font-weight:bold; font-size:16px;">\${newLessonTitle}</div><br>
                    
                    <span class="content-title">- សំណួរគន្លឹះ៖</span><br>
                    [បង្កើតសំណួរគន្លឹះទាក់ទងនឹងមេរៀនថ្មី ដើម្បីរិះរក]<br><br>
                    
                    <span class="content-title">- សកម្មភាព/ពិសោធន៍៖</span><br>
                    [ដាក់សកម្មភាពឱ្យសិស្សធ្វើ ឬដោះស្រាយ ដោយយកលំនាំតាមសៀវភៅពុម្ព។ ប្រើ Plain Text Math ហាមប្រើ LaTeX]<br><br>
                    
                    <span class="content-title">- លទ្ធផល៖</span><br>
                    [បង្ហាញដំណោះស្រាយ ឬចម្លើយដែលរកឃើញ ដោយផ្អែកលើសៀវភៅកំណែ]<br><br>
                    
                    <span class="content-title">- វិធាន/សេចក្ដីសន្និដ្ឋាន៖</span><br>
                    <strong>ច្បាប់៖</strong> [សរសេរច្បាប់ ឬសេចក្តីសន្និដ្ឋាននៃមេរៀន]
                </td>
                <td>
                    - កត់ចំណងជើងចូលសៀវភៅ<br><br>
                    - អានសំណួរគន្លឹះ និងគិតពិចារណា<br><br>
                    - ពិភាក្សាជាក្រុម ឬជាដៃគូ និងសាកល្បងដោះស្រាយបញ្ហា<br><br>
                    - ឡើងរាយការណ៍ចម្លើយ និងចូលរួមសំយោគ<br><br>
                    - កត់វិធាន និងសេចក្ដីសន្និដ្ឋានចូលសៀវភៅ
                </td>
            </tr>

            <!-- ជំហានទី ៤ -->
            <tr>
                <td>
                    - គ្រូដាក់លំហាត់លើក្ដារខៀនដកស្រង់ពីសៀវភៅពុម្ព<br>
                    - ហៅសិស្ស ២ ទៅ ៣នាក់ ឡើងធ្វើលំហាត់ដើម្បីវាយតម្លៃការយល់ដឹង
                </td>
                <td>
                    <div class="step-title">ជំហានទី ៤ (១៥ នាទី)<br>(ពង្រឹងពុទ្ធិ)</div>
                    [ដាក់លំហាត់អនុវត្តន៍ ២ ទៅ ៣ សម្រាប់សាកល្បងការយល់ដឹងរបស់សិស្ស យកចេញពីសៀវភៅពុម្ព រៀបចំជា Plain Text]
                </td>
                <td>
                    - ឡើងធ្វើលំហាត់លើក្ដារខៀន<br>
                    - សិស្សដទៃទៀតធ្វើក្នុងក្ដារឈ្នួន ឬសៀវភៅព្រាង
                </td>
            </tr>

            <!-- ជំហានទី ៥ -->
            <tr>
                <td>
                    - គ្រូដាក់កិច្ចការផ្ទះលើក្តារខៀន<br>
                    - ណែនាំសិស្សឱ្យយកមេរៀនទៅអនុវត្ត និងខិតខំរៀនសូត្រនៅផ្ទះ
                </td>
                <td>
                    <div class="step-title">ជំហានទី ៥ (៥ នាទី)<br>បណ្ដាំផ្ញើ</div>
                    <span class="content-title">- កិច្ចការផ្ទះ៖</span><br>
                    [ដាក់លំហាត់កិច្ចការផ្ទះ]<br><br>
                    <span class="content-title">- បណ្ដាំផ្ញើ៖</span><br>
                    សូមកូនៗត្រឡប់ទៅផ្ទះវិញ ខិតខំរៀនសូត្រ មើលមេរៀនបន្ត និងជួយធ្វើការងារផ្ទះឪពុកម្ដាយ។
                </td>
                <td>
                    - កត់ត្រាកិច្ចការផ្ទះចូលសៀវភៅ<br>
                    - បាទ/ចាស ស្តាប់ដោយយកចិត្តទុកដាក់ និងអនុវត្តតាម
                </td>
            </tr>
        </tbody>
    </table>

    <div class="footer-sign">
        <div>
            ថ្ងៃ……………..ទី……… ខែ……….. ឆ្នាំ២០២…<br>
            <strong>គ្រូបន្ទុកថ្នាក់</strong>
        </div>
        <div>
            <strong>បានឃើញ និងឯកភាព</strong><br>
            <strong>នាយកសាលា</strong>
        </div>
    </div>
</div>

<script>
function Export2Word(element, filename = ''){
    var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
                  "<head><meta charset='utf-8'><title>កិច្ចតែងការបង្រៀន</title>" +
                  "<style>" +
                  "  @page Section1 { size: 21.0cm 29.7cm; margin: 1.0in 1.0in 1.0in 1.0in; mso-header-margin: 0.5in; mso-footer-margin: 0.5in; mso-paper-source: 0; }" +
                  "  div.Section1 { page: Section1; }" +
                  "  body { font-family: 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Arial Unicode MS', sans-serif; font-size: 11pt; line-height: 1.6; color: #000000; mso-line-height-rule: exactly; }" +
                  "  table { width: 100% !important; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; mso-table-lspace: 0pt; mso-table-rspace: 0pt; table-layout: auto; }" +
                  "  td, th { border: 1px solid #000000; padding: 8px; vertical-align: top; mso-border-alt: solid #000000 1.0pt; word-break: break-word; }" +
                  "  th { background-color: #f2f2f2; color: #000000; font-weight: bold; text-align: center; }" +
                  "  .step-title { font-family: 'Khmer OS Muol Light', serif; color: red; text-align: center; text-decoration: underline; font-weight: bold; }" +
                  "  .content-title { color: blue; font-family: 'Khmer OS Muol Light', serif; font-weight: bold; }" +
                  "  h2 { font-family: 'Khmer OS Muol Light', serif; font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 20px; }" +
                  "  .header-info { display: table; width: 100%; margin-bottom: 20px; }" +
                  "  .footer-sign { display: table; width: 100%; margin-top: 60px; }" +
                  "</style></head><body><div class='Section1'>";
    var postHtml = "</div></body></html>";
    
    var originalEl = document.getElementById(element);
    var clone = originalEl.cloneNode(true);
    clone.removeAttribute('contenteditable');
    clone.removeAttribute('style');
    
    var allEditable = clone.querySelectorAll('[contenteditable]');
    for(var i = 0; i < allEditable.length; i++) {
        allEditable[i].removeAttribute('contenteditable');
    }
    
    var noPrint = clone.querySelectorAll('.no-print');
    for(var i = 0; i < noPrint.length; i++) {
        noPrint[i].remove();
    }
    
    var html = preHtml + clone.innerHTML + postHtml;
    var blob = new Blob(['\\ufeff', html], { type: 'application/msword;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    
    filename = filename ? filename + '.doc' : 'document.doc';
    var downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.click();
    
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}
</script>
</body>
</html>

USER INPUT SPECIFICS:
- New Lesson Title: ${newLessonTitle}
- Grade: ${grade}
- Old Lesson Content: ${oldLessonContent}
- Subject: ${subject}
- Duration: ${duration}
- Author: ${author}
- Date: ${date}

You must output ONLY the fully flesh-out valid HTML code matching the template structure exactly.
Do not add conversational prefixes or explanations. Use a markdown code block starting with \`\`\`html and ending with \`\`\`.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: systemPrompt,
  });

  let html = response.text || '';
  if (html.includes('```html')) {
    html = html.split('```html')[1].split('```')[0];
  } else if (html.includes('```')) {
    html = html.split('```')[1].split('```')[0];
  }
  return html.trim();
};

export const suggestLessonTopics = async (subject: string, grade: string): Promise<{ lessonNumber: string, title: string, subTopic: string }> => {
  const systemPrompt = `You are an expert Cambodian primary school educator. Suggest a highly realistic, specific, and accurate lesson topic in Khmer that aligns perfectly with the official Ministry of Education (MoEYS) curriculum for:
  - Subject: ${subject}
  - Grade: ${grade}

  Output a single JSON object with the following structure:
  {
    "lessonNumber": "e.g., មេរៀនទី ៣",
    "title": "e.g., វិធីបូកលេខមានត្រួត ៥ខ្ទង់",
    "subTopic": "e.g., ការគណនាលំហាត់បូកលេខ ៥ខ្ទង់ដោយមានត្រួត ដើម្បីឱ្យសិស្សយល់ច្បាស់ពីការបូកក្នុងជីវភាពជាក់ស្ដែង..."
  }

  Output ONLY the raw JSON block without markdown formatting or conversational text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: systemPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lessonNumber: { type: Type.STRING },
          title: { type: Type.STRING },
          subTopic: { type: Type.STRING }
        },
        required: ['lessonNumber', 'title', 'subTopic']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No suggestion returned from Gemini");
  return JSON.parse(text);
};
