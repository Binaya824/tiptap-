// @/extensions/CustomTag.ts
import { Node } from '@tiptap/core';

const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  atom: true, // This is a standalone node

  addAttributes() {
    return {
      height: {
        default: 500, // Default height in pixels where the tag should appear
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.page-break',
      },
    ];
  },

  renderHTML({ node }) {
    return [
      'div',
      {
        class: 'page-break',
        style: `position: absolute; top: ${node.attrs.height}px; left: 56px; background: yellow; padding: 4px 8px; z-index: 10;`,
      },
      'This is a tag at 500px', // Customize the content
    ];
  },

  addNodeView() {
    return ({ node, editor }) => {
      // Get the editor's current height from the DOM (via the editor's view)
      const editorDom = editor.view.dom;
      const editorHeight = editorDom.scrollHeight; // Current content height

      // console.log("node.attrs.height -------->>>>>" , node.attrs.height)
      // console.log("editor height -------->>>>>" , editorHeight)
      // console.log("Math.ceil(editorHeight % 1054) === 0 -------->>>>>" , Math.floor(editorHeight % 1054))

     // Find the last <p> tag in the editor
    const allParagraphs = editorDom.querySelectorAll("p");
    // console.log("allParagraphs )))))))))))", allParagraphs);
    let lastParagraph = allParagraphs[allParagraphs.length - 1];

    let lastParagraphHeight = 0;
    let lastParagraphOffsetTop = 0;

    if (lastParagraph) {
      lastParagraphHeight = lastParagraph.getBoundingClientRect().height;
      lastParagraphOffsetTop = lastParagraph.offsetTop; // Position from the top of the editor

      // console.log("Last <p> height:", lastParagraphHeight);
      // console.log("Last <p> offsetTop:", lastParagraphOffsetTop);
    }

      // If height is 0, return a hidden div (instead of null, per your original code)
      if (node.attrs.height !== 0) {
        const dom = document.createElement('div');
        dom.className = 'page-break'; // Keeping your class name
        dom.style.top = `${node.attrs.height}px`;
        dom.style.left = '0';
        dom.style.background = '#f9fbfd';
        dom.style.padding = '8px 8px';
        dom.style.margin = "2rem 0"
        dom.style.position = 'absolute';
        dom.style.border = '2px solid red';
        dom.style.zIndex = '10';
        dom.style.width = '100%';
        return { dom };
      }
      const dom = document.createElement('div');
      dom.style.display = 'none'
      return { dom };
    };
  },
});

export default PageBreak;