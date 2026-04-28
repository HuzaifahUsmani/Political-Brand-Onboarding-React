import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Capture a DOM node containing the Visual Identity Review and render it
 * to a multi-page A4 PDF that visually matches the on-screen layout.
 *
 * Tailwind 4 emits modern color functions (oklch/lab/color-mix) that
 * html2canvas 1.4 cannot parse and which cause it to throw silently.
 * To avoid that, before capture we walk the cloned DOM and freeze every
 * computed color/background/border into plain rgb() inline styles.
 */
export async function generateBrandPDF(node, fileName = 'brand-report.pdf') {
  if (!node) throw new Error('generateBrandPDF: node is required');

  await new Promise((r) => requestAnimationFrame(() => r()));
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { /* noop */ }
  }

  const COLOR_PROPS = [
    'color',
    'backgroundColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'fill',
    'stroke',
    'columnRuleColor',
    'textDecorationColor',
    'caretColor',
  ];

  const freezeColors = (clonedRoot, sourceRoot) => {
    if (!clonedRoot || !sourceRoot) return;
    const clonedAll = [clonedRoot, ...clonedRoot.querySelectorAll('*')];
    const sourceAll = [sourceRoot, ...sourceRoot.querySelectorAll('*')];
    const len = Math.min(clonedAll.length, sourceAll.length);
    for (let i = 0; i < len; i += 1) {
      const cs = window.getComputedStyle(sourceAll[i]);
      for (const prop of COLOR_PROPS) {
        const value = cs[prop];
        if (value && value !== 'rgba(0, 0, 0, 0)' && !value.includes('oklch') && !value.includes('color(')) {
          try { clonedAll[i].style[prop] = value; } catch { /* ignore */ }
        } else if (value) {
          try { clonedAll[i].style[prop] = value; } catch { /* ignore */ }
        }
      }
      // Also freeze background-image gradients which can contain oklch.
      const bgImage = cs.backgroundImage;
      if (bgImage && bgImage !== 'none' && !bgImage.includes('oklch') && !bgImage.includes('color(')) {
        try { clonedAll[i].style.backgroundImage = bgImage; } catch { /* ignore */ }
      }
    }
  };

  let canvas;
  try {
    canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: node.scrollWidth,
      windowHeight: node.scrollHeight,
      ignoreElements: (el) =>
        el.classList && (el.classList.contains('no-print') || el.dataset?.noPrint === 'true'),
      onclone: (clonedDoc, clonedNode) => {
        freezeColors(clonedNode, node);
      },
    });
  } catch (err) {
    console.error('html2canvas failed:', err);
    throw err;
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, imgWidth, imgHeight);
  } else {
    const pxPerPage = Math.floor((pageHeight * canvas.width) / pageWidth);
    let yOffset = 0;
    let pageIndex = 0;

    while (yOffset < canvas.height) {
      const sliceHeight = Math.min(pxPerPage, canvas.height - yOffset);

      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const ctx = slice.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      const sliceImgHeight = (sliceHeight * imgWidth) / canvas.width;
      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, imgWidth, sliceImgHeight);

      yOffset += sliceHeight;
      pageIndex += 1;
    }
  }

  pdf.save(fileName);
  return pdf;
}
