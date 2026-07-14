import React, { useState, useEffect } from 'react';
import { generateLessonPlanHtml } from '../services/geminiService';
import { LessonPlan } from '../types';

interface LessonPlanHtmlViewProps {
  currentPlan?: LessonPlan;
}

const SUBJECTS = [
  'ភាសាខ្មែរ', 
  'គណិតវិទ្យា', 
  'វិទ្យាសាស្ត្រ', 
  'សិក្សាសង្គម', 
  'រូបវិទ្យា', 
  'គីមីវិទ្យា', 
  'ជីវវិទ្យា', 
  'ផែនដីវិទ្យា', 
  'ប្រវត្តិវិទ្យា', 
  'ភូមិវិទ្យា', 
  'សីលធម៌-ពលរដ្ឋ',
  'ភាសាអង់គ្លេស'
];

const GRADES = ['១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩', '១០', '១១', '១២'];

export const LessonPlanHtmlView: React.FC<LessonPlanHtmlViewProps> = ({ currentPlan }) => {
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [oldLessonContent, setOldLessonContent] = useState('');
  const [subject, setSubject] = useState('គណិតវិទ្យា');
  const [grade, setGrade] = useState('៤');
  const [duration, setDuration] = useState('៤០ នាទី');
  const [author, setAuthor] = useState('លោកគ្រូ អ្នកគ្រូ');
  const [date, setDate] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with current plan details if available
  useEffect(() => {
    if (currentPlan) {
      setSubject(currentPlan.subject || 'គណិតវិទ្យា');
      setGrade(currentPlan.grade || '៤');
      setDuration(currentPlan.duration || '៤០ នាទី');
      setAuthor(currentPlan.taughtBy || 'លោកគ្រូ អ្នកគ្រូ');
      setDate(currentPlan.date || new Date().toLocaleDateString('km-KH'));
      setNewLessonTitle(currentPlan.title || '');
      setOldLessonContent(currentPlan.subTopic || '');
    } else {
      setDate(new Date().toLocaleDateString('km-KH'));
    }
  }, [currentPlan]);

  const handleGeneratePlan = async () => {
    if (!newLessonTitle.trim()) {
      setError('សូមបញ្ចូលចំណងជើងមេរៀនថ្មីជាមុនសិន!');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedHtml('');

    try {
      const oldLessonToSubmit = oldLessonContent.trim() || "ស្វ័យប្រវត្តិ (សូមបង្កើតខ្លឹមសារមេរៀនចាស់គំរូដែលទាក់ទងនឹងមេរៀនថ្មី និងកម្រិតថ្នាក់របស់សិស្ស ដើម្បីយកមកប្រើសម្រាប់រំលឹកមេរៀនចាស់ក្នុងជំហានទី២)";
      const resultHtml = await generateLessonPlanHtml(
        newLessonTitle,
        grade,
        oldLessonToSubmit,
        subject,
        duration,
        author,
        date
      );
      setGeneratedHtml(resultHtml);
      setActiveSubTab('preview');
    } catch (err) {
      console.error(err);
      setError('ការបង្កើតកិច្ចតែងការ IBL (HTML) បរាជ័យ។ សូមព្យាយាមម្តងទៀត។');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedHtml) return;
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseSampleText = () => {
    setSubject('គណិតវិទ្យា');
    setGrade('៤');
    setDuration('៤០ នាទី');
    setDate(new Date().toLocaleDateString('km-KH'));
    setNewLessonTitle('មេរៀនទី២៖ វិធីបូកនិងវិធីដកចំនួនមានតួអក្សរ (វិធីបូកលេខ ៥ខ្ទង់)');
    setOldLessonContent('វិធីបូកលេខ ៤ខ្ទង់ គ្មានត្រួត និងមានត្រួត ឧទាហរណ៍៖ ២៥៣០ + ១២៤០ = ៣៧៧០');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 max-w-7xl mx-auto mb-10 text-gray-800 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-blue-900 khmer-title flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            កិច្ចតែងការបង្រៀន IBL (HTML & Word)
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            បង្កើតកិច្ចតែងការបង្រៀនគំរូតាមបែប Inquiry-Based Learning (IBL) កម្រិតបឋមសិក្សា ១០០% ស្របតាមក្រសួងអប់រំ
          </p>
        </div>
        <button
          onClick={handleUseSampleText}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold border border-gray-200 transition-all"
        >
          ប្រើប្រាស់ទិន្នន័យគំរូ (Use Sample)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-gray-700 text-base border-b border-gray-200 pb-2">ព័ត៌មានកិច្ចតែងការ</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">មុខវិជ្ជា</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">ថ្នាក់ទី</label>
                <select 
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">រយៈពេល</label>
                <input 
                  type="text" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="ឧ៖ ៤០ នាទី"
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-600 mb-1">កាលបរិច្ឆេទ</label>
                <input 
                  type="text" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-600 mb-1">ឈ្មោះអ្នកនិពន្ធ / គ្រូបង្រៀន</label>
              <input 
                type="text" 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-1.5">
                ចំណងជើងមេរៀនថ្មី (New Lesson Title)
              </label>
              <input
                type="text"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="ឧ៖ មេរៀនទី២៖ វិធីបូកនិងវិធីដកចំនួនមានតួអក្សរ"
                className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 text-sm shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-700 mb-1.5 flex justify-between items-center">
                <span>ខ្លឹមសារមេរៀនចាស់ (សម្រាប់រំលឹកក្នុងជំហានទី២)</span>
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">មិនបង្ខំ (Optional)</span>
              </label>
              <textarea
                value={oldLessonContent}
                onChange={(e) => setOldLessonContent(e.target.value)}
                placeholder="ឧ៖ ការគណនាលំហាត់បូក និងដកចំនួន ៥ខ្ទង់ គ្មានត្រួត... (បើទទេ ប្រព័ន្ធនឹងស្វែងរកមេរៀនមុនដែលសមស្របឱ្យដោយស្វ័យប្រវត្តិ)"
                className="w-full h-28 p-3 border border-gray-300 rounded-xl outline-none focus:border-blue-500 text-sm leading-relaxed resize-none shadow-inner"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-bold border border-red-200">
              {error}
            </div>
          )}

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className={`w-full py-3 px-6 rounded-xl font-black text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                <span>កំពុងបង្កើតកិច្ចតែងការ IBL...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>បង្កើតកិច្ចតែងការ IBL (HTML)</span>
              </>
            )}
          </button>
        </div>

        {/* Preview / Output panel */}
        <div className="lg:col-span-7 flex flex-col h-[700px] border border-gray-200 rounded-2xl bg-slate-50 overflow-hidden shadow-inner">
          {generatedHtml ? (
            <>
              {/* Header inside Preview Box */}
              <div className="bg-white border-b border-gray-200 px-5 py-3 flex justify-between items-center shrink-0">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setActiveSubTab('preview')}
                    className={`px-4 py-1.5 rounded-md text-xs font-black transition-all ${activeSubTab === 'preview' ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    មើលកិច្ចតែងការ (Preview)
                  </button>
                  <button
                    onClick={() => setActiveSubTab('code')}
                    className={`px-4 py-1.5 rounded-md text-xs font-black transition-all ${activeSubTab === 'code' ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    កូដ HTML
                  </button>
                </div>

                {activeSubTab === 'code' ? (
                  <button
                    onClick={copyToClipboard}
                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-blue-200 transition-all"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>បានចម្លង!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>ចម្លងកូដ HTML</span>
                      </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-bold italic">
                    អ្នកអាចចុចប៊ូតុងខាងក្រោមដើម្បីទាញយក Word ភ្លាមៗ
                  </span>
                )}
              </div>

              {/* Content area */}
              <div className="flex-grow overflow-auto p-4 bg-slate-100">
                {activeSubTab === 'preview' ? (
                  <div className="w-full h-full bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <iframe
                      title="Lesson Plan HTML Preview"
                      srcDoc={generatedHtml}
                      className="w-full h-full border-none"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl overflow-auto select-all leading-relaxed border border-slate-950">
                    <pre className="whitespace-pre-wrap">{generatedHtml}</pre>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="m-auto text-center max-w-sm px-6">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-blue-700 animate-spin"></div>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-700 text-base">កំពុងបង្កើតកិច្ចតែងការបែប IBL...</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    ប្រព័ន្ធបញ្ញាសិប្បនិម្មិតកំពុងរៀបចំសកម្មភាពគ្រូ-សិស្ស សំណួរគន្លឹះ ពិសោធន៍ វិធាន និងលំហាត់អនុវត្តន៍ជាទម្រង់ HTML សុទ្ធ...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-12">
                  <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="font-black text-gray-700 text-base khmer-title">មិនទាន់មានកិច្ចតែងការនៅឡើយទេ</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    សូមបញ្ចូលចំណងជើងមេរៀនថ្មី និងខ្លឹមសារមេរៀនចាស់នៅផ្នែកខាងឆ្វេង រួចចុចប៊ូតុង <b>"បង្កើតកិច្ចតែងការ IBL (HTML)"</b> ដើម្បីទទួលបានកិច្ចតែងការបង្រៀនពេញលេញ។
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlanHtmlView;
