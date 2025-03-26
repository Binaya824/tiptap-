'use client'
import PageEditor from '@/components/PageEditor'
import Tiptap from '@/components/Tiptap'
import React , { RefObject, useEffect, useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { page_array } from '@/constants/content'


type Props = {}
type TiptapRefType = {
  editor: any;
  getContent: () => string;
  setContent: (html: string) => void;
} | null;
const PAGE_HEIGHT = 1054;
const LINE_HEIGHT = 24; // Average line height in pixels for paragraphs (font-size ~16px)
const LIST_ITEM_HEIGHT = 28; // Slightly taller to account for bullets/numbers
const TABLE_ROW_HEIGHT = 32; // Rows in tables are taller due to padding
const DEFAULT_IMAGE_HEIGHT = 150; 

const page = (props: Props) => {

  const leftTiptapRefs = useRef<{ [key: number]: any }>({});
  const leftTiptapRef = useRef<{
    editor: any, getContent: () => string , setContent: (html: string) => void 
}  | null>(null)
  const rightTiptapRef = useRef<{
    editor: any, getContent: () => string 
} | null>(null)

  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

//   const handleSave = () => {
//     if (!leftTiptapRef.current || !rightTiptapRef.current) return;
  
//     const leftEditor = leftTiptapRef.current?.editor;  // Ensure editor instance exists
//     const rightEditor = rightTiptapRef.current?.editor;
  
//     if (!leftEditor || !rightEditor) {
//       console.error("Tiptap editor instance is not available.");
//       return;
//     }
  
//     // Parse right editor content to get the updated content
//     const parser = new DOMParser();
//     const rightDoc = parser.parseFromString(rightEditor.getHTML(), "text/html");
  
//     // Find the first element with a `data-id` (any element type)
//     const rightElement = rightDoc.querySelector("[data-id]");
//     if (!rightElement) {
//       console.log("No element with data-id found in right editor");
//       return;
//     }

//     console.log("rightElement", rightElement);
  
//     const dataId = rightElement.getAttribute("data-id"); // Get dynamic data-id
//     console.log("Replacing text of element with data-id:", dataId);

//     const rightJSON = rightEditor.getJSON();

//   // Find the specific node in rightEditor JSON with matching `data-id`
//     let newNodeContent: { attrs: { [x: string]: string | null } } | null = null;
//     rightJSON.content.forEach((node: { attrs: { [x: string]: string | null } }) => {
//       if (node.attrs && node.attrs["data-id"] === dataId) {
//         newNodeContent = node;
//       }
//     });

//     console.log("newNodeContent))))))))))" , newNodeContent)

//     if (!newNodeContent) {
//       console.error("Matching node not found in right editor's JSON.");
//       return;
//     }

  
//     // Ensure Tiptap has focus before modifying content
//     leftEditor.commands.focus();
  
//     // Find the corresponding element in the left editor using ProseMirror's API
//     let found = false;
//     leftEditor.state.doc.descendants((node: {
//       nodeSize: number
//       type: any, attrs: { [x: string]: string | null } 
// }, pos: number) => {
//       if (node.attrs && node.attrs["data-id"] === dataId) {
//         leftEditor
//         .chain()
//         .focus()
//         .deleteRange({ from: pos, to: pos + node.nodeSize }) // Remove old content
//         .insertContentAt(pos, newNodeContent)
//         .run();
//         found = true;
//         return false; // Stop iteration once found
//       }
//       return true;
//     });
  
//     if (!found) {
//       console.log(`No matching element with data-id="${dataId}" found in left editor`);
//     }
//   };

  const handleSubmit=async(e: { preventDefault: () => void })=>{
    e.preventDefault()
    setLoading(true)
    console.log('submit ----->', prompt)
    const res = await axios.post('http://127.0.0.1:5000/api/model', {prompt , content: page_array.join()})
    console.log(res.data)
    const html = res.data.data.data.split('```')[1].replace('html\n', '')
    // console.log("html ------------------>", html)
    setResult(html)
    setLoading(false)
  }

  useEffect(() => {
    if (rightTiptapRef.current && rightTiptapRef.current.editor) {
      rightTiptapRef.current.editor.commands.setContent(result);
    }
  }, [result]);

  console.log("result ++++++++++++++++" , result)

  const getNodeHeight = (node: any) => {
    switch (node.type) {
        case "paragraph":
            return node.content ? node.content.length * LINE_HEIGHT : LINE_HEIGHT;
        case "heading":
            return 1.5 * LINE_HEIGHT;
        case "list_item":
            return node.content ? node.content.length * LIST_ITEM_HEIGHT : LIST_ITEM_HEIGHT;
        case "table":
            return node.attrs?.rows * TABLE_ROW_HEIGHT;
        case "image":
            return node.attrs?.height || DEFAULT_IMAGE_HEIGHT;
        default:
            return 0;
    }
};


  const splitList = (listNode: any, availableHeight: number) => {
    let remainingItems: any[] = [];
    let movedItems: any[] = [];
    let currentHeight = 0;

    for (const item of listNode.content) {
        const itemHeight = getNodeHeight(item);

        if (currentHeight + itemHeight > availableHeight) {
            movedItems.push(item);
        } else {
            remainingItems.push(item);
            currentHeight += itemHeight;
        }
    }

    // ✅ Keep the list structure intact (Don't remove the list, just split items)
    const remainingList = { ...listNode, content: remainingItems };
    const movedList = { ...listNode, content: movedItems };

    return [remainingList, movedList];
};


  const splitAtOverflow = (content: any, pageHeight: number) => {
    let accumulated: any[] = [];
    let moved: any[] = [];
    let currentHeight = 0;

    for (const node of content.content) {
        const nodeHeight = getNodeHeight(node);

        if (currentHeight + nodeHeight > pageHeight) {
            // 🛑 Special case: If it's a list, move only the overflowing items
            if (node.type === "bullet_list" || node.type === "ordered_list") {
                const [remainingList, movedList] = splitList(node, pageHeight - currentHeight);
                accumulated.push(remainingList);
                moved.push(movedList);
            }
            // 🛑 If it's a regular node (paragraph, image, etc.), move it fully
            else {
                moved.push(node);
            }
        } else {
            accumulated.push(node);
            currentHeight += nodeHeight;
        }
    }

    return [accumulated, moved];
};



const splitContent = (pageIndex: number) => {
  const currentEditor = leftTiptapRefs.current[pageIndex]?.editor;
  const nextEditor = leftTiptapRefs.current[pageIndex + 1]?.editor;

  if (!currentEditor || !nextEditor) return;

  const content = currentEditor.getJSON(); // Get structured ProseMirror JSON
  const [remaining, moved] = splitAtOverflow(content, PAGE_HEIGHT);

  currentEditor.commands.setContent({ type: "doc", content: remaining });
  nextEditor.commands.insertContentAt(0, { type: "doc", content: moved });
};


//   useEffect(() => {
//     console.log("splitig content started )))))))))))))))))))))))))))");
//     page_array.forEach((_, index) => {
//         const editor = leftTiptapRefs.current[index]?.current?.editor;
//         if (editor) {
//             const contentHeight = editor.view.dom.scrollHeight;
//             const pageHeight = PAGE_HEIGHT; // Set this based on your layout

//             if (contentHeight > pageHeight) {
//                 splitContent(index);
//             }
//         }
//     });
// });

const checkPagination = (index: number) => {
  console.log("Checking pagination for page:", index);
  const editor = leftTiptapRefs.current[index]?.editor;
  console.log("editor", editor);
  if (!editor) return;

  // setTimeout(() => { // Small delay to let Tiptap update the DOM
  // }, 100);
  const contentHeight = editor.view.dom.scrollHeight;
  console.log("content height", contentHeight);
  if (contentHeight > PAGE_HEIGHT) {
    console.log(`Splitting content at page ${index}`);
    splitContent(index);
  }
};
// useEffect(() => {
//   if (leftTiptapRefs.current.length === 0) {
//     leftTiptapRefs.current = page_array.map(() => createRef<TiptapRefType>());
//   }
// }, []);
  
  return (
    <>
    <form onSubmit={handleSubmit} className='flex flex-col gap-4 p-4 justify-center items-center'>
      <Input type="text" placeholder="Search" onChange={(e) => setPrompt(e.target.value)}/>
      <Button variant="secondary" type='submit' className='w-[5rem]'>
      {loading &&  <Loader2 className="animate-spin" />}
        AI Search</Button>

    </form>
    <div className='text-[11px] flex '>
    <Tiptap content={page_array.join("")} ref={leftTiptapRef} editable={true}/>


    {/* <div className="w-full h-full flex flex-col gap-4">

    {page_array.map((item, index) => (

    <Tiptap key={index} content={item}  ref={(el) => {
      leftTiptapRefs.current[index] = el; // Ensure ref is not null
    }}  editable={true} onUpdate={() => checkPagination(index)}/>
    ))}
    </div> */}

    {/* <button className='bg-blue-500 h-fit text-white text-2xl p-2 rounded-md' onClick={handleSave}>Save</button> */}

    {/* <Tiptap ref={rightTiptapRef} content={result}/> */}
    {/* <PageEditor/> */}
    </div>
    </>
  )
}

export default page