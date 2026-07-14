import pptxgen from 'pptxgenjs';
import { LessonPlan } from '../types';

/**
 * Generates and downloads a beautifully styled PowerPoint (.pptx) file
 * from a LessonPlan's slides with full Khmer Unicode support.
 */
export const exportPlanToPPTX = async (plan: LessonPlan, theme: 'standard' | 'cute' | 'professional' = 'standard') => {
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.layout = 'LAYOUT_16x9';
  
  // Theme configuration
  let CONFIG = {
    fontKhmer: 'Khmer OS Siemreap',
    fontKhmerMuol: 'Khmer OS Muol Light',
    colorBgDark: '0F172A',      // Slate-900 (Main slide background)
    colorBgCard: '1E293B',      // Slate-800 (Content point container)
    colorBorder: '334155',      // Slate-700 (Container borders)
    colorTextLight: 'F8FAFC',   // Slate-50 (Primary body text)
    colorTextMuted: '94A3B8',   // Slate-400 (Secondary details)
    colorTextDark: '1E293B',    // Slate-800 (Dark theme text)
    colorAccentYellow: 'FACC15', // Yellow-400 (Accent color)
    colorAccentBlue: '2563EB',   // Blue-600
    isLight: false
  };

  if (theme === 'cute') {
    CONFIG = {
      fontKhmer: 'Khmer OS Siemreap',
      fontKhmerMuol: 'Khmer OS Muol Light',
      colorBgDark: 'FFF1F2',      // Rose-50 (Pinkish light background)
      colorBgCard: 'FFFFFF',      // Pure white card
      colorBorder: 'FBCFE8',      // Pink-200 border
      colorTextLight: '3F3F46',   // Zinc-800 (Dark text on light background)
      colorTextMuted: 'DB2777',   // Pink-600
      colorTextDark: 'DB2777',    // Pink-600
      colorAccentYellow: 'F472B6', // Pink-400 (Primary accent)
      colorAccentBlue: '818CF8',   // Indigo-400
      isLight: true
    };
  } else if (theme === 'professional') {
    CONFIG = {
      fontKhmer: 'Khmer OS Siemreap',
      fontKhmerMuol: 'Khmer OS Muol Light',
      colorBgDark: '0A192F',      // Navy-950 deep royal dark
      colorBgCard: '112240',      // Deep royal card
      colorBorder: 'D4AF37',      // Premium Gold border
      colorTextLight: 'FFFFFF',   // White primary text
      colorTextMuted: '64FFDA',   // Cyan / teal-ish text details
      colorTextDark: '0A192F',    // Dark Navy
      colorAccentYellow: 'F59E0B', // Gold / Amber primary accent
      colorAccentBlue: '3B82F6',   // Royal blue
      isLight: false
    };
  }

  // --- SLIDE 1: Title Slide ---
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: CONFIG.colorBgDark };

  // Decorative Background Shapes on Title Slide
  titleSlide.addShape(pptx.shapes.OVAL, {
    x: '75%', y: '-15%', w: '40%', h: '70%',
    fill: { color: CONFIG.colorAccentBlue, transparency: theme === 'cute' ? 90 : 85 }
  });
  titleSlide.addShape(pptx.shapes.OVAL, {
    x: '-15%', y: '60%', w: '45%', h: '60%',
    fill: { color: CONFIG.colorAccentYellow, transparency: theme === 'cute' ? 92 : 90 }
  });

  // Cute extra decorations
  if (theme === 'cute') {
    titleSlide.addShape(pptx.shapes.HEART, {
      x: '15%', y: '20%', w: '4%', h: '6%',
      fill: { color: 'FB7185' }
    });
    titleSlide.addShape(pptx.shapes.HEART, {
      x: '82%', y: '50%', w: '3%', h: '4.5%',
      fill: { color: 'F472B6' }
    });
  }

  // Top Small Category Label (e.g. "កិច្ចតែងការបង្រៀនអេឡិចត្រូនិច")
  titleSlide.addText('ស្លាយបង្រៀនអេឡិចត្រូនិច (Digital Lesson Slides)', {
    x: '5%', y: '15%', w: '90%', h: '8%',
    fontSize: 14,
    fontFace: CONFIG.fontKhmer,
    color: CONFIG.colorAccentYellow,
    bold: true,
    align: 'center'
  });

  // Main Lesson Title (Large and bold)
  titleSlide.addText(plan.title || 'ចំណងជើងមេរៀន', {
    x: '5%', y: '23%', w: '90%', h: '26%',
    fontSize: 34,
    fontFace: CONFIG.fontKhmerMuol,
    color: CONFIG.colorTextLight,
    bold: true,
    align: 'center',
    valign: 'middle'
  });

  // Subject and Grade Details Pill
  titleSlide.addText(`មុខវិជ្ជា៖ ${plan.subject || 'គណិតវិទ្យា'}   •   ថ្នាក់ទី៖ ${plan.grade || '៤'}`, {
    x: '10%', y: '52%', w: '80%', h: '8%',
    fontSize: 18,
    fontFace: CONFIG.fontKhmer,
    color: CONFIG.colorAccentYellow,
    bold: true,
    align: 'center',
    valign: 'middle'
  });

  // Footer Info (Date, Teacher/Author)
  const footerY = 0.65;
  
  // Outer frame for Author details
  titleSlide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: '25%', y: `${footerY * 100}%`, w: '50%', h: '16%',
    fill: { color: CONFIG.colorBgCard },
    line: { color: CONFIG.colorBorder, width: 1.5 }
  });

  titleSlide.addText(`កាលបរិច្ឆេទ៖ ${plan.date || new Date().toLocaleDateString('km-KH')}\nបង្រៀនដោយ៖ ${plan.taughtBy || 'លោកគ្រូ អ្នកគ្រូ'}`, {
    x: '26%', y: `${(footerY + 0.01) * 100}%`, w: '48%', h: '14%',
    fontSize: 13,
    fontFace: CONFIG.fontKhmer,
    color: CONFIG.colorTextMuted,
    align: 'center',
    valign: 'middle'
  });

  // --- SLIDE 2 to N: Content Slides ---
  if (plan.slides && plan.slides.length > 0) {
    plan.slides.forEach((slideItem, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: CONFIG.colorBgDark };

      // Background accent orb
      slide.addShape(pptx.shapes.OVAL, {
        x: '80%', y: '-10%', w: '30%', h: '50%',
        fill: { color: CONFIG.colorAccentBlue, transparency: theme === 'cute' ? 94 : 92 }
      });

      // Cute extra decorations on content slides
      if (theme === 'cute') {
        slide.addShape(pptx.shapes.HEART, {
          x: '93%', y: '8%', w: '2.5%', h: '4%',
          fill: { color: 'F472B6', transparency: 30 }
        });
      }

      // Accent Ribbon on Left Border
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: '0%', y: '0%', w: '0.6%', h: '100%',
        fill: { color: CONFIG.colorAccentYellow }
      });

      // Top Small Metadata Indicator
      slide.addText(plan.subject.toUpperCase(), {
        x: '5%', y: '5%', w: '40%', h: '4%',
        fontSize: 10,
        fontFace: CONFIG.fontKhmer,
        color: theme === 'cute' ? CONFIG.colorTextMuted : CONFIG.colorAccentYellow,
        bold: true
      });

      // Slide Title
      slide.addText(slideItem.title, {
        x: '5%', y: '9%', w: '90%', h: '14%',
        fontSize: 26,
        fontFace: CONFIG.fontKhmerMuol,
        color: theme === 'cute' ? 'DB2777' : CONFIG.colorTextLight,
        bold: true,
        valign: 'middle'
      });

      // Divider line
      slide.addShape(pptx.shapes.RECTANGLE, {
        x: '5%', y: '23%', w: '90%', h: '0.1%',
        fill: { color: CONFIG.colorBorder }
      });

      // Slide Content Points (using rounded cards with checkmarks)
      const points = slideItem.content || [];
      const numPoints = points.length;

      // Dynamically calculate slide heights and margins to prevent vertical overflow
      let cardHeight = '12%';
      let gap = 3;
      let startYPercent = 28; // Start at Y: 28%

      if (numPoints > 4) {
        cardHeight = '9%';
        gap = 1.5;
      } else if (numPoints === 1) {
        cardHeight = '24%';
      } else if (numPoints === 2) {
        cardHeight = '18%';
        gap = 5;
      }

      points.forEach((point, i) => {
        const cardY = startYPercent + i * (parseFloat(cardHeight) + gap);
        
        // Card background
        slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
          x: '5%',
          y: `${cardY}%`,
          w: '90%',
          h: cardHeight,
          fill: { color: CONFIG.colorBgCard },
          line: { color: CONFIG.colorBorder, width: 1 }
        });

        // Checkmark Indicator Badge
        const badgeY = cardY + (parseFloat(cardHeight) / 2) - 1.8;
        slide.addShape(pptx.shapes.OVAL, {
          x: '7%',
          y: `${badgeY}%`,
          w: '2%',
          h: '3.6%',
          fill: { color: CONFIG.colorAccentYellow }
        });

        // Mini inside tick
        slide.addShape(pptx.shapes.RECTANGLE, {
          x: '7.8%',
          y: `${badgeY + 1}%`,
          w: '0.4%',
          h: '1.6%',
          fill: { color: theme === 'cute' ? 'FFFFFF' : CONFIG.colorTextDark }
        });

        // Content Point Text
        slide.addText(point, {
          x: '10.5%',
          y: `${cardY}%`,
          w: '82%',
          h: cardHeight,
          fontSize: numPoints > 4 ? 14 : 16,
          fontFace: CONFIG.fontKhmer,
          color: CONFIG.colorTextLight,
          valign: 'middle'
        });
      });

      // Slide Footers
      // Left side: Grade & Author
      slide.addText(`ថ្នាក់ទី ${plan.grade || '៤'}   •   បង្រៀនដោយ៖ ${plan.taughtBy || 'លោកគ្រូ អ្នកគ្រូ'}`, {
        x: '5%', y: '90%', w: '60%', h: '5%',
        fontSize: 10,
        fontFace: CONFIG.fontKhmer,
        color: CONFIG.colorTextMuted
      });

      // Right side: Slide index
      slide.addText(`${String(index + 1).padStart(2, '0')} / ${String(plan.slides!.length).padStart(2, '0')}`, {
        x: '80%', y: '90%', w: '15%', h: '5%',
        fontSize: 11,
        fontFace: CONFIG.fontKhmer,
        color: CONFIG.colorTextMuted,
        align: 'right',
        bold: true
      });
    });
  }

  // Save the PPTX file
  const fileName = `ស្លាយ_${plan.title || 'មេរៀន'}`;
  pptx.writeFile({ fileName: `${fileName}.pptx` });
};
