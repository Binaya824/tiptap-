'use client'

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import CustomParagraph from '@/extensions/customParagraph';
import CustomBulletList from '@/extensions/customBulletList';
import CustomOrderedList from '@/extensions/customOrderedList';
import CustomListItem from '@/extensions/customListItem';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import PageBreak from '@/extensions/pageBreak';

const PAGE_HEIGHT = 1054; // Define the page height constant
const TAG_INTERVAL = 100;

const Tiptap = ({ content }: { content: string }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(PAGE_HEIGHT);
  const lastTagCountRef = useRef<number>(0);


  const insertTags = (editor: any, height: number) => {
    if (!editor) return; // Ensure editor is not null
  
    console.log("height =======>  ", height);
    if (height > 0) {
      const tagCount = Math.floor(height / PAGE_HEIGHT) + 1;
      if (tagCount === lastTagCountRef.current) return;
  
      const tags = [];
      for (let h = 0; h <= height; h += PAGE_HEIGHT) {
        tags.push({
          type: 'pageBreak',
          attrs: { height: h },
        });
      }
  
      const currentContent = editor.getJSON();
      const nonTagContent = currentContent.content?.filter((node: { type: string }) => node.type !== 'pageBreak') || [];
  
      editor.chain().setContent({
        type: 'doc',
        content: [...tags, ...nonTagContent],
      }).run();
  
      lastTagCountRef.current = tagCount;
    }
  };
  
  const editor = useEditor({
    editorProps: {
      attributes: {
        style: `padding-left: 56px; padding-right: 56px; height: ${editorHeight}px;`,
        class: 'focus:outline-none print:border-0 bg-white border-[#C7C7C7] flex flex-col w-[816px] pt-10 pr-14 pb-10 cursor-text',
      },
    },
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        paragraph: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      CustomParagraph,
      CustomBulletList,
      CustomOrderedList,
      CustomListItem,
      PageBreak
    ],

    content: content,
    onCreate({ editor }) {
      insertTags(editor, editorHeight); // Initial tag insertion
    },
    onUpdate({ editor }) {
      setTimeout(() => {
        const editorElement = editor.view.dom; // The editor's container
        const lastChild = editorElement.lastElementChild; // Last element inside the editor

        if (!lastChild) return;

        // Calculate bottom offset
        const lastElementBottom = (lastChild as HTMLElement).offsetTop + (lastChild as HTMLElement).offsetHeight;
        const editorHeight = editorElement.clientHeight;

        console.log("Last Element Bottom:", lastElementBottom);
        console.log("Editor Height:", editorHeight);

        // If last element reaches the editor's height, insert a new node
        if ((lastChild as HTMLElement).offsetTop >= editorHeight - 40) {
          // insertTags(editor, editorHeight);
          editor.commands.insertContent({
            type: "pageBreak",
            attrs: { height: editorHeight }, // Insert tag at the calculated height
        });
        }
    }, 50); // Small timeout to ensure layout updates
    },
  });

  useLayoutEffect(() => {
    const adjustHeight = () => {
      if (editorContainerRef.current) {
        const currentHeight = editorContainerRef.current.scrollHeight;
        const newHeight = Math.ceil(currentHeight / PAGE_HEIGHT) * PAGE_HEIGHT; // Round up to the nearest multiple of 1054
        if (newHeight !== editorHeight) {
          setEditorHeight(newHeight);
        }
      }
    };

    adjustHeight(); // Run immediately after layout calculations

    // Observe mutations to adjust height dynamically
    const observer = new MutationObserver(adjustHeight);
    if (editorContainerRef.current) {
      observer.observe(editorContainerRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [content, editorHeight]);

  return (
    <div className="size-full overflow-x-auto bg-[#F9FBFD] px-4 print:p-0 print:bg-white print:overflow-visible">
      <div className="min-w-max h-full flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0">
        <div className="paginated-content" ref={editorContainerRef} style={{ height: editorHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default Tiptap;
