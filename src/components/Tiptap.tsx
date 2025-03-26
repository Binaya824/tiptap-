"use client";

import { useImperativeHandle , forwardRef, useEffect } from "react";
import { useEditor, EditorContent, Content, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import CustomParagraph from "@/extensions/customParagraph";
import CustomBulletList from "@/extensions/customBulletList";
import CustomOrderedList from "@/extensions/customOrderedList";
import CustomListItem from "@/extensions/customListItem";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import PageBreak from "@/extensions/pageBreak";
import { Node, Fragment } from "@tiptap/pm/model";
import { debounce } from "lodash";

const PAGE_HEIGHT = 1054; // Define the page height constant
const TAG_INTERVAL = 100;

const Tiptap = forwardRef(({ content , editable = true , onUpdate , height }: { content: string ; editable?: boolean ; onUpdate?: () => void ; height?: number} , ref ) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(PAGE_HEIGHT);
  const lastTagCountRef = useRef<number>(0);
  let positions: any[] = [];
  



 
  const editor = useEditor({
    editorProps: {
      attributes: {
        style: `padding-left: 56px; padding-right: 56px; height: ${height || editorHeight}px;`,
        class:
          "focus:outline-none print:border-0 bg-white border-[#C7C7C7] flex flex-col w-[816px] pt-10 pr-14 pb-10 border cursor-text",
      },
      handleDOMEvents: {
        keydown: (view, event) => {
          if (event.ctrlKey && event.key === "z") {
            const { state } = view;
            const { selection } = state;
            if (!editor) return;

            // Check if the selection includes your specific node
            let isInsidePageBreak = false;
            state.doc.nodesBetween(selection.from, selection.to, (node) => {
              if (node.type.name === "pageBreak") {
                isInsidePageBreak = true;
              }
            });

            if (isInsidePageBreak) {
              event.preventDefault(); // Block undo action
              return true;
            }
          }
          return false;
        },
        click: (view, event) => {
          if (!editor || !view) return false; // Ensure view is defined
          
          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!coords) return false;
      
          const { state } = view;
          const node = state.doc.nodeAt(coords.pos);
      
          if (node && node.type.name === "pageBreak") {
            event.preventDefault(); // Block selection or interaction
            event.stopPropagation();
            view.dispatch(state.tr.setSelection(state.selection));
            return true;
          }
      
          return false;
        },
      },
    },
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        paragraph: false,
      }),
      CustomParagraph,
      CustomBulletList,
      CustomOrderedList,
      CustomListItem,
      PageBreak,
    ],

    content: content,
    editable,
    
  });

  useImperativeHandle(ref, () => {
    if (!editor) return {}; // Prevent exposing undefined editor
  
    return {
      getContent: () => editor.getHTML(),
      setContent: (newContent: string) => editor.commands.setContent(newContent),
      editor, 
    };
  }, [editor]);
  
  

  

  // console.log("editorHeight ************", editorHeight);

  return (
    <div className=" h-fit size-full overflow bg-[#F9FBFD] px-4 print:p-0 print:bg-white print:overflow-visible ">
      <div className="min-w-max h-full flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0">
        <div
          className="paginated-content"
          ref={editorContainerRef}
          style={{ height: height || editorHeight }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

export default Tiptap;
