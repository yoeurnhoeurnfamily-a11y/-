
import React from 'react';
import { LessonPlan } from '../types';
import { exportElementToWord } from '../utils/wordExport';

interface GroupsViewProps {
  plan: LessonPlan;
  onReshuffle: () => void;
}

const GroupsView: React.FC<GroupsViewProps> = ({ plan, onReshuffle }) => {
  if (!plan.groups || plan.groups.length === 0) {
    return (
      <div className="bg-white p-20 shadow-2xl max-w-4xl mx-auto rounded-2xl text-center border-2 border-dashed border-gray-200">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-400 mb-2">មិនទាន់មានការបែងចែកក្រុម</h2>
        <p className="text-gray-400 max-w-xs mx-auto mb-8 italic">សូមបញ្ចូលបញ្ជីឈ្មោះសិស្សនៅក្នុងផ្នែក "ការកំណត់" រួចចុចប៊ូតុង "ប្តូរក្រុមថ្មី" ឬ "បង្កើតថ្មី"។</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Edit Hint */}
      <div className="max-w-5xl mx-auto no-print bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3">
        <div className="bg-blue-600 text-white p-2 rounded-xl animate-pulse">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-blue-900 text-sm">✍️ លោកគ្រូអ្នកគ្រូអាចកែសម្រួលក្រុមសិស្សផ្ទាល់បាន!</h4>
          <p className="text-xs text-blue-700 font-medium">ចុចលើឈ្មោះក្រុម ឬឈ្មោះសិស្សណាមួយខាងក្រោមដើម្បីកែសម្រួល ឬប្ដូរឈ្មោះសរសេរបន្ថែមបានភ្លាមៗ</p>
        </div>
      </div>

      <div 
        id="student-groups-content" 
        contentEditable={true}
        suppressContentEditableWarning={true}
        className="bg-white p-12 shadow-2xl max-w-5xl mx-auto print-area border border-gray-200 rounded-xl overflow-hidden relative outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 border-b-4 border-double border-blue-900 pb-6 relative z-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-blue-900 khmer-title mb-1">បញ្ជីបែងចែកក្រុមសិស្ស</h1>
            <p className="text-gray-500 italic text-sm">Student Group Assignment - {plan.date}</p>
          </div>
          <div className="text-right no-print flex gap-3 self-end sm:self-auto">
            <button 
              onClick={onReshuffle}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 text-sm border border-gray-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              ប្តូរក្រុមថ្មី (Reshuffle)
            </button>
            <button 
              onClick={() => exportElementToWord('student-groups-content', `បញ្ជីក្រុម_${plan.title || 'សិស្ស'}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ទាញយកជា Word (Download DOCX)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {plan.groups.map((group) => (
            <div key={group.id} className="border-2 border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
              <div className="bg-blue-900 border-b border-blue-100 p-4 flex justify-between items-center text-white">
                <span className="font-black text-lg">{group.name}</span>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 font-bold uppercase">
                  {group.members.length} នាក់
                </span>
              </div>
              <div className="p-6 flex-grow">
                <div className="space-y-4">
                  {group.members.map((member, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                      <div className="flex items-center gap-3 text-gray-800">
                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                          {i + 1}
                        </span>
                        <span className="font-bold">{member.name}</span>
                      </div>
                      {member.role && (
                        <div className="bg-yellow-100 text-yellow-800 text-[11px] px-3 py-1 rounded-full font-bold border border-yellow-200">
                          {member.role}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>កំណត់សម្គាល់</span>
                  <div className="h-[1px] bg-gray-200 flex-grow mx-4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center">
          <div className="text-sm font-bold text-gray-400">
            មុខវិជ្ជា៖ {plan.subject} | ថ្នាក់ទី៖ {plan.grade}
          </div>
          <div className="text-xs italic text-gray-400">
            រៀបចំដោយ៖ {plan.taughtBy}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupsView;
