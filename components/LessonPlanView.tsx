
import React from 'react';
import { LessonPlan } from '../types';
import { exportElementToWord } from '../utils/wordExport';
import { BLOOMS_TAXONOMY_LEVELS } from '../constants';

interface LessonPlanViewProps {
  plan: LessonPlan;
}

const LessonPlanView: React.FC<LessonPlanViewProps> = ({ plan }) => {
  // Helper to format date to Khmer long format
  const formatKhmerDate = (dateStr: string) => {
    if (!dateStr) return 'ថ្ងៃទី.... ខែ.... ឆ្នាំ....';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; 

      const khmerMonths = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សិហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
      ];

      const day = date.getDate();
      const month = khmerMonths[date.getMonth()];
      const year = date.getFullYear();

      return `ថ្ងៃទី ${day} ខែ ${month} ឆ្នាំ ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto mb-10">
      {/* Edit Hint and Word Export Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 no-print bg-blue-50 border border-blue-200 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl animate-pulse">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm">✍️ លោកគ្រូអ្នកគ្រូអាចកែសម្រួលផ្ទាល់បាន!</h4>
            <p className="text-xs text-blue-700 font-medium">ចុចលើអត្ថបទ ឬតារាងណាមួយនៅក្នុងក្រដាសខាងក្រោមដើម្បីកែសម្រួល ឬសរសេរបន្ថែមបានភ្លាមៗ</p>
          </div>
        </div>
        <button
          onClick={() => exportElementToWord('lesson-plan-content', `កិច្ចតែងការ_${plan.title || 'មេរៀន'}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center gap-2 border border-blue-700 cursor-pointer text-sm shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          ទាញយកជាឯកសារ Word (Download DOCX)
        </button>
      </div>

      <div 
        id="lesson-plan-content" 
        contentEditable={true}
        suppressContentEditableWarning={true}
        className="bg-white p-12 shadow-2xl print-area border border-gray-200 text-gray-900 leading-relaxed font-['Kantumruy_Pro'] min-h-[297mm] outline-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl transition-all"
      >
        {/* Decorative Header */}
        <div className="border-4 border-blue-900 rounded-3xl p-8 mb-10 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-8">
            <h1 className="text-4xl font-black text-blue-900 khmer-title tracking-widest uppercase">កិច្ចតែងការបង្រៀន</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12 text-xl mt-4">
            <div className="flex border-b border-gray-100 pb-1">
              <span className="w-48 font-bold text-blue-800">មុខវិជ្ជា</span>
              <span className="font-medium">: {plan.subject}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
              <span className="w-48 font-bold text-blue-800">មេរៀនទី</span>
              <span className="font-medium">: {plan.lessonNumber}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
              <span className="w-48 font-bold text-blue-800">ចំណងជើង</span>
              <span className="font-medium">: {plan.title}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
              <span className="w-48 font-bold text-blue-800">គោលវិធី</span>
              <span className="font-medium">: {plan.policy}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
              <span className="w-48 font-bold text-blue-800">វិធីសាស្ត្របង្រៀន</span>
              <span className="font-medium">: {plan.method}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
              <span className="w-48 font-bold text-blue-800">រយៈពេល</span>
              <span className="font-medium">: {plan.duration}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
              <span className="w-48 font-bold text-blue-800">បង្រៀនថ្នាក់ទី</span>
              <span className="font-medium">: {plan.grade}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1">
              <span className="w-48 font-bold text-blue-800">កាលបរិច្ឆេទបង្រៀន</span>
              <span className="font-medium">: {plan.date}</span>
            </div>
            <div className="flex border-b border-gray-100 pb-1 md:col-span-2">
              <span className="w-48 font-bold text-blue-800">បង្រៀនដោយ</span>
              <span className="font-medium">: {plan.taughtBy}</span>
            </div>
          </div>
        </div>

        <div className="space-y-8 text-lg">
          <section>
            <h2 className="font-black text-2xl mb-4 text-blue-900 border-l-8 border-blue-900 pl-4 bg-blue-50 py-2">I. វត្ថុបំណង (Objectives)</h2>
            {plan.bloomsLevels && plan.bloomsLevels.length > 0 && (
              <div className="pl-6 mb-4 flex flex-wrap gap-2 items-center">
                <span className="font-bold text-sm text-blue-800 bg-blue-100/50 px-3 py-1 rounded-lg">🎯 គោលដៅពុទ្ធិ Bloom (Bloom's Cognitive Levels) ៖</span>
                {plan.bloomsLevels.map(level => {
                  const levelObj = BLOOMS_TAXONOMY_LEVELS.find(l => l.id === level);
                  return (
                    <span key={level} className="text-xs bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full font-black border border-amber-200 shadow-sm">
                      {levelObj ? levelObj.khmer : level}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="pl-6 space-y-3">
              <p className="flex gap-2"><span className="font-bold min-w-[150px] text-blue-800">+ វិជ្ជាសម្បទា ៖</span> <span>{plan.objectives.knowledge}</span></p>
              <p className="flex gap-2"><span className="font-bold min-w-[150px] text-blue-800">+ បំណិនសម្បទា ៖</span> <span>{plan.objectives.skills}</span></p>
              <p className="flex gap-2"><span className="font-bold min-w-[150px] text-blue-800">+ ចរិយាសម្បទា ៖</span> <span>{plan.objectives.attitude}</span></p>
            </div>
          </section>

          <section>
            <h2 className="font-black text-2xl mb-4 text-blue-900 border-l-8 border-blue-900 pl-4 bg-blue-50 py-2">II. ខ្លឹមសារមេរៀន</h2>
            <div className="pl-6 bg-gray-50 p-4 rounded-xl">
              <p className="text-xl font-medium">{plan.subTopic}</p>
            </div>
          </section>

          <section>
            <h2 className="font-black text-2xl mb-4 text-blue-900 border-l-8 border-blue-900 pl-4 bg-blue-50 py-2">III. សម្ភារៈឧបទេស</h2>
            <div className="pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm">
                <h3 className="font-bold text-blue-800 mb-2 underline">សម្រាប់គ្រូ</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {plan.materialsTeacher.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
              <div className="bg-white border border-blue-100 p-4 rounded-xl shadow-sm">
                <h3 className="font-bold text-blue-800 mb-2 underline">សម្រាប់សិស្ស</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {plan.materialsStudent.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="break-inside-auto">
            <h2 className="font-black text-2xl mb-6 text-blue-900 border-l-8 border-blue-900 pl-4 bg-blue-50 py-2">IV. ដំណើរការបង្រៀន</h2>
            
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="border border-black p-4 w-[30%]">សកម្មភាពគ្រូ</th>
                  <th className="border border-black p-4 w-[40%]">ខ្លឹមសារមេរៀន</th>
                  <th className="border border-black p-4 w-[30%]">សកម្មភាពសិស្ស</th>
                </tr>
              </thead>
              <tbody>
                {plan.steps.map((step) => (
                  <React.Fragment key={step.stepNumber}>
                    <tr className="bg-yellow-50 font-black">
                      <td colSpan={3} className="border border-black p-4 text-center">
                        <div className="text-lg">ជំហានទី {step.stepNumber} : {step.title}</div>
                        {step.duration && <div className="text-sm font-normal text-gray-600 italic">(រយៈពេល {step.duration})</div>}
                      </td>
                    </tr>
                    <tr className="align-top">
                      <td className="border border-black p-4 bg-white">
                        <ul className="list-disc pl-5 space-y-2">
                          {step.teacherActivity.map((act, i) => <li key={i}>{act}</li>)}
                        </ul>
                      </td>
                      <td className="border border-black p-4 bg-gray-50/30">
                        <ul className="list-disc pl-5 space-y-2 font-medium">
                          {step.content.map((con, i) => <li key={i}>{con}</li>)}
                        </ul>
                      </td>
                      <td className="border border-black p-4 bg-white">
                        <ul className="list-disc pl-5 space-y-2">
                          {step.studentActivity.map((act, i) => <li key={i}>{act}</li>)}
                        </ul>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </section>

          {/* V. Self-Evaluation (ការស្វ័យវាយតម្លៃ) Section */}
          <section className="break-inside-avoid mt-12">
            <h2 className="font-black text-2xl mb-4 text-blue-900 border-l-8 border-blue-900 pl-4 bg-blue-50 py-2">V. ការស្វ័យវាយតម្លៃ (Self-Evaluation)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-4">
              <div className="bg-emerald-50/40 border border-emerald-200 p-5 rounded-2xl">
                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2 text-base">
                  <span className="text-lg">🌟</span> ចំណុចខ្លាំង (Strengths)
                </h3>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-medium min-h-[100px] outline-none">
                  {plan.evaluation?.strengths || '• សិស្សយល់ដឹង និងចូលរួមសកម្មភាពដោយរីករាយ\n• វិធីសាស្ត្របង្រៀនសមស្របតាមខ្លឹមសារ'}
                </div>
              </div>
              <div className="bg-rose-50/40 border border-rose-200 p-5 rounded-2xl">
                <h3 className="font-bold text-rose-900 mb-2 flex items-center gap-2 text-base">
                  <span className="text-lg">⚠️</span> ចំណុចខ្សោយ (Weaknesses)
                </h3>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-medium min-h-[100px] outline-none">
                  {plan.evaluation?.weaknesses || '• សិស្សមួយចំនួនតូចនៅយឺតក្នុងការងារក្រុម\n• ការគ្រប់គ្រងពេលវេលាលើជំហានទី៤ នៅខ្វះចន្លោះ'}
                </div>
              </div>
              <div className="bg-sky-50/40 border border-sky-200 p-5 rounded-2xl">
                <h3 className="font-bold text-sky-900 mb-2 flex items-center gap-2 text-base">
                  <span className="text-lg">⚙️</span> វិធានការកែលម្អ (Improvements)
                </h3>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line font-medium min-h-[100px] outline-none">
                  {plan.evaluation?.improvements || '• បង្កើនការយកចិត្តទុកដាក់លើសិស្សខ្សោយក្នុងក្រុម\n• បង្រួញការពន្យល់ទ្រឹស្ដី ដើម្បីទុកពេលសិស្សអនុវត្តលំហាត់'}
                </div>
              </div>
            </div>
          </section>

          {plan.personalizedModifications && plan.personalizedModifications.length > 0 && (
            <section className="break-inside-avoid mt-12">
              <h2 className="font-black text-2xl mb-4 text-blue-900 border-l-8 border-blue-900 pl-4 bg-blue-50 py-2">VI. ការសម្របសម្រួលតាមតម្រូវការសិស្ស និងកម្រិតលំបាក (Personalized Adaptations)</h2>
              <p className="text-sm text-gray-500 italic mb-4 pl-4">
                ការកែសម្រួលសកម្មភាព និងការកែសម្រួលកម្រិតលំបាកសន្លឹកកិច្ចការ ដើម្បីគាំទ្រដល់ស្ទីលរៀន និងល្បឿនសិក្សាផ្សេងគ្នារបស់សិស្ស៖
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4">
                {plan.personalizedModifications.map((mod, idx) => (
                  <div key={idx} className="bg-amber-50/20 border border-amber-200/50 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-blue-950 text-base">👦 {mod.studentName}</span>
                        <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
                          {mod.learningStyle}
                        </span>
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <p className="text-gray-700">
                          <span className="font-bold text-blue-900">🔍 បញ្ហាប្រឈម៖</span> {mod.originalChallenge}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-bold text-emerald-800">💡 វិធីសម្របសម្រួល៖</span> {mod.suggestedAccommodation}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-dashed border-amber-200/50 text-xs text-gray-700">
                      <span className="font-bold text-indigo-800">📝 កម្រិតលំបាកសន្លឹកកិច្ចការ៖</span> {mod.worksheetDifficultyAdjustment}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-24 flex justify-between items-start px-8 break-inside-avoid">
            <div className="text-center min-w-[200px]">
              <p className="font-bold mb-16 text-blue-900">បានឃើញ និងឯកភាព<br/>នាយកសាលា</p>
              <div className="border-t border-gray-400 w-full mt-10"></div>
            </div>
            <div className="text-center min-w-[200px]">
              <p className="italic text-sm mb-2 text-gray-500">ចុងកោះជ្រូក, {formatKhmerDate(plan.date)}</p>
              <p className="font-bold mb-16 text-blue-900">ឈ្មោះ និង ហត្ថលេខាគ្រូ</p>
              <p className="font-black text-xl">{plan.taughtBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanView;
