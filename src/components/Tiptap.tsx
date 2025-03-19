"use client";

import { useImperativeHandle , forwardRef, useEffect } from "react";
import { useEditor, EditorContent, Content } from "@tiptap/react";
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

const PAGE_HEIGHT = 1054; // Define the page height constant
const TAG_INTERVAL = 100;

const Tiptap = forwardRef(({ content , editable = true }: { content: string , editable?: boolean } , ref ) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(PAGE_HEIGHT);
  const lastTagCountRef = useRef<number>(0);

  // const insertTags = (editor: any, height: number) => {
  //   if (!editor) return; // Ensure editor is not null

  //   // console.log("height =======>  ", height);
  //   if (height > 0) {
  //     const tagCount = Math.floor(height / PAGE_HEIGHT) + 1;
  //     if (tagCount === lastTagCountRef.current) return;

  //     const tags = [];
  //     const state = editor.state;
  //         let targetPos = state.doc.content.size; // Default to end

  //         // Find the last paragraph, heading, or list item in the document
  //         state.doc.descendants((node, pos) => {
  //             if (
  //                 node.type.name === "paragraph" ||
  //                 node.type.name === "heading" ||
  //                 node.type.name === "list_item"
  //             ) {
  //                 targetPos = pos; // Update target position to last meaningful block
  //             }
  //         });
  //     for (let h = 0; h <= height; h += PAGE_HEIGHT) {
  //       // tags.push({
  //       //   type: 'pageBreak',
  //       //   attrs: { height: h },
  //       // });
  //       const { tr } = editor.state;

  //             // Insert `pageBreak` at the last meaningful block position
  //             tr.insert(targetPos, editor.schema.nodes.pageBreak.create({ height: h }));

  //             // Mark the transaction so it does NOT get added to history
  //             tr.setMeta("addToHistory", false);

  //             // Apply the transaction manually
  //             editor.view.dispatch(tr);
  //     }

  //     // const currentContent = editor.getJSON();
  //     // const nonTagContent = currentContent.content?.filter((node: { type: string }) => node.type !== 'pageBreak') || [];

  //     // editor.chain().setContent({
  //     //   type: 'doc',
  //     //   content: [...tags, ...nonTagContent],
  //     // }).run();

  //     lastTagCountRef.current = tagCount;
  //   }
  // };

  const insertTags = (editor: any, height: number) => {
    if (!editor) return;

    const tagCount = Math.floor(height / PAGE_HEIGHT) - 1;
    if (tagCount === lastTagCountRef.current) return;

    const { state } = editor;
    const { tr } = state;
    

    let lastValidPos = 0; // Track last valid insert position

    for (let i = 1; i <= tagCount; i++) {
      let pageHeightMarker = i * PAGE_HEIGHT;

      console.log("pageHeightMarker %%%%%", pageHeightMarker);
      let targetPos = lastValidPos;
      let foundNodeAtMarker = false;

      // Iterate through document nodes to find the closest valid position
      state.doc.descendants((node: { type: { name: string } }, pos: number) => {
        if (
          pos >= pageHeightMarker &&
          ["paragraph", "heading", "list_item"].includes(node.type.name)
        ) {
          if (pos === pageHeightMarker) {
            console.log("node exactly at the height" , node)
            foundNodeAtMarker = true; // Node exactly at the height
          }
          targetPos = pos;
          return false; // Stop once we find a good position
        }
      });

      console.log("targetPos ************", targetPos);

      // If a node is exactly at the height, shift it down and insert pageBreak before it
      if (foundNodeAtMarker) {
        tr.insert(
          targetPos,
          editor.schema.nodes.pageBreak.create({ height: pageHeightMarker })
        );
        lastValidPos = targetPos + 1; // Move past the inserted break
      } else {
        // Insert pageBreak normally if no node was found exactly at height
        tr.insert(
          targetPos,
          editor.schema.nodes.pageBreak.create({ height: pageHeightMarker })
        );
        lastValidPos = targetPos;
      }
    }

    tr.setMeta("addToHistory", false);
    editor.view.dispatch(tr);

    lastTagCountRef.current = tagCount;
  };
  

  // const insertTags = (editor: any, height: number) => {
  //   if (!editor) return; // Ensure editor is not null

  //   console.log("editorHeight =======>  ", editorHeight);
  //   if (editorHeight > 0) {
  //     const tagCount = Math.floor(editorHeight / PAGE_HEIGHT);
  //     console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$",tagCount)
  //     if (tagCount === lastTagCountRef.current) return;

  //     const tags = [];
  //     for (let h = 0; h <= height; h += PAGE_HEIGHT) {
  //       tags.push({
  //         type: 'pageBreak',
  //         attrs: { height: h },
  //       });
  //     }

  //     const currentContent = editor.getJSON();
  //     const nonTagContent = currentContent.content?.filter((node: { type: string }) => node.type !== 'pageBreak') || [];

  //     editor.chain().setContent({
  //       type: 'doc',
  //       content: [...tags, ...nonTagContent],
  //     }).run();

  //     lastTagCountRef.current = tagCount;
  //   }
  // };

  const editor = useEditor({
    editorProps: {
      attributes: {
        style: `padding-left: 56px; padding-right: 56px; height: ${editorHeight}px;`,
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
      PageBreak,
    ],

    content: content,
    editable,
    onCreate({ editor }) {
      // insertTags(editor, editorHeight);
    },
    // onUpdate({ editor }) {
    //   console.log("editor called update --------------------------------");
    //   setTimeout(() => {
    //     const editorElement = editor.view.dom;
    //     const lastChild = editorElement.lastElementChild;

    //     if (!lastChild) return;

    //     const editorHeight = editorElement.clientHeight;

    //     const state = editor.state;
    //     let targetPos = state.doc.content.size; // Default to end

    //     // Find the last paragraph, heading, or list item in the document
    //     state.doc.descendants((node, pos) => {
    //       if (
    //         node.type.name === "paragraph" ||
    //         node.type.name === "heading" ||
    //         node.type.name === "list_item"
    //       ) {
    //         targetPos = pos; // Update target position to last meaningful block
    //       }
    //     });
    //     if ((lastChild as HTMLElement).offsetTop >= editorHeight - 40) {
    //       const { tr } = editor.state;

    //       // Insert `pageBreak` at the last meaningful block position
    //       tr.insert(
    //         targetPos,
    //         editor.schema.nodes.pageBreak.create({ height: editorHeight })
    //       );

    //       // Mark the transaction so it does NOT get added to history
    //       tr.setMeta("addToHistory", false);

    //       // Apply the transaction manually
    //       editor.view.dispatch(tr);
    //     }
    //   }, 50);
    // },
  });

  useImperativeHandle(ref, () => ({
    getContent: () => editor?.getHTML() || '',
    setContent: (newContent: string) => editor?.commands.setContent(newContent),
    editor, // Expose editor instance
  }), [editor]);
  

  useLayoutEffect(() => {
    const adjustHeight = () => {
      if (editorContainerRef.current) {
        const container = editorContainerRef.current;
        const editorDiv = container.querySelector('.ProseMirror');
        if (!editorDiv) return null;
        const lastElement = editorDiv.lastElementChild;
        console.log("lastElement ************", lastElement);
    
        if (lastElement) {
          const lastElementBottom = (lastElement as HTMLElement).offsetTop + (lastElement as HTMLElement).offsetHeight;
    
          // Find the smallest multiple of PAGE_HEIGHT greater than lastElementBottom
          let newHeight = Math.ceil(lastElementBottom / PAGE_HEIGHT) * PAGE_HEIGHT;
    
          if (newHeight !== editorHeight) {
            setEditorHeight(newHeight);
          }
    
          if (editor) {
            insertTags(editor, newHeight);
          }
        }
      }
    };
    
    

    adjustHeight(); // Run immediately after layout calculations

    // Observe mutations to adjust height dynamically
    const observer = new MutationObserver(adjustHeight);
    if (editorContainerRef.current) {
      observer.observe(editorContainerRef.current, {
        childList: true,
        subtree: true,
      });
    }

    return () => observer.disconnect();
  }, [content, editorHeight]);

  return (
    <div className="size-full overflow bg-[#F9FBFD] px-4 print:p-0 print:bg-white print:overflow-visible">
      <div className="min-w-max h-full flex justify-center w-[816px] py-4 print:py-0 mx-auto print:w-full print:min-w-0">
        <div
          className="paginated-content"
          ref={editorContainerRef}
          style={{ height: editorHeight }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
});

export default Tiptap;
