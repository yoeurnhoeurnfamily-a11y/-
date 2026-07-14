
import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_LESSON_PLAN, BLOOMS_TAXONOMY_LEVELS } from './constants';
import { LessonPlan, CustomTemplate, StudentGroup, GroupMember, StudentProfile } from './types';
import LessonPlanView from './components/LessonPlanView';
import WorksheetView from './components/WorksheetView';
import PresentationView from './components/PresentationView';
import GroupsView from './components/GroupsView';
import ExamGeneratorView from './components/ExamGeneratorView';
import LessonPlanHtmlView from './components/LessonPlanHtmlView';
import { generateLessonPlan, suggestLessonTopics } from './services/geminiService';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const GRADES = ['១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩', '១០', '១១', '១២'];
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

const POLICIES = [
  'គ្រូមជ្ឈមណ្ឌល',
  'សិស្សមជ្ឈមណ្ឌល'
];

const METHODS_21ST = [
  'វិធីសាស្ត្រស្វែងរក (Inquiry-Based Learning - IBL)',
  'វិធីសាស្ត្រដោះស្រាយបញ្ហា (Problem-Based Learning - PBL)',
  'វិធីសាស្ត្របង្រៀនតាមគម្រោង (Project-Based Learning)',
  'វិធីសាស្ត្របង្រៀនតាមហ្គេម (Game-Based Learning)',
  'វិធីសាស្ត្របង្រៀនបែបសហការ (Collaborative Learning)',
  'វិធីសាស្ត្រត្រិះរិះពិចារណា (Critical Thinking)'
];

const STRATEGIES_21ST = [
  'ការគិតជាបុគ្គល និងការងារក្រុម',
  'គិត-គូ-ចែករំលែក (Think-Pair-Share)',
  'ផែនទីគំនិត (Mind Mapping)',
  'ការប្រើប្រាស់បច្ចេកវិទ្យa (ICT Integration)',
  'ការពិភាក្សាតុមូល (Roundtable Discussion)',
  'ការធ្វើពិសោធន៍ជាក់ស្តែង',
  'ស្ទីលបង្រៀនតាមតម្រូវការសិស្ស (Differentiated Instruction)'
];

const ROLE_LEADER = 'ប្រធានក្រុម';
const ROLE_RECORDER = 'កត់ត្រា';
const ROLE_PRESENTER = 'បទបង្ហាញ';
const ROLE_SEEKER = 'រកចម្លើយ';

const TAB_ICONS: Record<string, React.ReactNode> = {
  plan: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
    </svg>
  ),
  planHtml: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  worksheets: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  slides: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8m-4-4v4M3 4h18M4 4h16v12H4V4z" />
    </svg>
  ),
  groups: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  exams: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
};

const App: React.FC = () => {
  // Persistence Keys
  const APP_STORAGE_KEY = 'khmer_lesson_plan_app_state_v2';

  // Load initial state from local storage or defaults
  const getInitialState = () => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved state", e);
      }
    }
    return null;
  };

  const savedState = getInitialState();

  const [lessonPlan, setLessonPlan] = useState<LessonPlan>(savedState?.lessonPlan || INITIAL_LESSON_PLAN);
  const [prompt, setPrompt] = useState(savedState?.prompt || '');
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>(() => {
    if (savedState?.studentProfiles) {
      return savedState.studentProfiles;
    }
    return [
      { id: '1', name: 'សុខ ជា', learningStyle: 'សិស្សរៀនយឺត (Slow Learner)', notes: 'ពិបាកគណនាលេខខ្ទង់ធំ ត្រូវការល្បែងជំនួយ ឬរូបភាពលម្អិត' },
      { id: '2', name: 'ចាន់ ស្រីនាថ', learningStyle: 'សិស្សឆ្នើម (Fast Learner)', notes: 'រៀនយល់រហ័ស ត្រូវការលំហាត់ពិបាកៗបង្កើនការគិត ឬសរសេរពន្យល់' },
      { id: '3', name: 'កុសល បុត្រា', learningStyle: 'គំហើញ (Visual Learner)', notes: 'រៀនពូកែតាមរយៈតារាង គំនូសបំព្រួញ ឬរូបភាពបង្ហាញសកម្មភាព' }
    ];
  });
  const [studentInput, setStudentInput] = useState(() => {
    if (savedState?.studentInput !== undefined) {
      return savedState.studentInput;
    }
    return 'សុខ ជា\nចាន់ ស្រីនាថ\nកុសល បុត្រា';
  });
  const [config, setConfig] = useState<Partial<LessonPlan>>(savedState?.config || {
    grade: '៤',
    subject: 'គណិតវិទ្យា',
    policy: POLICIES[1],
    method: METHODS_21ST[0],
    strategy: STRATEGIES_21ST[0],
    studentCount: 3,
    groupMemberCount: 5,
    taughtBy: 'លោកគ្រូ អ្នកគ្រូ',
    lessonNumber: 'មេរៀនទី ១',
    title: '',
    subTopic: '',
    duration: '៤០ នាទី',
    date: new Date().toISOString().split('T')[0],
    bloomsLevels: ['Remember', 'Understand', 'Apply']
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestTopic = async () => {
    setIsSuggesting(true);
    setError(null);
    try {
      const result = await suggestLessonTopics(config.subject || 'គណិតវិទ្យា', config.grade || '៤');
      setConfig(prev => ({
        ...prev,
        lessonNumber: result.lessonNumber,
        title: result.title,
        subTopic: result.subTopic
      }));
    } catch (err) {
      console.error(err);
      setError('ការទាញយកការណែនាំបានបរាជ័យ។ សូមសាកល្បងម្ដងទៀត។');
    } finally {
      setIsSuggesting(false);
    }
  };

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    learningStyle: 'សិស្សរៀនយឺត (Slow Learner)',
    notes: ''
  });

  const handleAddProfile = () => {
    if (!newProfile.name.trim()) return;
    const profile: StudentProfile = {
      id: Date.now().toString(),
      name: newProfile.name.trim(),
      learningStyle: newProfile.learningStyle,
      notes: newProfile.notes.trim() || 'គ្មានកំណត់សម្គាល់បន្ថែម'
    };
    
    const updated = [...studentProfiles, profile];
    setStudentProfiles(updated);
    
    // Also sync to studentInput list if not already there!
    const names = studentInput.split('\n').map(n => n.trim()).filter(n => n !== '');
    if (!names.includes(profile.name)) {
      names.push(profile.name);
      const newInput = names.join('\n');
      setStudentInput(newInput);
      updateConfig('studentCount', names.length);
    }
    
    setNewProfile({
      name: '',
      learningStyle: 'សិស្សរៀនយឺត (Slow Learner)',
      notes: ''
    });
    setShowProfileForm(false);
  };

  const handleDeleteProfile = (id: string) => {
    const profileToDelete = studentProfiles.find(p => p.id === id);
    const updated = studentProfiles.filter(p => p.id !== id);
    setStudentProfiles(updated);
    
    // Also remove from studentInput
    if (profileToDelete) {
      const names = studentInput.split('\n').map(n => n.trim()).filter(n => n !== '' && n !== profileToDelete.name);
      const newInput = names.join('\n');
      setStudentInput(newInput);
      updateConfig('studentCount', names.length);
    }
  };

  const [activeTab, setActiveTab] = useState<'plan' | 'planHtml' | 'worksheets' | 'slides' | 'groups' | 'exams'>('plan');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  
  const [templates, setTemplates] = useState<CustomTemplate[]>(() => {
    const saved = localStorage.getItem('khmer_lesson_templates');
    return saved ? JSON.parse(saved) : [
      { id: 'std-5-step', name: 'ស្តង់ដារ ៥ ជំហាន', description: 'កិច្ចតែងការបង្រៀនស្តង់ដារក្រសួងអប់រំ', structure: 'ប្រើប្រាស់ ៥ ជំហាន៖ លំនឹងថ្នាក់, រំលឹកមេរៀនចាស់, មេរៀនថ្មី, ពង្រឹងចំណេះដឹង, និងកិច្ចការផ្ទះ' }
    ];
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('std-5-step');
  const [showSettings, setShowSettings] = useState(true);

  // Refs for auto-save to always have latest values
  const stateRef = useRef({ lessonPlan, prompt, studentInput, config, studentProfiles });
  useEffect(() => {
    stateRef.current = { lessonPlan, prompt, studentInput, config, studentProfiles };
  }, [lessonPlan, prompt, studentInput, config, studentProfiles]);

  // Auto-save every 1 minute
  useEffect(() => {
    const saveToLocalStorage = () => {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(stateRef.current));
      setLastSaved(new Date());
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    };

    const interval = setInterval(saveToLocalStorage, 60000);
    return () => clearInterval(interval);
  }, []);

  const divideGroups = (names: string[], memberCount: number): StudentGroup[] => {
    const shuffled = [...names].sort(() => 0.5 - Math.random());
    const groups: StudentGroup[] = [];
    let groupIndex = 1;
    
    for (let i = 0; i < shuffled.length; i += memberCount) {
      const rawMembers = shuffled.slice(i, i + memberCount);
      const membersWithRoles: GroupMember[] = rawMembers.map((name, idx) => {
        let role = ROLE_SEEKER;
        if (idx === 0) role = ROLE_LEADER;
        else if (idx === 1) role = ROLE_RECORDER;
        else if (idx === 2) role = ROLE_PRESENTER;
        return { name, role };
      });

      groups.push({
        id: groupIndex,
        name: `ក្រុមទី ${groupIndex}`,
        members: membersWithRoles
      });
      groupIndex++;
    }
    return groups;
  };

  const handleReshuffleGroups = () => {
    const names = studentInput.split('\n').map(n => n.trim()).filter(n => n !== '');
    if (names.length === 0) {
      setError('សូមបញ្ចូលឈ្មោះសិស្សជាមុនសិន!');
      return;
    }
    const groups = divideGroups(names, config.groupMemberCount || 5);
    setLessonPlan(prev => ({
      ...prev,
      studentNames: names,
      groups: groups
    }));
    setActiveTab('groups');
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && (!config.title?.trim() && !config.subTopic?.trim())) {
      setError('សូមបញ្ចូលចំណងជើងមេរៀន ឬខ្លឹមសារមេរៀន!');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
      const template = templates.find(t => t.id === selectedTemplateId);
      const newPlan = await generateLessonPlan({
        ...config,
        studentProfiles: studentProfiles
      }, prompt, template);
      
      const names = studentInput.split('\n').map(n => n.trim()).filter(n => n !== '');
      const groups = names.length > 0 ? divideGroups(names, config.groupMemberCount || 5) : [];
      
      setLessonPlan({
        ...newPlan,
        studentNames: names,
        groups: groups,
        taughtBy: config.taughtBy || 'គ្រូបង្រៀន',
        studentProfiles: studentProfiles
      });
      setActiveTab('plan');
    } catch (err) {
      setError('ការបង្កើតកិច្ចតែងការបរាជ័យ។ សូមព្យាយាមម្តងទៀត។');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateConfig = (field: keyof LessonPlan, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const downloadAsPDF = () => {
    const element = document.querySelector('.print-area');
    if (!element) return;
    const opt = {
      margin: [0, 0],
      filename: `LessonPlan_${config.lessonNumber}_${config.subTopic?.substring(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Kantumruy_Pro']">
      <header className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-4 shadow-2xl border-b-4 border-amber-500 no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-5">
          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-2xl text-blue-950 shadow-md transform hover:rotate-6 transition-all duration-300">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-base lg:text-lg font-black khmer-title whitespace-nowrap tracking-wide text-amber-400">គ្រូបង្រៀនកិច្ចព្រមព្រៀងចុងកោះជ្រូក</h1>
                <p className="text-[10px] text-slate-300 font-bold leading-none mt-1">ប្រព័ន្ធជំនួយការគរុកោសល្យ និងកិច្ចតែងការបង្រៀនឆ្លាតវៃ AI</p>
              </div>
            </div>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all shadow-md ${
                showSettings 
                  ? 'bg-amber-500 text-blue-950 border border-amber-400' 
                  : 'bg-blue-900/40 hover:bg-blue-800/60 text-white border border-blue-700/50'
              }`}
              title="ការកំណត់មេរៀន"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="hidden sm:inline">{showSettings ? 'លាក់ការកំណត់' : 'កំណត់មេរៀន'}</span>
            </button>
          </div>
          
          <div className="flex gap-2 w-full lg:w-3/5">
            <input 
              type="text" 
              placeholder="បញ្ជាក់បន្ថែមសម្រាប់ AI (ឧ៖ សង្កត់ធ្ងន់លើលំហាត់អនុវត្ត រំលឹកមេរៀនចាស់ខ្លាំង...)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow px-5 py-3 rounded-xl text-gray-900 bg-white border border-slate-300 outline-none shadow-inner text-sm font-medium focus:ring-2 focus:ring-amber-400 transition-all placeholder:text-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`bg-amber-500 hover:bg-amber-400 active:scale-95 text-blue-950 font-black px-6 lg:px-8 py-3 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-xl text-xs sm:text-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-blue-950 border-t-transparent rounded-full"></span>
                  <span>កំពុងបង្កើត...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span>បង្កើតកិច្ចតែងការ AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {showSavedToast && (
        <div className="fixed bottom-4 right-4 z-[60] bg-green-600 text-white px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 no-print">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm font-bold">បានរក្សាទុកស្វ័យប្រវត្ត</span>
        </div>
      )}

      <div className="flex flex-grow max-w-7xl mx-auto w-full relative">
        <aside className={`no-print w-80 bg-white border-r border-gray-200 p-6 transition-all duration-300 fixed md:relative z-40 h-[calc(100vh-80px)] overflow-y-auto ${showSettings ? 'translate-x-0' : '-translate-x-full fixed md:absolute shadow-2xl'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-900 khmer-title">ការកំណត់មេរៀន</h2>
            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-red-500 text-2xl">×</button>
          </div>
          
          <div className="space-y-4 text-xs font-medium">
            <div>
              <label className="block font-black text-gray-700 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                ជ្រើសរើសគំរូរហ័ស (Quick Presets)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      subject: 'គណិតវិទ្យា',
                      grade: '៤',
                      lessonNumber: 'មេរៀនទី ១',
                      title: 'វិធីបូកនិងវិធីដកចំនួនមានតួអក្សរ',
                      subTopic: 'ការគណនាលំហាត់បូកនិងដកចំនួនមានតួអក្សរយ៉ាងត្រឹមត្រូវ និងការដោះស្រាយចំណោទគំរូ'
                    }));
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 py-2 px-1 rounded-xl border border-blue-200/50 text-[10px] font-black transition-all text-center"
                >
                  គណិត ថ្នាក់៤
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      subject: 'ភាសាខ្មែរ',
                      grade: '៣',
                      lessonNumber: 'មេរៀនទី ៥',
                      title: 'ការតែងល្បះដោយប្រើនាមនិងកិរិយាសព្ទ',
                      subTopic: 'ស្វែងយល់ពីតួនាទីរបស់នាម និងកិរិយាសព្ទនៅក្នុងល្បះ និងការអនុវត្តតែងល្បះសាមញ្ញ'
                    }));
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 py-2 px-1 rounded-xl border border-indigo-200/50 text-[10px] font-black transition-all text-center"
                >
                  ខ្មែរ ថ្នាក់៣
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfig(prev => ({
                      ...prev,
                      subject: 'វិទ្យាសាស្ត្រ',
                      grade: '៥',
                      lessonNumber: 'មេរៀនទី ២',
                      title: 'វដ្តទឹកនិងសារៈសំខាន់របស់វា',
                      subTopic: 'ការសិក្សាស្វែងយល់ពីវដ្តទឹកក្នុងធម្មជាតិ ការកកើតពពក ភ្លៀង និងការថែរក្សាប្រភពទឹកស្អាត'
                    }));
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2 px-1 rounded-xl border border-emerald-200/50 text-[10px] font-black transition-all text-center"
                >
                  វិទ្យា ថ្នាក់៥
                </button>
              </div>
            </div>

            <div>
              <label className="block font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                </svg>
                មុខវិជ្ជា (Subject)
              </label>
              <select 
                value={config.subject} 
                onChange={(e) => updateConfig('subject', e.target.value)} 
                className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer text-sm font-bold text-gray-800"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-gray-700 mb-1.5">មេរៀនទី</label>
                <input 
                  type="text" 
                  value={config.lessonNumber} 
                  onChange={(e) => updateConfig('lessonNumber', e.target.value)} 
                  className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-xs font-bold text-gray-800" 
                  placeholder="ឧ៖ មេរៀនទី ១"
                />
              </div>

              <div>
                <label className="block font-black text-gray-700 mb-1.5">បង្រៀនថ្នាក់ទី</label>
                <select 
                  value={config.grade} 
                  onChange={(e) => updateConfig('grade', e.target.value)} 
                  className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer text-xs font-bold text-gray-800"
                >
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-3.5 rounded-2xl flex flex-col gap-2 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-850">
                <svg className="w-4 h-4 flex-shrink-0 text-amber-600 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                </svg>
                <span className="font-black text-xs text-amber-950">ជំនួយការឆ្លាតវៃ (AI Assistant)</span>
              </div>
              <p className="text-[10px] text-amber-800 leading-normal">
                រៀបចំចំណងជើង និងខ្លឹមសារគំរូដោយស្វ័យប្រវត្តិតាមមុខវិជ្ជា និងថ្នាក់ទីដែលលោកគ្រូអ្នកគ្រូបានជ្រើសរើស៖
              </p>
              <button
                type="button"
                onClick={handleSuggestTopic}
                disabled={isSuggesting}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSuggesting ? (
                  <>
                    <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>កំពុងរៀបចំ...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>✨ ឱ្យ AI រៀបចំប្រធានបទ</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="block font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                ចំណងជើងមេរៀន (Lesson Title)
              </label>
              <input 
                type="text" 
                value={config.title} 
                onChange={(e) => updateConfig('title', e.target.value)} 
                className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-xs font-bold text-gray-800" 
                placeholder="ឧ៖ វិធីបូកនិងវិធីដកចំនួនមានតួអក្សរ"
              />
            </div>

            <div>
              <label className="block font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                ខ្លឹមសារមេរៀន (Lesson Details)
              </label>
              <textarea 
                value={config.subTopic} 
                onChange={(e) => updateConfig('subTopic', e.target.value)} 
                className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all h-20 resize-none text-xs font-bold text-gray-800 leading-relaxed shadow-inner" 
                placeholder="ឧ៖ ការគណនាលំហាត់បូក និងដកចំនួន ៥ខ្ទង់ គ្មានត្រួត..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-black text-gray-700 mb-1.5">រយៈពេលបង្រៀន</label>
                <input 
                  type="text" 
                  value={config.duration} 
                  onChange={(e) => updateConfig('duration', e.target.value)} 
                  className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-xs font-bold text-gray-800" 
                  placeholder="ឧ៖ ៤០ នាទី" 
                />
              </div>

              <div>
                <label className="block font-black text-gray-700 mb-1.5">កាលបរិច្ឆេទ</label>
                <input 
                  type="date" 
                  value={config.date} 
                  onChange={(e) => updateConfig('date', e.target.value)} 
                  className="w-full border border-gray-300 p-2 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-xs font-bold text-gray-800" 
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-gray-700 mb-1.5">គោលវិធីសិក្សា (Framework)</label>
              <select 
                value={config.policy} 
                onChange={(e) => updateConfig('policy', e.target.value)} 
                className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer text-xs font-bold text-gray-800"
              >
                {POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-black text-gray-700 mb-1.5">វិធីសាស្ត្របង្រៀន (Teaching Method)</label>
              <select 
                value={config.method} 
                onChange={(e) => updateConfig('method', e.target.value)} 
                className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer text-xs font-bold text-gray-800"
              >
                {METHODS_21ST.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                កម្រិតពុទ្ធិ Bloom (Bloom's Taxonomy)
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50/50">
                {BLOOMS_TAXONOMY_LEVELS.map(level => {
                  const isChecked = (config.bloomsLevels || []).includes(level.id);
                  return (
                    <label 
                      key={level.id}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                        isChecked 
                          ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-sm' 
                          : 'bg-white hover:bg-slate-50 border-gray-150 text-gray-600'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const currentLevels = config.bloomsLevels || [];
                          let newLevels;
                          if (currentLevels.includes(level.id)) {
                            if (currentLevels.length > 1) {
                              newLevels = currentLevels.filter(id => id !== level.id);
                            } else {
                              return; // Keep at least one
                            }
                          } else {
                            newLevels = [...currentLevels, level.id];
                          }
                          updateConfig('bloomsLevels', newLevels);
                        }}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[11px] leading-tight">{level.khmer}</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 leading-normal truncate" title={level.description}>
                          {level.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div>
              <label className="block font-black text-gray-700 mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                បង្រៀនដោយ (Taught By)
              </label>
              <input 
                type="text" 
                value={config.taughtBy} 
                onChange={(e) => updateConfig('taughtBy', e.target.value)} 
                className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-xs font-bold text-gray-800" 
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block font-black text-gray-700 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                បញ្ជីឈ្មោះសិស្ស (ម្នាក់មួយជួរ)
              </label>
              <textarea 
                value={studentInput}
                onChange={(e) => {
                  setStudentInput(e.target.value);
                  const count = e.target.value.split('\n').filter(n => n.trim() !== '').length;
                  updateConfig('studentCount', count);
                }}
                className="w-full border border-gray-300 p-2.5 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all h-32 resize-none text-xs font-bold text-gray-800 leading-relaxed shadow-inner"
                placeholder="បញ្ចូលឈ្មោះសិស្ស..."
              />
              <button 
                onClick={handleReshuffleGroups}
                className="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2.5 rounded-xl border border-indigo-150 hover:shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 font-bold text-xs"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                </svg>
                ប្តូរក្រុម និងតួនាទីថ្មី (Reshuffle)
              </button>
            </div>

            {/* Student Profiles Section */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-black text-gray-700 flex items-center gap-1.5 text-xs">
                  <svg className="w-4 h-4 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ប្រវត្តិរូបសិស្សពិសេស ({studentProfiles.length})
                </label>
                <button 
                  type="button"
                  onClick={() => setShowProfileForm(!showProfileForm)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[10px] font-black border border-blue-200 cursor-pointer flex items-center gap-1"
                >
                  {showProfileForm ? 'បិទ' : '➕ បន្ថែមថ្មី'}
                </button>
              </div>

              {showProfileForm && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-3 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">ឈ្មោះសិស្ស</label>
                    <input 
                      type="text"
                      value={newProfile.name}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ឧ៖ សុខ ជា"
                      className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs font-bold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">ស្ទីលរៀន / កម្រិត</label>
                    <select
                      value={newProfile.learningStyle}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, learningStyle: e.target.value }))}
                      className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs font-bold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      <option value="សិស្សរៀនយឺត (Slow Learner)">សិស្សរៀនយឺត (Slow Learner)</option>
                      <option value="សិស្សឆ្នើម (Fast Learner)">សិស្សឆ្នើម (Fast Learner)</option>
                      <option value="មធ្យម (Average Learner)">មធ្យម (Average Learner)</option>
                      <option value="គំហើញ (Visual Learner)">គំហើញ (Visual Learner)</option>
                      <option value="ឮសូរ (Auditory Learner)">ឮសូរ (Auditory Learner)</option>
                      <option value="ចលនាកាយ (Kinesthetic)">ចលនាកាយ (Kinesthetic)</option>
                      <option value="អាន/សរសេរ (Read/Write)">អាន/សរសេរ (Read/Write)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">កំណត់សម្គាល់ការសិក្សា</label>
                    <input 
                      type="text"
                      value={newProfile.notes}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="ឧ៖ ត្រូវការជំនួយរូបភាព ឬលំហាត់សាមញ្ញ"
                      className="w-full border border-gray-300 p-2 rounded-lg bg-white text-xs font-bold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddProfile}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-black text-xs shadow-sm cursor-pointer"
                  >
                    រក្សាទុកប្រវត្តិរូប
                  </button>
                </div>
              )}

              {studentProfiles.length === 0 ? (
                <div className="text-[10px] text-gray-400 italic text-center py-2 bg-slate-50 border border-dashed border-gray-200 rounded-xl">
                  មិនទាន់មានប្រវត្តិរូបសិស្សពិសេសឡើយ។
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                  {studentProfiles.map(p => (
                    <div key={p.id} className="bg-white p-2 rounded-lg border border-gray-150 shadow-xs flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-blue-950">{p.name}</span>
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200/50 px-1.5 py-0.5 rounded-full">
                            {p.learningStyle}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 leading-tight truncate" title={p.notes}>
                          {p.notes}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteProfile(p.id)}
                        className="text-gray-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer text-xs"
                        title="លុបប្រវត្តិរូប"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {lastSaved && (
              <div className="pt-4 text-[10px] text-gray-400 text-center italic">
                រក្សាទុកចុងក្រោយ៖ {lastSaved.toLocaleTimeString('km-KH')}
              </div>
            )}
          </div>
        </aside>

        <main className="flex-grow p-4 lg:p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 no-print gap-4">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-md border border-gray-200 overflow-x-auto gap-1">
              {(['plan', 'planHtml', 'worksheets', 'slides', 'groups', 'exams'] as const).map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap text-xs flex items-center gap-2 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 border border-blue-500 scale-[1.02]' 
                        : 'text-gray-600 hover:text-blue-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {TAB_ICONS[tab]}
                    <span>
                      {tab === 'plan' ? 'កិច្ចតែងការ' : 
                       tab === 'planHtml' ? 'កិច្ចតែងការ IBL (HTML)' :
                       tab === 'worksheets' ? 'សន្លឹកកិច្ចការ' : 
                       tab === 'slides' ? 'ស្លាយ' : 
                       tab === 'groups' ? 'បញ្ជីក្រុម' : 'វិញ្ញាសា & សន្លឹកកិច្ចការ HTML'}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {activeTab !== 'exams' && activeTab !== 'planHtml' && (
              <button onClick={downloadAsPDF} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-red-700 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                ទាញយកជា PDF
              </button>
            )}
          </div>

          <div className="print-area">
            {activeTab === 'plan' && <LessonPlanView plan={lessonPlan} />}
            {activeTab === 'planHtml' && <LessonPlanHtmlView currentPlan={lessonPlan} />}
            {activeTab === 'worksheets' && <WorksheetView plan={lessonPlan} />}
            {activeTab === 'slides' && <PresentationView plan={lessonPlan} />}
            {activeTab === 'groups' && <GroupsView plan={lessonPlan} onReshuffle={handleReshuffleGroups} />}
            {activeTab === 'exams' && <ExamGeneratorView currentPlan={lessonPlan} config={config} />}
          </div>
        </main>
      </div>

      <footer className="bg-gray-800 text-gray-400 py-4 text-center no-print">
        <p className="text-sm">© 2025 គ្រូបង្រៀនកិច្ចព្រមព្រៀងចុងកោះជ្រូក - បង្កើតដោយបញ្ញាសិប្បនិម្មិត</p>
      </footer>
    </div>
  );
};

export default App;
