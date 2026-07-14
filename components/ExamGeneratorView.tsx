import React, { useState, useEffect } from 'react';
import { generateExamAndWorksheet } from '../services/geminiService';
import { LessonPlan } from '../types';

interface ExamGeneratorViewProps {
  currentPlan?: LessonPlan;
  config?: Partial<LessonPlan>;
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

export const ExamGeneratorView: React.FC<ExamGeneratorViewProps> = ({ currentPlan, config }) => {
  const [lessonText, setLessonText] = useState('');
  const [subject, setSubject] = useState('គណិតវិទ្យា');
  const [grade, setGrade] = useState('៤');
  const [duration, setDuration] = useState('៤០ នាទី');
  const [author, setAuthor] = useState('លោកគ្រូ អ្នកគ្រូ');
  const [phone, setPhone] = useState('012 345 678');
  const [mcqCount, setMcqCount] = useState<number>(3);
  const [writtenCount, setWrittenCount] = useState<number>(2);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'code'>('preview');
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('teacher');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Context Sync States
  const [autoSync, setAutoSync] = useState(true);
  const [syncSource, setSyncSource] = useState<'generated' | 'settings'>('generated');

  const getSyncedLessonText = (source: 'generated' | 'settings') => {
    if (source === 'generated' && currentPlan) {
      const textParts = [];
      if (currentPlan.title) textParts.push(`មេរៀន៖ ${currentPlan.title}`);
      if (currentPlan.subTopic) textParts.push(`ខ្លឹមសារ៖ ${currentPlan.subTopic}`);
      if (currentPlan.objectives) {
        textParts.push(`គោលបំណង៖\n- វិជ្ជាសម្បទា៖ ${currentPlan.objectives.knowledge}\n- បំណិនសម្បទា៖ ${currentPlan.objectives.skills}\n- ចរិយាសម្បទា៖ ${currentPlan.objectives.attitude}`);
      }
      if (currentPlan.steps && currentPlan.steps.length > 0) {
        textParts.push('សកម្មភាពបង្រៀនសំខាន់ៗ៖');
        currentPlan.steps.forEach(step => {
          textParts.push(`ជំហាន៖ ${step.title}\n- សកម្មភាពគ្រូ៖ ${step.teacherActivity?.join(', ')}\n- ខ្លឹមសារមេរៀន៖ ${step.content?.join(', ')}`);
        });
      }
      return textParts.join('\n\n');
    } else if (source === 'settings' && config) {
      const textParts = [];
      if (config.title) textParts.push(`មេរៀន៖ ${config.title}`);
      if (config.subTopic) textParts.push(`ខ្លឹមសារ៖ ${config.subTopic}`);
      return textParts.join('\n\n');
    }
    return '';
  };

  const handleManualSync = (source: 'generated' | 'settings') => {
    setSyncSource(source);
    
    if (source === 'generated' && currentPlan) {
      setSubject(currentPlan.subject || 'គណិតវិទ្យា');
      setGrade(currentPlan.grade || '៤');
      setDuration(currentPlan.duration || '៤០ នាទី');
      setAuthor(currentPlan.taughtBy || 'លោកគ្រូ អ្នកគ្រូ');
      const text = getSyncedLessonText('generated');
      if (text) setLessonText(text);
    } else if (source === 'settings' && config) {
      setSubject(config.subject || 'គណិតវិទ្យា');
      setGrade(config.grade || '៤');
      setDuration(config.duration || '៤០ នាទី');
      setAuthor(config.taughtBy || 'លោកគ្រូ អ្នកគ្រូ');
      const text = getSyncedLessonText('settings');
      if (text) setLessonText(text);
    }
  };

  const getIframeSrcDoc = () => {
    if (!generatedHtml) return '';
    if (viewMode === 'student') {
      return generatedHtml
        .replace('<body', '<body class="student-view"')
        .replace('</head>', '<style>.teacher-only { display: none !important; } .student-only { display: block !important; } tr.student-only { display: table-row !important; } td.student-only { display: table-cell !important; }</style></head>');
    } else {
      return generatedHtml
        .replace('<body', '<body class="teacher-view"')
        .replace('</head>', '<style>.student-only { display: none !important; } .teacher-only { display: inherit !important; } tr.teacher-only { display: table-row !important; }</style></head>');
    }
  };

  // Sync with current plan details automatically if autoSync is active
  useEffect(() => {
    if (!autoSync) return;

    if (syncSource === 'generated' && currentPlan) {
      setSubject(currentPlan.subject || 'គណិតវិទ្យា');
      setGrade(currentPlan.grade || '៤');
      setDuration(currentPlan.duration || '៤០ នាទី');
      setAuthor(currentPlan.taughtBy || 'លោកគ្រូ អ្នកគ្រូ');
      const text = getSyncedLessonText('generated');
      if (text) setLessonText(text);
    } else if (syncSource === 'settings' && config) {
      setSubject(config.subject || 'គណិតវិទ្យា');
      setGrade(config.grade || '៤');
      setDuration(config.duration || '៤០ នាទី');
      setAuthor(config.taughtBy || 'លោកគ្រូ អ្នកគ្រូ');
      const text = getSyncedLessonText('settings');
      if (text) setLessonText(text);
    }
  }, [currentPlan, config, autoSync, syncSource]);

  const handleGenerateExam = async () => {
    if (!lessonText.trim()) {
      setError('សូមបញ្ចូលអត្ថបទមេរៀន ឬខ្លឹមសារសម្រាប់ចេញវិញ្ញាសាជាមុនសិន!');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedHtml('');

    try {
      const resultHtml = await generateExamAndWorksheet(
        lessonText,
        subject,
        grade,
        duration,
        author,
        phone,
        mcqCount,
        writtenCount
      );
      setGeneratedHtml(resultHtml);
      setActiveSubTab('preview');
    } catch (err) {
      console.error(err);
      setError('ការបង្កើតវិញ្ញាសាបរាជ័យ។ សូមព្យាយាមម្តងទៀត។');
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
    setLessonText(`មេរៀនទី២៖ វិធីបូកនិងវិធីដកចំនួនមានតួអក្សរ
ខ្លឹមសារ៖ ការដោះស្រាយលំហាត់បូក និងដកចំនួន ៥ខ្ទង់ គ្មានត្រួត និងមានត្រួត។
ឧទាហរណ៍៖
១. ២៥ ៣៤០ + ១២ ៤១៥ = ៣៧ ៧៥៥
២. ៤៨ ៥០០ - ២៣ ១០០ = ២៥ ៤០០
៣. សិស្សត្រូវចេះរកចំនួនដែលបាត់ក្នុងប្រអប់៖ [ ] + ១២ ០០០ = ៣០ ០០០ នាំឱ្យ [ ] = ៣០ ០០០ - ១២ ០០០ = ១៨ ០០០។
គោលបំណង៖
- សិស្សចេះគណនាវិធីបូកនិងវិធីដកចំនួន ៥ខ្ទង់ បានត្រឹមត្រូវ។
- សិស្សចេះស្វែងរកតម្លៃតួមិនស្គាល់ក្នុងវិធីបូកនិងដក។`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 max-w-7xl mx-auto mb-10 text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-5 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-blue-900 khmer-title flex items-center gap-2">
            <svg className="w-8 h-8 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            វិញ្ញាសាសាកល្បង និងសន្លឹកកិច្ចការគំរូ
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            វិភាគខ្លឹមសារមេរៀនដើម្បីបង្កើតវិញ្ញាសាពហុជ្រើសរើស វិញ្ញាសាសរសេរ និងសន្លឹកកិច្ចការស្ដង់ដា ១០០%
          </p>
        </div>
        <button
          onClick={handleUseSampleText}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold border border-gray-200 transition-all"
        >
          ប្រើប្រាស់អត្ថបទគំរូ (Use Sample)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Context Sync Panel */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200/60 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-blue-900 text-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${autoSync ? 'bg-green-400' : 'bg-amber-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${autoSync ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                </span>
                សមកាលកម្មបរិបទ (Context Sync)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-bold">ស្វ័យប្រវត្ត (Auto)</span>
                <button
                  type="button"
                  onClick={() => setAutoSync(!autoSync)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoSync ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoSync ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
              ផ្ទេរទិន្នន័យចំណងជើង និងខ្លឹមសារដែលបង្កើតរួចដោយស្វ័យប្រវត្តពីផ្ទាំង "កិច្ចតែងការ" ដើម្បីកុំឱ្យលោកគ្រូអ្នកគ្រូវាយបញ្ចូលដដែលៗ។
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleManualSync('generated')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 ${
                  syncSource === 'generated'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-gray-750 border-gray-200'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                </svg>
                កិច្ចតែងការ AI (Generated)
              </button>
              <button
                type="button"
                onClick={() => handleManualSync('settings')}
                className={`flex-1 py-2 px-3 rounded-xl border font-bold text-[10px] transition-all flex items-center justify-center gap-1.5 ${
                  syncSource === 'settings'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-gray-750 border-gray-200'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                ការកំណត់ចំហៀង (Sidebar)
              </button>
            </div>

            {/* Sync Summary info */}
            <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100/50 flex flex-col gap-1.5 text-[10px] font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>ប្រភពសមកាលកម្ម៖</span>
                <span className="font-bold text-blue-700">
                  {syncSource === 'generated' ? 'កិច្ចតែងការដែលបានបង្កើតរួច' : 'ទិន្នន័យក្នុងការកំណត់ចំហៀង'}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span>មេរៀនបច្ចុប្បន្ន៖</span>
                <span className="font-bold text-gray-800 truncate max-w-[150px]" title={syncSource === 'generated' ? (currentPlan?.title || 'មិនទាន់មាន') : (config?.title || 'មិនទាន់មាន')}>
                  {syncSource === 'generated' ? (currentPlan?.title || 'មិនទាន់មាន') : (config?.title || 'មិនទាន់មាន')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>ស្ថានភាពទិន្នន័យ៖</span>
                {syncSource === 'generated' && !currentPlan?.title ? (
                  <span className="text-amber-600 font-bold">គ្មានទិន្នន័យ (សូមបង្កើតកិច្ចតែងការមុន)</span>
                ) : syncSource === 'settings' && !config?.title ? (
                  <span className="text-amber-600 font-bold">គ្មានទិន្នន័យ (សូមបំពេញចំណងជើងមុន)</span>
                ) : (
                  <span className="text-green-600 font-bold">បានតភ្ជាប់ និងធ្វើបច្ចុប្បន្នភាព</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-gray-700 text-base border-b border-gray-200 pb-2">ព័ត៌មានវិញ្ញាសា</h3>
            
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
                <label className="block text-xs font-black text-gray-600 mb-1">ឈ្មោះអ្នកនិពន្ធ</label>
                <input 
                  type="text" 
                  value={author} 
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-600 mb-1">លេខទូរស័ព្ទ</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="border-t border-gray-200/60 pt-3 mt-3">
              <label className="block text-xs font-black text-gray-700 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                កំណត់ចំនួនសំណួរ/លំហាត់ (Set Question Count)
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-black text-gray-500 mb-1.5 block">សំណួរពហុជ្រើសរើស (MCQ)</span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMcqCount(prev => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center border border-slate-200/60 transition-all select-none"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-slate-800">{mcqCount}</span>
                    <button
                      type="button"
                      onClick={() => setMcqCount(prev => Math.min(10, prev + 1))}
                      className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-center border border-blue-200/50 transition-all select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-black text-gray-500 mb-1.5 block">សំណួរសរសេរ (Written)</span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setWrittenCount(prev => Math.max(0, prev - 1))}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center border border-slate-200/60 transition-all select-none"
                    >
                      -
                    </button>
                    <span className="text-sm font-black text-slate-800">{writtenCount}</span>
                    <button
                      type="button"
                      onClick={() => setWrittenCount(prev => Math.min(10, prev + 1))}
                      className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold flex items-center justify-center border border-pink-200/50 transition-all select-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-2 text-center">លោកគ្រូអ្នកគ្រូអាចកំណត់ចំនួនសំណួរបានរហូតដល់ ១០ សំណួរក្នុងមួយផ្នែក</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 flex items-center justify-between">
              <span>អត្ថបទមេរៀន ឬខ្លឹមសារសម្រាប់ចេញវិញ្ញាសា</span>
              {currentPlan && (
                <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                  ភ្ជាប់ជាមួយកិច្ចតែងការសកម្ម
                </span>
              )}
            </label>
            <textarea
              value={lessonText}
              onChange={(e) => setLessonText(e.target.value)}
              placeholder="សូមបញ្ចូលខ្លឹមសារលម្អិត ឬចម្លងអត្ថបទមេរៀនពីសៀវភៅសិក្សាគោល ដើម្បីឱ្យ AI វិភាគចេញសំណួរពហុជ្រើសរើស សំណួរសរសេរ និងសន្លឹកកិច្ចការ..."
              className="w-full h-80 p-4 border border-gray-300 rounded-xl outline-none focus:border-blue-500 text-sm leading-relaxed resize-none shadow-inner"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-bold border border-red-200">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerateExam}
            disabled={isGenerating}
            className={`w-full py-3 px-6 rounded-xl font-black text-white bg-blue-700 hover:bg-blue-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                <span>កំពុងវិភាគ និងបង្កើតវិញ្ញាសា...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
                <span>បង្កើតវិញ្ញាសា និងសន្លឹកកិច្ចការ</span>
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
                    មើលលទ្ធផល (Preview)
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
              <div className="flex-grow overflow-auto p-4 bg-slate-100 flex flex-col gap-3">
                {activeSubTab === 'preview' && (
                  <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      ជម្រើសបង្ហាញ៖
                    </span>
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/60 w-full sm:w-auto">
                      <button
                        onClick={() => setViewMode('teacher')}
                        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[11px] font-black transition-all flex items-center justify-center gap-1.5 ${viewMode === 'teacher' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        វិញ្ញាសាពេញលេញ + អត្រាកំណែ (គ្រូ)
                      </button>
                      <button
                        onClick={() => setViewMode('student')}
                        className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-[11px] font-black transition-all flex items-center justify-center gap-1.5 ${viewMode === 'student' ? 'bg-pink-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        សន្លឹកកិច្ចការប្រលង (សិស្ស)
                      </button>
                    </div>
                  </div>
                )}

                {activeSubTab === 'preview' ? (
                  <div className="w-full h-full bg-white rounded-xl shadow border border-gray-200 overflow-hidden flex-grow">
                    <iframe
                      title="HTML Preview"
                      srcDoc={getIframeSrcDoc()}
                      className="w-full h-full border-none"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-xl overflow-auto select-all leading-relaxed border border-slate-950 flex-grow">
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
                  <h4 className="font-bold text-gray-700 text-base">កំពុងវិភាគគរុកោសល្យខ្មែរ...</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    ប្រព័ន្ធបញ្ញាសិប្បនិម្មិតកំពុងបង្កើតប័ណ្ណសំណួរពហុជ្រើសរើស សំណួរសរសេរ និងសន្លឹកកិច្ចការស្ដង់ដាស្របតាមមេរៀន និងច្បាប់គណិតវិទ្យា Plain Text...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-12">
                  <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h0a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="font-black text-gray-700 text-base khmer-title">មិនទាន់មានវិញ្ញាសានៅឡើយទេ</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    សូមបញ្ចូលខ្លឹមសារមេរៀននៅផ្នែកខាងឆ្វេង រួចចុចប៊ូតុង <b>"បង្កើតវិញ្ញាសា និងសន្លឹកកិច្ចការ"</b> ដើម្បីទទួលបានលទ្ធផលជាទម្រង់ HTML សុទ្ធ។
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

export default ExamGeneratorView;
