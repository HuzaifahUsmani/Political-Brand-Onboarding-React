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

  // html2canvas 1.4 cannot parse oklch/oklab/lab/lch/color(). To convert
  // values returned by getComputedStyle that may contain them into safe
  // rgb() we render each color into an off-screen canvas pixel and read
  // it back. This handles every CSS color the browser understands.
  const probeCtx = (() => {
    const c = document.createElement('canvas');
    c.width = 1; c.height = 1;
    return c.getContext('2d', { willReadFrequently: true });
  })();

  const toRgb = (cssColor) => {
    if (!cssColor || cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') return cssColor;
    try {
      probeCtx.clearRect(0, 0, 1, 1);
      probeCtx.fillStyle = '#000';
      probeCtx.fillStyle = cssColor; // browser parses it
      probeCtx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data;
      return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    } catch {
      return cssColor;
    }
  };

  const UNSUPPORTED_RE = /\b(oklch|oklab|lab|lch|color\()/i;
  const COLOR_TOKEN_RE = /(oklch|oklab|lab|lch)\([^)]*\)|color\([^)]*\)|#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:[a-zA-Z]+)\b/g;

  const sanitizeMulti = (value) => {
    if (!value || !UNSUPPORTED_RE.test(value)) return value;
    return value.replace(/(oklch|oklab|lab|lch)\([^)]*\)|color\([^)]*\)/gi, (m) => toRgb(m));
  };

  // Force all elements to a settled, fully-visible state. Framer-motion
  // does not animate elements that are off-screen, so without this the
  // capture would render `initial={opacity:0}` everywhere.
  const flattenAnimations = (clonedRoot, sourceRoot) => {
    if (!clonedRoot || !sourceRoot) return;
    const clonedAll = [clonedRoot, ...clonedRoot.querySelectorAll('*')];
    const sourceAll = [sourceRoot, ...sourceRoot.querySelectorAll('*')];
    const len = Math.min(clonedAll.length, sourceAll.length);
    for (let i = 0; i < len; i += 1) {
      const c = clonedAll[i];
      const s = sourceAll[i];
      try {
        c.style.opacity = '1';
        c.style.transform = 'none';
        c.style.visibility = 'visible';
        c.style.filter = 'none';
        c.style.animation = 'none';
        c.style.transition = 'none';
      } catch { /* ignore */ }

      // Replace text gradients (-webkit-text-fill-color: transparent +
      // background-clip: text) with the element's gradient start color
      // so the text renders solid in the PDF.
      try {
        const cs = window.getComputedStyle(s);
        const fillColor = cs.webkitTextFillColor || cs.getPropertyValue('-webkit-text-fill-color');
        const bgClip = cs.webkitBackgroundClip || cs.getPropertyValue('background-clip') || cs.getPropertyValue('-webkit-background-clip');
        if (fillColor === 'rgba(0, 0, 0, 0)' || (typeof bgClip === 'string' && bgClip.includes('text'))) {
          // Pull a solid color out of the gradient if present.
          const bgImage = cs.backgroundImage || '';
          const match = bgImage.match(/(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}|oklch\([^)]*\)|oklab\([^)]*\))/);
          const solid = match ? toRgb(match[1]) : (toRgb(cs.color) || '#1C2E5B');
          c.style.webkitTextFillColor = solid;
          c.style.color = solid;
          c.style.backgroundImage = 'none';
          c.style.webkitBackgroundClip = 'border-box';
          c.style.backgroundClip = 'border-box';
        }
      } catch { /* ignore */ }
    }
  };

  // Strip StageContainer's decorative chrome (top dot-grid, absolute SVGs,
  // sticky nav bar, paddingTop spacer) from the clone so the PDF starts
  // cleanly at the title.
  const hideStageChrome = (clonedRoot) => {
    if (!clonedRoot) return;
    clonedRoot.querySelectorAll('.no-print, .dot-grid').forEach((el) => {
      try { el.style.display = 'none'; } catch { /* ignore */ }
    });
    // Top-level decorative SVGs that are absolutely positioned at top:0.
    clonedRoot.querySelectorAll('svg').forEach((el) => {
      const cs = window.getComputedStyle(el);
      if (cs.position === 'absolute' && parseFloat(cs.opacity) <= 0.05) {
        try { el.style.display = 'none'; } catch { /* ignore */ }
      }
    });
    // Drop the 72px paddingTop StageContainer adds.
    const stageWrapper = clonedRoot.querySelector('[style*="padding-top: 72px"], [style*="paddingTop: 72px"]');
    if (stageWrapper) {
      try { stageWrapper.style.paddingTop = '0'; } catch { /* ignore */ }
    }
  };

  const freezeColors = (clonedRoot, sourceRoot) => {
    if (!clonedRoot || !sourceRoot) return;
    const clonedAll = [clonedRoot, ...clonedRoot.querySelectorAll('*')];
    const sourceAll = [sourceRoot, ...sourceRoot.querySelectorAll('*')];
    const len = Math.min(clonedAll.length, sourceAll.length);
    for (let i = 0; i < len; i += 1) {
      const cs = window.getComputedStyle(sourceAll[i]);

      for (const prop of COLOR_PROPS) {
        const value = cs[prop];
        if (!value) continue;
        const safe = UNSUPPORTED_RE.test(value) ? toRgb(value) : value;
        try { clonedAll[i].style[prop] = safe; } catch { /* ignore */ }
      }

      const bgImage = cs.backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const safeBg = sanitizeMulti(bgImage);
        try { clonedAll[i].style.backgroundImage = safeBg; } catch { /* ignore */ }
      }

      const boxShadow = cs.boxShadow;
      if (boxShadow && boxShadow !== 'none') {
        const safeShadow = UNSUPPORTED_RE.test(boxShadow) ? 'none' : boxShadow;
        try { clonedAll[i].style.boxShadow = safeShadow; } catch { /* ignore */ }
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
        flattenAnimations(clonedNode, node);
        hideStageChrome(clonedNode);
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
