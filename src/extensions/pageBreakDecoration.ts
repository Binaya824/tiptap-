import { Extension, Editor } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const PAGE_HEIGHT = 1054; // Define page height

const PageBreakDecoration = Extension.create({
  name: 'pageBreakDecoration',

  onUpdate() {
    const editor = this.editor;
    const decorations: Decoration[] = [];
    const contentHeight = editor.view.dom.scrollHeight;
    const pageCount = Math.floor(contentHeight / PAGE_HEIGHT);

    console.log('Content Height:', contentHeight, 'Page Count:', pageCount);

    if (pageCount < 2) {
      console.warn("Not enough content to add multiple page breaks.");
      return;
    }

    for (let i = 1; i <= pageCount; i++) {
      const pageBreakPos = i * PAGE_HEIGHT;

      let adjustedPos = pageBreakPos + editor.view.dom.getBoundingClientRect().top;

      // Ensure adjustedPos is within bounds
      adjustedPos = Math.min(Math.max(adjustedPos, 0), editor.view.dom.scrollHeight - 10);

      // Find the nearest document position
      let posAtCoords = editor.view.posAtCoords({ left: 10, top: adjustedPos });

      // If posAtCoords is null, fallback to last character position
      const validPos = posAtCoords ? posAtCoords.pos : editor.state.doc.nodeSize - 2;

      console.log('Page Break:', { pageBreakPos, adjustedPos, posAtCoords, validPos });

      if (validPos > 0 && validPos < editor.state.doc.nodeSize) {
        decorations.push(
          Decoration.widget(validPos, () => {
            const hr = document.createElement('hr');
            hr.className = 'page-break-divider';
            hr.style.border = 'none';
            hr.style.borderTop = '2px dashed #ccc';
            hr.style.margin = '20px 0';
            hr.style.width = '100%';
            return hr;
          })
        );
      } else {
        console.warn("Skipping invalid page break position:", validPos);
      }
    }

    editor.view.setProps({
      decorations: (state) => DecorationSet.create(state.doc, decorations),
    });
  },
});

export default PageBreakDecoration;
