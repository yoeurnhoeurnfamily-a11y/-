/**
 * Utility to export an HTML element to a Word document (.doc)
 * with support for Khmer Unicode characters, image embedding (Base64 conversion),
 * custom inline editing support, and robust MS Word styling.
 */
export const exportElementToWord = async (elementId: string, filename: string = 'document') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Clone the element so we can safely sanitize it
  const clone = element.cloneNode(true) as HTMLElement;

  // 1. Convert all images to Base64 so they are embedded directly in the .doc file
  const images = clone.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => {
    return new Promise<void>((resolve) => {
      const src = img.getAttribute('src') || img.src;
      if (!src || src.startsWith('data:')) {
        resolve();
        return;
      }

      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = tempImg.naturalWidth || tempImg.width;
          canvas.height = tempImg.naturalHeight || tempImg.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(tempImg, 0, 0);
            const base64Data = canvas.toDataURL('image/png');
            img.src = base64Data;
          }
        } catch (e) {
          console.warn('Failed to convert image to base64 for Word export:', e);
        }
        resolve();
      };
      tempImg.onerror = () => {
        resolve();
      };
      tempImg.src = src;
    });
  });

  // Wait for all image conversions to finish
  await Promise.all(imagePromises);

  // 2. Remove any elements that shouldn't be in the export (like download buttons, helper tools, etc.)
  const elementsToRemove = clone.querySelectorAll('.no-export, .no-print, button');
  elementsToRemove.forEach(el => el.remove());

  // 3. Strip contenteditable attributes to ensure the downloaded document is clean
  clone.removeAttribute('contenteditable');
  clone.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
  });

  // Define HTML wrapper with XML namespace declarations for Microsoft Word & layout preservation
  const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Export HTML To Doc</title>
<!--[if gte mso 9]>
<xml>
  <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
</xml>
<![endif]-->
<style>
  /* Precise A4 Page Setup and Margins for MS Word */
  @page WordSection1 {
    size: 21.0cm 29.7cm; /* Standard A4 dimensions */
    margin: 1.0in 1.0in 1.0in 1.0in; /* Precise 1 inch margins for classic professional formatting */
    mso-header-margin: 0.5in;
    mso-footer-margin: 0.5in;
    mso-paper-source: 0;
  }
  div.WordSection1 {
    page: WordSection1;
  }
  
  /* Font and Typography Optimization for Khmer Unicode */
  body {
    font-family: 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Kantumruy Pro', 'Arial Unicode MS', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1e293b;
    mso-line-height-rule: exactly;
  }
  
  /* Table layout and grid conversion fallback for MS Word mobile/PC */
  table {
    width: 100% !important;
    max-width: 100% !important;
    border-collapse: collapse;
    margin-top: 15px;
    margin-bottom: 20px;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    mso-table-bspace: 0pt;
    mso-table-tspace: 0pt;
    table-layout: auto;
  }
  th, td {
    border: 1px solid #475569;
    padding: 10px;
    vertical-align: top;
    mso-border-alt: solid #475569 1.0pt;
    word-break: break-word;
  }
  th {
    background-color: #1e3a8a;
    color: #ffffff;
    font-weight: bold;
    text-align: center;
  }
  
  /* Convert modern Flex and CSS Grid to MS Word compatible Table views */
  .grid, .flex {
    display: table !important;
    width: 100% !important;
    border-collapse: collapse;
    margin-top: 10px;
    margin-bottom: 10px;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  .grid-cols-1 > *, .flex-col > * {
    display: block !important;
    width: 100% !important;
    margin-bottom: 10px;
  }
  .grid-cols-2 > * {
    display: table-cell !important;
    width: 50% !important;
    padding: 10px;
    vertical-align: top;
    border: 1px solid #e2e8f0;
    mso-border-alt: solid #e2e8f0 0.5pt;
  }
  .grid-cols-3 > * {
    display: table-cell !important;
    width: 33.33% !important;
    padding: 10px;
    vertical-align: top;
    border: 1px solid #e2e8f0;
    mso-border-alt: solid #e2e8f0 0.5pt;
  }
  .grid-cols-4 > * {
    display: table-cell !important;
    width: 25% !important;
    padding: 10px;
    vertical-align: top;
    border: 1px solid #e2e8f0;
    mso-border-alt: solid #e2e8f0 0.5pt;
  }
  .flex-row > * {
    display: table-cell !important;
    vertical-align: top;
    padding: 8px;
  }

  /* Image responsive rendering inside MS Word */
  img {
    max-width: 100% !important;
    height: auto !important;
    display: block;
    margin: 10px auto;
  }

  /* Khmer text specific displays */
  h1, .khmer-title {
    font-family: 'Khmer OS Muol Light', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
    font-size: 18pt;
    font-weight: bold;
    color: #1e3a8a;
    text-align: center;
    margin-bottom: 15px;
    line-height: 1.8;
  }
  h2 {
    font-family: 'Khmer OS Muol Light', 'Khmer OS Siemreap', 'Arial Unicode MS', sans-serif;
    font-size: 13pt;
    font-weight: bold;
    color: #1e3a8a;
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 6px;
    margin-top: 25px;
    margin-bottom: 15px;
    line-height: 1.6;
  }
  h3 {
    font-family: 'Khmer OS Siemreap', sans-serif;
    font-size: 11pt;
    font-weight: bold;
    color: #1e3a8a;
    margin-top: 15px;
    margin-bottom: 10px;
  }
  
  /* Tailwind Utility Mappings to keep backgrounds, colors and borders correct */
  .bg-blue-50, .bg-blue-50\\/30 { background-color: #f0f7ff !important; }
  .bg-blue-900 { background-color: #1e3a8a !important; color: #ffffff !important; }
  .bg-yellow-400 { background-color: #facc15 !important; }
  .bg-yellow-50 { background-color: #fefce8 !important; }
  .bg-white { background-color: #ffffff !important; }
  .bg-gray-50 { background-color: #f8fafc !important; }
  
  .text-blue-900 { color: #1e3a8a !important; }
  .text-blue-600 { color: #2563eb !important; }
  .text-gray-700 { color: #334155 !important; }
  .text-gray-600 { color: #475569 !important; }
  .text-gray-500 { color: #64748b !important; }
  .text-gray-400 { color: #94a3b8 !important; }
  .text-yellow-600 { color: #ca8a04 !important; }
  .text-emerald-600 { color: #059669 !important; }
  .text-red-600 { color: #dc2626 !important; }
  
  /* Borders and Dividers */
  .border-blue-900 { border: 2px solid #1e3a8a !important; }
  .border-blue-200 { border: 1px solid #bfdbfe !important; }
  .border-gray-200 { border: 1px solid #e2e8f0 !important; }
  .border-b-8 { border-bottom: 6px double #1e3a8a !important; }
  .border-b-2 { border-bottom: 2px solid #e2e8f0 !important; }
  .border-double { border-style: double !important; }
  .border-dashed { border-style: dashed !important; }
  .border-2 { border-width: 2px !important; }
  .border-4 { border-width: 4px !important; }
  
  /* Spacing */
  .p-4 { padding: 10px !important; }
  .p-6 { padding: 15px !important; }
  .p-8 { padding: 20px !important; }
  .p-12 { padding: 30px !important; }
  .py-2 { padding-top: 5px !important; padding-bottom: 5px !important; }
  .px-6 { padding-left: 15px !important; padding-right: 15px !important; }
  .mb-6 { margin-bottom: 15px !important; }
  .mb-10 { margin-bottom: 25px !important; }
  .mb-12 { margin-bottom: 30px !important; }
  
  /* Helper classes */
  .text-center { text-align: center !important; }
  .text-right { text-align: right !important; }
  .font-bold, .font-black { font-weight: bold !important; }
  .italic { font-style: italic !important; }
  .list-decimal { margin-left: 20px; }
  .list-disc { margin-left: 20px; }
  
  ul, ol {
    margin-top: 5px;
    margin-bottom: 5px;
    padding-left: 20px;
  }
</style>
</head>
<body>
<div class="WordSection1">`;

  const postHtml = "</div></body></html>";
  const htmlContent = preHtml + clone.innerHTML + postHtml;
  
  // UTF-8 byte order mark (BOM) ensures Word reads characters in Khmer Unicode correctly
  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const fullFilename = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  const downloadLink = document.createElement("a");
  document.body.appendChild(downloadLink);

  // Use standard download link
  downloadLink.href = url;
  downloadLink.download = fullFilename;
  downloadLink.click();
  
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
};
