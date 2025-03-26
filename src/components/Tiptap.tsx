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

const Tiptap = forwardRef(({ content , editable = true , onUpdate }: { content: string ; editable?: boolean ; onUpdate?: () => void} , ref ) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState(PAGE_HEIGHT);
  const lastTagCountRef = useRef<number>(0);
  let positions: any[] = [];
  

let isInsertingPageBreak = false;

const removePageBreaks = (editor: Editor) => {
  if (!editor || isInsertingPageBreak) return;
  
  isInsertingPageBreak = true;
  
  requestAnimationFrame(() => {
    try {
      const { state, view } = editor;
      
      // PHASE 1: Remove all existing page breaks
      let tr = state.tr;
      const pageBreakPositions: number[] = [];
      
      state.doc.descendants((node, pos) => {
        if (node.type.name === "pageBreak") {
          pageBreakPositions.push(pos);
        }
      });

      
      
      if (pageBreakPositions.length > 0) {
        // Remove in reverse order to avoid position shifting issues
        for (let i = pageBreakPositions.length - 1; i >= 0; i--) {
          const pos = pageBreakPositions[i];
          tr.delete(pos, pos + 1);
        }
        
        tr.setMeta("isPageBreakUpdate", true);
        tr.setMeta("addToHistory", false);
        
        view.dispatch(tr);
        console.log("Removed existing page breaks at positions:", pageBreakPositions);
        
        // Important: Allow a frame for DOM to update after removal
        // requestAnimationFrame(() => {
        //   // PHASE 2: Calculate new position and insert page break with clean DOM
        //   insertCleanPageBreak(editor);
        // });
      } 
    } catch (error) {
      console.error("Error in page break removal phase:", error);
      isInsertingPageBreak = false;
    }
  });
};
// const breakArray = [3681 , 7315];
// const breakArray = [3544 , 7315];
// const breakArray = [3794, 7314];
const breakArray = [3794, 7314];

// Separate function to insert page break after DOM has stabilized
const insertCleanPageBreak = (editor: Editor) => {
  try {
    const { state, view } = editor;
    // const PAGE_BREAK_HEIGHT = 1054;
    // const editorContent = view.dom;

    // let accumulatedHeight = 0;
    // let targetNode: HTMLElement | null = null;

    // for (let child of editorContent.children) {
    //   accumulatedHeight += (child as HTMLElement).offsetHeight;
    //   if (accumulatedHeight >= PAGE_BREAK_HEIGHT) {
    //     targetNode = child as HTMLElement;
    //     break;
    //   }
    // }

    // if (!targetNode) {
    //   console.log("No element found at height:", PAGE_BREAK_HEIGHT);
    //   return;
    // }

    // // Get ProseMirror position for the target node
    // let nodePos = view.posAtDOM(targetNode, 0);
    // let resolvedPos = state.doc.resolve(nodePos);

    // if (!resolvedPos.parent.isTextblock) {
    //   console.error("Target node is not a text block.");
    //   return;
    // }

    // const paraStart = resolvedPos.start();
    // const paraEnd = resolvedPos.end();

    // // ✅ Find the closest position at 1054px
    // let low = paraStart;
    // let high = paraEnd;
    // let bestPos = paraStart;

    // while (low <= high) {
    //   let mid = Math.floor((low + high) / 2);
    //   let coords = view.coordsAtPos(mid);

    //   if (coords.top >= PAGE_BREAK_HEIGHT) {
    //     bestPos = mid;
    //     high = mid - 1;
    //   } else {
    //     low = mid + 1;
    //   }
    // }

    // let targetPos = bestPos;
    // console.log("Calculated split position:", targetPos);

    // // ✅ Find the nearest space after targetPos to shift words
    // let resolvedTarget = state.doc.resolve(targetPos);
    // let textNode = resolvedTarget.parent.textContent;
    // let relativePos = targetPos - paraStart;

    // // Find the next space in the text
    // let nextSpaceIndex = textNode.slice(relativePos).search(/\s/);
    // if (nextSpaceIndex !== -1) {
    //   targetPos += nextSpaceIndex + 1; // Move to after the space
    // }

    // resolvedTarget = state.doc.resolve(targetPos);

    // // ✅ Validate final position before inserting the page break
    // if (targetPos <= paraStart || targetPos >= paraEnd) {
    //   console.error("Invalid split position:", targetPos);
    //   return;
    // }

    // // ✅ Perform the split
    const tr = state.tr;
    
    // // Move text after `targetPos` to a new paragraph after the page break
    // const textAfterBreak = state.doc.textBetween(targetPos, paraEnd);
    // if (textAfterBreak.trim().length > 0) {
    //   tr.insert(targetPos, state.schema.nodes.paragraph.create({}, state.schema.text(textAfterBreak)));
    //   tr.delete(targetPos, paraEnd);
    // }

    // ✅ Insert the page break
    const pageBreakNode = editor.schema.nodes.pageBreak.create();
    // tr.insert(3681, pageBreakNode);
    // tr.setMeta("isPageBreakUpdate", true);
    // tr.setMeta("addToHistory", false);

    // tr.insert(7315, pageBreakNode);
    // tr.setMeta("isPageBreakUpdate", true);
    // tr.setMeta("addToHistory", false);

    breakArray.forEach((position) => {
      tr.insert(position, pageBreakNode);
      tr.setMeta("isPageBreakUpdate", true);
      tr.setMeta("addToHistory", false);
    });

    view.dispatch(tr);
    console.log("Inserted page break at:", 3787);
  } catch (error) {
    console.error("Error in page break insertion:", error);
  }
};

 
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

    onCreate: ({ editor }) => {

      
  //     let page_height = 2108;
  //     let editor_width = 704; // Change this based on actual editor width
  //     let spaceBetween = 0;
  //     let positions: any[] = [];
  //     const tagCount = Math.floor(editorHeight / page_height);
  //     console.log(editorHeight , "tag count : !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" , tagCount)

  //     function getCharsPerLine(ctx: CanvasRenderingContext2D, text: string | any[], editor_width: number) {
  //       let totalWidth = 0;
  //       let charsPerLine = 0;
    
  //       for (let i = 0; i < text.length; i++) {
  //           let charWidth = ctx.measureText(text[i]).width;
  //           if (totalWidth + charWidth > editor_width) {
  //               break; // Stop when width exceeds editor width
  //           }
  //           totalWidth += charWidth;
  //           charsPerLine++;
  //       }
    
  //       return charsPerLine;
  //   }

  //   function getTextDetailsFromDOM(text: string) {
  //     const textElements = editor.view.dom.querySelectorAll(".ProseMirror span, .ProseMirror p");
  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d")!;
  
  //     for (const element of textElements) {
  //         if (element.textContent?.includes(text)) {
  //             const el = element as HTMLElement;
  //             const computedStyle = window.getComputedStyle(el);
  //             ctx.font = `${parseFloat(computedStyle.fontSize)}px Arial`; 
  
  //             // Measure text width
  //             const textWidth = ctx.measureText(text).width;
  //             console.log("Text width:", textWidth, "Text:", text);
  
  //             // Get estimated characters per line
  //             const charsPerLine = getCharsPerLine(ctx, text, el.offsetWidth);
  //             const numLines = Math.ceil(text.length / charsPerLine);
  
  //             // Calculate total text block height
  //             const textBlockHeight = numLines * parseFloat(computedStyle.lineHeight);
  
  //             // Store character count for each line (without breaking words)
  //             let lines = [];
  //             let remainingText = text;
  
  //             while (remainingText.length > 0) {
  //                 let lineText = remainingText.slice(0, getCharsPerLine(ctx, remainingText, editor_width));
  
  //                 // Ensure we don’t break words
  //                 if (lineText.length < remainingText.length) {
  //                     let lastSpaceIndex = lineText.lastIndexOf(" ");
  //                     if (lastSpaceIndex !== -1) {
  //                         lineText = lineText.slice(0, lastSpaceIndex); // Cut at last space
  //                     }
  //                 }
  
  //                 lines.push({len:lineText.length, lineText});
  //                 remainingText = remainingText.slice(lineText.length).trim(); // Remove leading space
  //             }
  
  //             return {
  //                 fontSize: parseFloat(computedStyle.fontSize),
  //                 fontWeight: computedStyle.fontWeight,
  //                 color: computedStyle.color,
  //                 lineHeight: parseFloat(computedStyle.lineHeight),
  //                 textWidth,
  //                 textBlockHeight,
  //                 charsPerLine,
  //                 numLines,
  //                 lines,  // ✅ Each element represents characters in a line without word breaks
  //                 position: {
  //                     x: el.offsetLeft + window.scrollX,
  //                     y: el.offsetTop + window.scrollY,
  //                     width: el.offsetWidth,
  //                     height: el.offsetHeight,
  //                 },
  //                 viewportPosition: {
  //                     x: el.getBoundingClientRect().x,
  //                     y: el.getBoundingClientRect().y,
  //                     width: el.getBoundingClientRect().width,
  //                     height: el.getBoundingClientRect().height,
  //                 }
  //             };
  //         }
  //     }
  
  //     return null;
  // }
  
    
    
      
  //     // insertPageBreakAtHeight(editor)
  //     const editorContent = editor.getJSON();

  //     function extractContentWithPositions(doc:any) {
  //       let position = 0;
  //       const contentWithPositions:any[] = [];

  //       function traverse(node: { type: string; text: string ; content: any[]; }) {
  //         if (node.type === "text" && typeof node.text === "string") {
  //             const textInfo = getTextDetailsFromDOM(node.text);
  //             let foundPos: number | null = null;
  
  //             editor.state.doc.descendants((editorNode, pos) => {
  //                 if (foundPos !== null) return false; // Stop searching once found
  
  //                 if (editorNode.isText && editorNode.text && editorNode.text.includes(node.text)) {
  //                     let index = editorNode.text.indexOf(node.text);
  //                     foundPos = pos + index; // Calculate absolute position
  //                     return false; // Stop traversal
  //                 }
  
  //                 return true; // Continue traversal
  //             });
  
  //             contentWithPositions.push({
  //                 text: node.text,
  //                 pos: foundPos, // Now correctly assigned
  //                 textInfo
  //             });
  
  //             position += node.text.length;
  //         } else if (node.content) {
  //             node.content.forEach(traverse);
  //         }
  //     }

  //       traverse(doc);
  //       return contentWithPositions;
  //     }

  //     const calculateExactPos = (contentHeight: number , content:any , currentPos:number , currentPageHeight: number) => {
  //       let p = currentPos;
  //       let newHeight = currentPageHeight;
  //       for(let line in content.textInfo.lines){
  //         if (newHeight + content.textInfo.lineHeight > currentPageHeight) break;
  //         newHeight += content.textInfo.lineHeight;
  //         p += content.textInfo.lines[line].len;
  //         if(newHeight > contentHeight){
  //           break;
  //         }
  //       }

  //       console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ calculate exact pos" , {contentHeight , content , currentPos , currentPageHeight});

  //       console.log("calculated height and the position : ************", {newHeight , p});
  //     }

  //     const contentPositions = extractContentWithPositions(editorContent);
  //     console.log(contentPositions);

  //     // Function to get font size for each text node
  //     // let position = contentPositions[0].end;
  //     let content_height = contentPositions[0].textInfo.textBlockHeight;


  //     for (let i = 1; i < contentPositions.length; i++) {
  //       const currentElementPos = contentPositions[i].textInfo.position;
  //       const prevElementPos = contentPositions[i - 1].textInfo.position;
  //       const spaceBetween = (currentElementPos.y - (prevElementPos.y + prevElementPos.height))> 0 ? currentElementPos.y - (prevElementPos.y + prevElementPos.height):0;

  //       console.log("spaceBetween ************", spaceBetween);
  //       // console.log("position ************", position);

  //       if (content_height < page_height) {
  //         const estimatedNewHeight = content_height + spaceBetween + contentPositions[i].textInfo.textBlockHeight;

  //         if (estimatedNewHeight > page_height) {
  //           // console.log("current i position:  -------- " , i)
  //           //   console.log("Exact height before overflow:", content_height);
  //           //   console.log(" Exact position before overflow: ", contentPositions[i -1].pos);
  //           //   console.log("Exact content before overflow:", contentPositions[i -1]);
  //             calculateExactPos(content_height , contentPositions[i-1] , contentPositions[i -1].pos , page_height);
  //             break;
  //         }
  //         content_height += spaceBetween + contentPositions[i].textInfo.textBlockHeight;

  //         // position += (contentPositions[i].end - contentPositions[i].start);
  //         // console.log(`Text fitting: ${text} (Lines: ${numLines}) position: ${position}`);
  //         // console.log("position at the  content_height < page_height************>>>>>>>>>", position);
          
  //       } else {
  //         console.log("Reached Page Limit! Content Height:", content_height);
  //         // console.log("position ************", position);
  //         console.log("the overflow text : *********" ,i, "@@@@@@@@@@@@@@@", contentPositions[i-1].text)
  //         console.log("no of lines : *********" , contentPositions[i].textInfo.numLines)
  //         break;
  //       }

  //       // console.log("Current Content Height:", content_height);
  //     }
  //     insertPageBreakAtHeight(editor);

    },
    
  //    onUpdate: ({ editor, transaction }) => {
  //   // Check if this update was triggered by a page break operation
  //   if (transaction.getMeta("isPageBreakUpdate")) {
  //     // Skip processing - this update was from our page break operation
  //     console.log("Skipping onUpdate for page break transaction");
  //     return;
  //   }
  //   // Schedule transaction to avoid modifying the document inside onUpdate
  // setTimeout(() => {
  //   const tr = editor.view.state.tr; // Ensure fresh transaction state
  //   const { doc } = editor.view.state;
  //   let pageBreakPositions: number[] = [];

  //   // Find all existing page break nodes
  //   doc.descendants((node, pos) => {
  //     if (node.type.name === "pageBreak") {
  //       pageBreakPositions.push(pos);
  //     }
  //   });

  //   if (pageBreakPositions.length === 0) return; // No page breaks to remove

  //   // Remove page breaks from the end to the beginning to prevent position shift issues
  //   for (let i = pageBreakPositions.length - 1; i >= 0; i--) {
  //     tr.delete(pageBreakPositions[i], pageBreakPositions[i] + 1);
  //   }

  //   // Mark this transaction to prevent infinite loops
  //   tr.setMeta("isPageBreakUpdate", true);

  //   // Dispatch the transaction
  //   editor.view.dispatch(tr);
  //   requestAnimationFrame(() => {
  //     // insertPageBreakAtHeight(editor);
  //   });
  // }, 0); 
  //   // insertPageBreakAtHeight(editor);
    
  // }
    
    
  });

  useImperativeHandle(ref, () => {
    if (!editor) return {}; // Prevent exposing undefined editor
  
    return {
      getContent: () => editor.getHTML(),
      setContent: (newContent: string) => editor.commands.setContent(newContent),
      editor, 
    };
  }, [editor]);
  
  

  useLayoutEffect(() => {
    const adjustHeight = () => {
      if (editorContainerRef.current) {
        const container = editorContainerRef.current;
        const editorDiv = container.querySelector('.ProseMirror');
        if (!editorDiv) return null;
        const lastElement = editorDiv.lastElementChild;
        // console.log("lastElement ************", lastElement);
    
        if (lastElement) {
          const lastElementBottom = (lastElement as HTMLElement).offsetTop + (lastElement as HTMLElement).offsetHeight;
    
          // Find the smallest multiple of PAGE_HEIGHT greater than lastElementBottom
          let newHeight = Math.ceil(lastElementBottom / PAGE_HEIGHT) * PAGE_HEIGHT;
    
          if (newHeight !== editorHeight) {
            setEditorHeight(newHeight);
          }
    
        }
        // if (editor) {
        //   debouncedInsertPageBreak(editor);
        // }
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
  }, [content]);

  useEffect(() => {
    if(!editor) return;
    let page_height = 1054;
    let editor_width = 704; // Change this based on actual editor width
    let spaceBetween = 0;

    // requestAnimationFrame(() => {
    // });
    // removePageBreaks(editor);
    
    console.log("positions ************", positions);
    const tagCount = Math.floor(editorHeight / page_height) -1;
    console.log(editorHeight , "tag count : !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" , tagCount)

    function getCharsPerLine(ctx: CanvasRenderingContext2D, text: string | any[], editor_width: number) {
      let totalWidth = 0;
      let charsPerLine = 0;
  
      for (let i = 0; i < text.length; i++) {
          let charWidth = ctx.measureText(text[i]).width;
          if (totalWidth + charWidth > editor_width) {
              break; // Stop when width exceeds editor width
          }
          totalWidth += charWidth;
          charsPerLine++;
      }
  
      return charsPerLine;
  }

  function getTextDetailsFromDOM(text: string) {
    const textElements = editor?.view?.dom?.querySelectorAll(".ProseMirror span, .ProseMirror p") || [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    for (const element of textElements) {
        if (element.textContent?.includes(text)) {
            const el = element as HTMLElement;
            const computedStyle = window.getComputedStyle(el);
            ctx.font = `${parseFloat(computedStyle.fontSize)}px Arial`; 

            // Measure text width
            const textWidth = ctx.measureText(text).width;
            // console.log("Text width:", textWidth, "Text:", text);

            // Get estimated characters per line
            const charsPerLine = getCharsPerLine(ctx, text, el.offsetWidth);
            const numLines = Math.ceil(text.length / charsPerLine);

            // Calculate total text block height
            const textBlockHeight = numLines * parseFloat(computedStyle.lineHeight);

            // Store character count for each line (without breaking words)
            let lines = [];
            let remainingText = text;

            while (remainingText.length > 0) {
                let lineText = remainingText.slice(0, getCharsPerLine(ctx, remainingText, editor_width));

                // Ensure we don’t break words
                if (lineText.length < remainingText.length) {
                    let lastSpaceIndex = lineText.lastIndexOf(" ");
                    if (lastSpaceIndex !== -1) {
                        lineText = lineText.slice(0, lastSpaceIndex); // Cut at last space
                    }
                }

                lines.push({len:lineText.length, lineText});
                remainingText = remainingText.slice(lineText.length).trim(); // Remove leading space
            }

            return {
                fontSize: parseFloat(computedStyle.fontSize),
                fontWeight: computedStyle.fontWeight,
                color: computedStyle.color,
                lineHeight: parseFloat(computedStyle.lineHeight),
                textWidth,
                textBlockHeight,
                charsPerLine,
                numLines,
                lines,  // ✅ Each element represents characters in a line without word breaks
                position: {
                    x: el.offsetLeft + window.scrollX,
                    y: el.offsetTop + window.scrollY,
                    width: el.offsetWidth,
                    height: el.offsetHeight,
                },
                viewportPosition: {
                    x: el.getBoundingClientRect().x,
                    y: el.getBoundingClientRect().y,
                    width: el.getBoundingClientRect().width,
                    height: el.getBoundingClientRect().height,
                }
            };
        }
    }

    return null;
}

  
  
    
    // insertPageBreakAtHeight(editor)
    const editorContent = editor.getJSON();

    function extractContentWithPositions(doc:any) {
      let position = 0;
      const contentWithPositions:any[] = [];

      function traverse(node: { type: string; text: string ; content: any[]; }) {
        if (node.type === "text" && typeof node.text === "string") {
            const textInfo = getTextDetailsFromDOM(node.text);
            let foundPos: number | null = null;

            editor?.state.doc.descendants((editorNode, pos) => {
                if (foundPos !== null) return false; // Stop searching once found

                if (editorNode.isText && editorNode.text && editorNode.text.includes(node.text)) {
                    let index = editorNode.text.indexOf(node.text);
                    foundPos = pos + index; // Calculate absolute position
                    return false; // Stop traversal
                }

                return true; // Continue traversal
            });

            contentWithPositions.push({
                text: node.text,
                pos: foundPos, // Now correctly assigned
                textInfo
            });

            position += node.text.length;
        } else if (node.content) {
            node.content.forEach(traverse);
        }
    }

      traverse(doc);
      return contentWithPositions;
    }

    const calculateExactPos = (contentHeight: number , content:any , currentPos:number , currentPageHeight: number) => {
      let p = currentPos;
      let newHeight = contentHeight;
      console.log(" prev <<<<<<<<< calculated height and the position : ************", {contentHeight , p});

      
      for(let line in content.textInfo.lines){
        console.log(`${newHeight} + ${content.textInfo.lineHeight} > ${currentPageHeight}`, newHeight + content.textInfo.lineHeight > currentPageHeight)
        if (newHeight + content.textInfo.lineHeight > currentPageHeight) break;
        newHeight += content.textInfo.lineHeight;
        p += content.textInfo.lines[line].len;
        if(newHeight > contentHeight){
          break;
        }
      }

      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ calculate exact pos" , {contentHeight , content , currentPos , currentPageHeight});

      console.log("calculated height and the position : ************", {newHeight , p});
      positions.push(p)
      console.log("positions ************", positions);

      // requestAnimationFrame(() => {
      // });
      insertCleanPageBreak(editor);
    }

    const contentPositions = extractContentWithPositions(editorContent);
    console.log(contentPositions);

    // Function to get font size for each text node
    // let position = contentPositions[0].end;
    let content_height = contentPositions[0].textInfo.textBlockHeight;

    let estimatedHeight = 0
    for(let j = 0; j < tagCount; j++){
      // estimatedHeight = PAGE_HEIGHT * (j +1);
      
    }
    for (let i = 1; i < contentPositions.length; i++) {
      const currentElementPos = contentPositions[i].textInfo.position;
      const prevElementPos = contentPositions[i - 1].textInfo.position;
      const spaceBetween = (currentElementPos.y - (prevElementPos.y + prevElementPos.height))> 0 ? currentElementPos.y - (prevElementPos.y + prevElementPos.height):0;

      // console.log("spaceBetween ************", spaceBetween);
      // console.log("position ************", position);

      if (content_height < page_height) {
        const estimatedNewHeight = content_height + spaceBetween + contentPositions[i].textInfo.textBlockHeight;

        if (estimatedNewHeight > page_height) {
          // console.log("current i position:  -------- " , i)
          //   console.log("Exact height before overflow:", content_height);
          //   console.log(" Exact position before overflow: ", contentPositions[i -1].pos);
          //   console.log("Exact content before overflow:", contentPositions[i -1]);
            calculateExactPos(content_height , contentPositions[i] , contentPositions[i].pos , page_height);
            // break;
            page_height += PAGE_HEIGHT;
        }
        content_height += spaceBetween + contentPositions[i].textInfo.textBlockHeight;

        // position += (contentPositions[i].end - contentPositions[i].start);
        // console.log(`Text fitting: ${text} (Lines: ${numLines}) position: ${position}`);
        // console.log("position at the  content_height < page_height************>>>>>>>>>", position);
        
      }
      //  else {
      //   // console.log("Reached Page Limit! Content Height:", content_height);
      //   // console.log("position ************", position);
      //   // console.log("the overflow text : *********" ,i, "@@@@@@@@@@@@@@@", contentPositions[i-1].text)
      //   // console.log("no of lines : *********" , contentPositions[i].textInfo.numLines)
      //   break;
      // }

      // console.log("Current Content Height:", content_height);
    }
    // insertPageBreakAtHeight(editor);
  }, [editorHeight , editor])
  

  console.log("editorHeight ************", editorHeight);

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
