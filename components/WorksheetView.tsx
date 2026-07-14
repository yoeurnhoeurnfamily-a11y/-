
import React from 'react';
import { LessonPlan, WorksheetQuestion } from '../types';
import { exportElementToWord } from '../utils/wordExport';

interface WorksheetViewProps {
  plan: LessonPlan;
}

const QuestionRenderer: React.FC<{ q: WorksheetQuestion; index: number }> = ({ q, index }) => {
  const renderContent = () => {
    switch (q.type) {
      case 'multiple-choice':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mt-3 ml-4">
            {q.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-full border-2 border-blue-200 group-hover:border-blue-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-blue-500 bg-blue-50">
                  {String.fromCharCode(65 + i)}
                </div>
                <span className="text-gray-700 font-medium">{opt}</span>
              </div>
            ))}
          </div>
        );
      case 'true-false':
        return (
          <div className="flex gap-12 mt-3 ml-4">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-7 h-7 border-2 border-green-200 rounded-lg group-hover:border-green-500 flex-shrink-0 bg-green-50"></div>
              <span className="text-gray-700 font-bold">ត្រូវ (True)</span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-7 h-7 border-2 border-red-200 rounded-lg group-hover:border-red-500 flex-shrink-0 bg-red-50"></div>
              <span className="text-gray-700 font-bold">ខុស (False)</span>
            </div>
          </div>
        );
      case 'fill-in-the-blanks':
        return (
          <div className="mt-4 ml-4 space-y-4">
             <div className="border-b-2 border-gray-200 h-10 border-dotted w-full"></div>
          </div>
        );
      case 'short-answer':
      default:
        return (
          <div className="mt-4 space-y-5 ml-4">
            <div className="border-b-2 border-gray-200 h-8 border-dotted w-full"></div>
            <div className="border-b-2 border-gray-200 h-8 border-dotted w-full"></div>
            <div className="border-b-2 border-gray-200 h-8 border-dotted w-full"></div>
          </div>
        );
    }
  };

  return (
    <div className="mb-12 break-inside-avoid">
      <div className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
          {index + 1}
        </div>
        <div className="flex-grow">
          <p className="text-xl font-bold text-gray-800 leading-relaxed mb-2">{q.question}</p>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const WorksheetView: React.FC<WorksheetViewProps> = ({ plan }) => {
  if (!plan.worksheets || plan.worksheets.length === 0) return <div className="text-center p-20 font-black text-gray-300">មិនទាន់មានសន្លឹកកិច្ចការ</div>;

  return (
    <div className="space-y-12 pb-20">
      {plan.worksheets.map((ws, index) => (
        <div key={index} className="max-w-[210mm] mx-auto">
          {/* Edit Hint and Download Word Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 no-print bg-blue-50 border border-blue-200 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl animate-pulse">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">✍️ លោកគ្រូអ្នកគ្រូអាចកែសម្រួលសន្លឹកកិច្ចការផ្ទាល់បាន!</h4>
                <p className="text-xs text-blue-700 font-medium">ចុចលើអត្ថបទ សំនួរ ឬចំណងជើងណាមួយនៅក្នុងក្រដាសខាងក្រោមដើម្បីកែសម្រួលបានភ្លាមៗ</p>
              </div>
            </div>
            <button
              onClick={() => exportElementToWord(`worksheet-content-${index}`, `សន្លឹកកិច្ចការ_${ws.title || index + 1}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center gap-2 border border-blue-700 cursor-pointer text-sm shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ទាញយកសន្លឹកកិច្ចការជា Word (Download DOCX)
            </button>
          </div>

          <div 
            id={`worksheet-content-${index}`} 
            contentEditable={true}
            suppressContentEditableWarning={true}
            className="bg-white p-[20mm] shadow-2xl border border-gray-100 print-area text-gray-900 mb-10 min-h-[297mm] flex flex-col outline-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl transition-all"
          >
            {/* A4 Content Wrapper */}
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-12 border-b-8 border-double border-blue-900 pb-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl">ស</div>
                    <div>
                      <h1 className="text-2xl font-black text-blue-900 leading-tight khmer-title tracking-tight">សន្លឹកកិច្ចការសិស្ស</h1>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.2em]">Student Worksheet</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-base pt-4">
                    <div className="flex items-end gap-3"><span className="font-black text-blue-900 whitespace-nowrap">ឈ្មោះសិស្ស៖</span> <span className="border-b-2 border-gray-200 flex-grow h-7"></span></div>
                    <div className="flex items-end gap-3"><span className="font-black text-blue-900">ថ្នាក់ទី៖</span> <span className="font-bold text-gray-700">{plan.grade}</span> <span className="font-black text-blue-900 ml-4">មុខវិជ្ជា៖</span> <span className="font-bold text-gray-700">{plan.subject}</span></div>
                  </div>
                </div>

                <div className="border-8 border-blue-900 w-32 h-32 flex flex-col items-center justify-center rounded-[2rem] bg-blue-50 shadow-inner">
                  <span className="text-[12px] font-black text-blue-900 uppercase">ពិន្ទុ</span>
                  <div className="text-4xl font-black text-blue-900 my-1">...</div>
                  <div className="w-20 h-1 bg-blue-900 rounded-full"></div>
                  <span className="text-[12px] font-black text-blue-900">១០</span>
                </div>
              </div>
              
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black khmer-title text-blue-900 mb-3 drop-shadow-sm">
                  {ws.title}
                </h2>
                <div className="h-2 w-32 bg-yellow-400 mx-auto rounded-full"></div>
              </div>
              
              <div className="mb-12 bg-blue-50/30 p-8 rounded-[2rem] border-2 border-dashed border-blue-200">
                <h3 className="font-black text-blue-900 mb-3 flex items-center gap-3 text-lg">
                  <div className="bg-blue-900 text-white p-1 rounded-full"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg></div>
                  ការណែនាំ (Instructions)
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed font-bold italic">{ws.instructions}</p>
              </div>

              {ws.wordBank && ws.wordBank.length > 0 && (
                <div className="mb-12 p-8 bg-white rounded-[2rem] border-4 border-blue-900 shadow-xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-white px-6 py-1 rounded-full font-black text-sm uppercase tracking-widest">Word Bank</div>
                  <div className="flex flex-wrap justify-center gap-6 mt-2">
                    {ws.wordBank.map((word, i) => (
                      <div key={i} className="px-6 py-2 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-blue-900 text-xl shadow-sm">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {ws.questions.map((q, i) => (
                  <QuestionRenderer key={i} q={q} index={i} />
                ))}
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t-2 border-gray-100 flex justify-between items-center text-gray-400">
              <div className="text-xs font-black uppercase tracking-widest">{plan.subject} • {plan.lessonNumber}</div>
              <div className="text-xs font-bold">រៀបចំដោយ៖ {plan.taughtBy} • ២០២៥</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorksheetView;
