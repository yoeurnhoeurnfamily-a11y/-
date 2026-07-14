import React, { useEffect, useRef, useState } from 'react';
import { LessonPlan, Slide } from '../types';
import { exportElementToWord } from '../utils/wordExport';
import { exportPlanToPPTX } from '../utils/pptxExport';

interface PresentationViewProps {
  plan: LessonPlan;
}

const AnimatedTitleSlide: React.FC<{ plan: LessonPlan; theme: 'standard' | 'cute' | 'professional' }> = ({ plan, theme }) => {
  const isCute = theme === 'cute';
  const isProfessional = theme === 'professional';

  let containerClass = "bg-slate-900 text-white border border-slate-800";
  let ribbonTextClass = "text-yellow-400";
  let titleClass = "text-white";
  let cardClass = "bg-white/5 border-white/10 text-slate-100";
  let footerTextClass = "text-yellow-400";

  if (isCute) {
    containerClass = "bg-gradient-to-tr from-pink-100 via-rose-50 to-indigo-100 border-2 border-pink-200 text-slate-800 shadow-pink-100/50";
    ribbonTextClass = "text-pink-600 font-extrabold";
    titleClass = "text-pink-700 font-black drop-shadow-none";
    cardClass = "bg-white/80 border border-pink-200/60 shadow-sm shadow-pink-100/30 text-slate-700";
    footerTextClass = "text-pink-600";
  } else if (isProfessional) {
    containerClass = "bg-gradient-to-b from-blue-950 via-slate-900 to-indigo-950 border border-amber-500/30 text-white relative";
    ribbonTextClass = "text-amber-400 font-extrabold";
    titleClass = "text-amber-300 font-black drop-shadow-md";
    cardClass = "bg-blue-950/40 border border-amber-500/15 text-slate-100";
    footerTextClass = "text-amber-400";
  }

  return (
    <div 
      className={`relative aspect-video rounded-2xl shadow-2xl flex flex-col overflow-hidden break-after-page print:m-0 print:rounded-none group transition-all duration-1000 ease-out transform ${containerClass}`}
    >
      {/* Professional thin framing */}
      {isProfessional && (
        <div className="absolute inset-3 border-2 border-double border-amber-500/10 rounded-xl pointer-events-none z-0"></div>
      )}

      {/* Decorative Background Elements */}
      {!isCute ? (
        <>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </>
      ) : (
        <>
          <div className="absolute top-8 right-16 text-pink-300/30 w-16 h-16 pointer-events-none animate-pulse transform rotate-12">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="absolute bottom-16 left-12 text-indigo-300/25 w-12 h-12 pointer-events-none animate-bounce transform -rotate-12">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </>
      )}

      {/* Main Title Center Content */}
      <div className="flex-grow flex flex-col justify-center items-center text-center px-16 relative z-10 py-10">
        <span className={`uppercase tracking-widest text-sm font-bold mb-4 ${ribbonTextClass}`}>
          ស្លាយបង្រៀនអេឡិចត្រូនិច (Digital Lesson Slides)
        </span>
        
        <h1 className={`text-4xl lg:text-6xl font-black khmer-title leading-tight mb-6 max-w-4xl ${titleClass}`}>
          {plan.title || 'ចំណងជើងមេរៀន'}
        </h1>

        <div className="h-1.5 w-24 bg-yellow-400 rounded-full mb-8"></div>

        <div className={`px-8 py-4 rounded-2xl border ${cardClass} max-w-lg w-full flex flex-col items-center gap-2 shadow-xl`}>
          <p className="text-lg font-bold">
            មុខវិជ្ជា៖ <span className="text-yellow-400 font-extrabold">{plan.subject}</span>  •  ថ្នាក់ទី៖ <span className="text-yellow-400 font-extrabold">{plan.grade}</span>
          </p>
          <div className="w-full h-[1px] bg-white/10 my-1"></div>
          <p className="text-sm font-medium opacity-80">
            បង្រៀនដោយ៖ {plan.taughtBy}
          </p>
          <p className="text-xs opacity-65 italic">
            កាលបរិច្ឆេទ៖ {plan.date}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-12 py-4 flex justify-between items-center border-t border-white/5 text-xs opacity-50">
        <span>© ២០២៥ គ្រូបង្រៀនកិច្ចព្រមព្រៀងចុងកោះជ្រូក</span>
        <span className={`font-bold ${footerTextClass}`}>ស្លាយទី ០០</span>
      </div>
    </div>
  );
};

const AnimatedSlide: React.FC<{ slide: Slide; index: number; total: number; plan: LessonPlan; theme: 'standard' | 'cute' | 'professional' }> = ({ slide, index, total, plan, theme }) => {
  const [isVisible, setIsVisible] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (slideRef.current) {
      observer.observe(slideRef.current);
    }

    return () => {
      if (slideRef.current) {
        observer.unobserve(slideRef.current);
      }
    };
  }, []);

  // Theme-specific CSS styles
  const isCute = theme === 'cute';
  const isProfessional = theme === 'professional';

  let containerClass = "bg-slate-900 text-white border border-slate-800";
  let headerClass = "bg-white/5 border-b border-white/5";
  let ribbonClass = "bg-yellow-400";
  let ribbonTextClass = "text-yellow-400";
  let titleClass = "text-white";
  let cardClass = "bg-white/5 border-white/10 hover:bg-white/10 text-slate-100";
  let badgeClass = "bg-yellow-400 text-blue-900 shadow-yellow-400/20";
  let badgeIconColor = "currentColor";
  let footerClass = "bg-slate-950/50 border-t border-white/5";
  let footerTextClass = "text-blue-400";
  let progressBg = "bg-white/10";
  let progressFill = "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]";

  if (isCute) {
    containerClass = "bg-gradient-to-tr from-pink-100 via-rose-50 to-indigo-100 border-2 border-pink-200 text-slate-800 shadow-pink-100/50";
    headerClass = "bg-white/60 border-b border-pink-100/50 backdrop-blur-md";
    ribbonClass = "bg-pink-400";
    ribbonTextClass = "text-pink-600 font-extrabold";
    titleClass = "text-pink-700 font-black drop-shadow-none";
    cardClass = "bg-white/80 border border-pink-200/60 shadow-sm shadow-pink-100/30 hover:bg-white text-slate-700";
    badgeClass = "bg-pink-500 text-white shadow-pink-500/20";
    badgeIconColor = "white";
    footerClass = "bg-white/60 border-t border-pink-100/50";
    footerTextClass = "text-pink-600 font-bold";
    progressBg = "bg-pink-100";
    progressFill = "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]";
  } else if (isProfessional) {
    containerClass = "bg-gradient-to-b from-blue-950 via-slate-900 to-indigo-950 border border-amber-500/30 text-white relative";
    headerClass = "bg-blue-950/50 border-b border-amber-500/10 backdrop-blur-sm";
    ribbonClass = "bg-amber-500";
    ribbonTextClass = "text-amber-400 font-extrabold";
    titleClass = "text-amber-300 font-black drop-shadow-md";
    cardClass = "bg-blue-950/40 border border-amber-500/15 hover:bg-blue-950/70 text-slate-100";
    badgeClass = "bg-amber-500 text-blue-950 shadow-amber-500/20";
    badgeIconColor = "currentColor";
    footerClass = "bg-slate-950/70 border-t border-amber-500/10";
    footerTextClass = "text-amber-400 font-bold";
    progressBg = "bg-white/5";
    progressFill = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
  }

  return (
    <div 
      ref={slideRef}
      data-slide-idx={index}
      className={`relative aspect-video rounded-2xl shadow-2xl flex flex-col overflow-hidden break-after-page print:m-0 print:rounded-none group transition-all duration-1000 ease-out transform ${containerClass} ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-[0.97]'
      }`}
    >
      {/* Professional thin framing */}
      {isProfessional && (
        <div className="absolute inset-3 border-2 border-double border-amber-500/10 rounded-xl pointer-events-none z-0"></div>
      )}

      {/* Decorative Background Elements */}
      {!isCute && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </>
      )}

      {/* Cute Floating Elements */}
      {isCute && (
        <>
          <div className="absolute top-8 right-16 text-pink-300/30 w-16 h-16 pointer-events-none animate-pulse transform rotate-12">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="absolute bottom-16 left-12 text-indigo-300/25 w-12 h-12 pointer-events-none animate-bounce transform -rotate-12">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div className="absolute top-1/2 right-6 text-amber-300/30 w-8 h-8 pointer-events-none animate-spin" style={{ animationDuration: '6s' }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
        </>
      )}

      {/* Header Section */}
      <div className={`relative z-10 px-12 pt-12 pb-6 ${headerClass}`}>
        <div className="flex items-center gap-4 mb-2">
          <div className={`h-1.5 w-12 rounded-full ${ribbonClass}`}></div>
          <span className={`uppercase tracking-widest text-sm ${ribbonTextClass}`}>{plan.subject}</span>
        </div>
        <h2 
          data-slide-title
          className={`text-4xl lg:text-5xl font-black khmer-title leading-tight drop-shadow-md ${titleClass}`}
        >
          {slide.title}
        </h2>
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex-grow px-16 py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 gap-6">
          {slide.content.map((point, i) => (
            <div 
              key={i} 
              style={{ transitionDelay: `${i * 150}ms` }}
              className={`flex gap-6 items-start p-6 rounded-2xl border transition-all duration-500 transform ${cardClass} ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${badgeClass}`}>
                <svg className="w-5 h-5" fill="none" stroke={badgeIconColor} strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p 
                data-point-idx={i}
                className="text-2xl font-bold leading-relaxed drop-shadow-sm"
              >
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className={`relative z-10 px-12 py-6 flex justify-between items-end ${footerClass}`}>
        <div className="flex flex-col">
          <span className={`text-sm ${footerTextClass}`}>ថ្នាក់ទី {plan.grade}</span>
          <span className={`${isCute ? 'text-pink-800/60' : 'text-slate-500'} text-xs font-bold`}>រៀបចំដោយ៖ {plan.taughtBy}</span>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className={`text-lg font-bold font-mono ${isCute ? 'text-pink-700/60' : 'text-white/45'}`}>
            {String(index + 1).padStart(2, '0')} <span className="text-white/10">/</span> {String(total).padStart(2, '0')}
          </div>
          {/* Progress Bar */}
          <div className={`w-48 h-1.5 rounded-full overflow-hidden ${progressBg}`}>
            <div 
              className={`h-full transition-all duration-1000 ease-out ${progressFill}`}
              style={{ width: isVisible ? `${((index + 1) / total) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PresentationView: React.FC<PresentationViewProps> = ({ plan }) => {
  const [slideTheme, setSlideTheme] = useState<'standard' | 'cute' | 'professional'>('standard');

  if (!plan.slides || plan.slides.length === 0) return <div className="text-center p-10 font-bold text-gray-500">មិនទាន់មានស្លាយ</div>;

  return (
    <div className="max-w-6xl mx-auto mb-10">
      {/* Slide Theme Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center no-print px-6 py-4 mx-4 mb-5 bg-white border border-slate-200 rounded-2xl shadow-sm gap-4">
        <div>
          <h4 className="font-black text-slate-800 text-sm khmer-title flex items-center gap-1.5">
            <svg className="w-4 h-4 text-pink-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            ជ្រើសរើសស្ទីលរចនាស្លាយ (Select Slide Style)
          </h4>
          <p className="text-[11px] text-slate-500 font-bold mt-0.5">លោកគ្រូអ្នកគ្រូអាចប្ដូរស្ទីល ឬពណ៌ស្លាយគំរូដ៏ស្រស់ស្អាត តាមតម្រូវការបង្រៀនជាក់ស្តែង</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 gap-1.5 w-full lg:w-auto">
          {(['standard', 'cute', 'professional'] as const).map(theme => {
            const isActive = slideTheme === theme;
            return (
              <button
                key={theme}
                onClick={() => setSlideTheme(theme)}
                className={`flex-grow lg:flex-grow-0 px-4 py-2 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                  isActive
                    ? theme === 'cute'
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-200 border border-pink-400 scale-[1.02]'
                      : theme === 'professional'
                      ? 'bg-blue-900 text-white shadow-md shadow-blue-200 border border-blue-800 scale-[1.02]'
                      : 'bg-slate-800 text-white shadow-md shadow-slate-300 border border-slate-700 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>
                  {theme === 'standard' && '🌌 ស្តង់ដា'}
                  {theme === 'cute' && '🌸 គួរឱ្យស្រឡាញ់'}
                  {theme === 'professional' && '🏛️ ផ្លូវការ'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Hint and Export Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-6 gap-4 no-print px-6 py-5 mx-4 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-3 rounded-2xl animate-pulse flex-shrink-0 shadow-md shadow-blue-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-base khmer-title">✍️ លោកគ្រូអ្នកគ្រូអាចកែសម្រួលស្លាយផ្ទាល់បាន!</h4>
            <p className="text-xs text-blue-700 font-bold mt-0.5">ចុចលើខ្លឹមសារស្លាយ ឬចំណងជើងណាមួយនៅក្នុងស្លាយខាងក្រោមដើម្បីកែសម្រួលបានភ្លាមៗ មុននឹងទាញយក</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* PowerPoint Export Button */}
          <button
            onClick={() => exportPlanToPPTX(plan, slideTheme)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-black px-5 py-3 rounded-xl shadow-lg hover:shadow-orange-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-orange-700 cursor-pointer text-sm font-sans"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            ទាញយកជា PowerPoint (Download PPTX)
          </button>

          {/* Word Export Button */}
          <button
            onClick={() => exportElementToWord('presentation-content', `ស្លាយ_${plan.title || 'មេរៀន'}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-xl shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-blue-700 cursor-pointer text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ទាញយកជា Word (Download DOCX)
          </button>
        </div>
      </div>

      <div 
        id="presentation-content" 
        contentEditable={true}
        suppressContentEditableWarning={true}
        className="space-y-24 pb-40 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl transition-all"
      >
        {/* On-screen Title Slide Preview */}
        <AnimatedTitleSlide plan={plan} theme={slideTheme} />

        {plan.slides.map((slide, index) => (
          <AnimatedSlide 
            key={index} 
            slide={slide} 
            index={index} 
            total={plan.slides!.length} 
            plan={plan} 
            theme={slideTheme}
          />
        ))}
      </div>
    </div>
  );
};

export default PresentationView;
