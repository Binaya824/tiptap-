"use client";
import PageEditor from "@/components/PageEditor";
import Tiptap from "@/components/Tiptap";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader2, Search } from "lucide-react";
import { page_array } from "@/constants/content";
import FileUploader from "@/components/FileUploader";
import { motion } from "framer-motion";
import { SearchDialog } from "@/components/SearchDialog";

type Props = {};
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
    editor: any;
    getContent: () => string;
    setContent: (html: string) => void;
  } | null>(null);
  const rightTiptapRef = useRef<{
    editor: any;
    getContent: () => string;
  } | null>(null);

  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [htmlArray, setHtmlArray] = useState<string[]>([]);
  const [focusedPage, setFocusedPage] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [activeEditorIndex, setActiveEditorIndex] = useState(0);

  const handleSave = () => {
    console.log("Saving content...");
    if (!leftTiptapRefs.current[focusedPage - 1] || !rightTiptapRef.current)
      return;

    const leftEditor = leftTiptapRefs.current[focusedPage - 1]?.editor; // Ensure editor instance exists
    const rightEditor = rightTiptapRef.current?.editor;
    console.log("leftEditor", leftEditor.getHTML());

    if (!leftEditor || !rightEditor) {
      console.error("Tiptap editor instance is not available.");
      return;
    }

    // Parse right editor content to get the updated content
    const parser = new DOMParser();
    const rightDoc = parser.parseFromString(rightEditor.getHTML(), "text/html");

    // Find the first element with a `data-id` (any element type)
    const rightElements = rightDoc.querySelectorAll("[data-id]");
    if (!rightElements.length) {
      console.log("No elements with data-id found in right editor");
      return;
    }

    console.log("rightElements", rightElements);
    const match = result.match(/data-id="([^"]+)"/);

    // Extract the value if found
    const dataId = match ? match[1] : 0;

    console.log("Replacing text of element with data-id:", dataId);

    const rightJSON = rightEditor.getJSON();

    // Find the specific node in rightEditor JSON with matching `data-id`
    // Collect all nodes that match a `data-id`
    let newNodesContent: any[] = [];
    rightJSON.content.forEach(
      (node: { attrs: { [x: string]: string | null } }) => {
        if (
          node.attrs &&
          rightElements[0].getAttribute("data-id") === node.attrs["data-id"]
        ) {
          newNodesContent.push(node);
        }
      }
    );

    console.log("newNodeContent))))))))))", newNodesContent);

    if (!newNodesContent) {
      console.error("Matching node not found in right editor's JSON.");
      return;
    }

    // Ensure Tiptap has focus before modifying content
    leftEditor.commands.focus();

    // Find the corresponding element in the left editor using ProseMirror's API
    let found = false;
    leftEditor.state.doc.descendants(
      (
        node: {
          nodeSize: number;
          type: any;
          attrs: { [x: string]: string | null };
        },
        pos: number
      ) => {
        if (node.attrs && node.attrs["data-id"] === dataId) {
          leftEditor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + node.nodeSize }) // Remove old content
            .insertContentAt(pos, newNodesContent)
            .run();
          found = true;
          return false; // Stop iteration once found
        }
        return true;
      }
    );

    if (!found) {
      console.log(
        `No matching element with data-id="${dataId}" found in left editor`
      );
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log("submit ----->", prompt);
      const leftEditorContents = Object.values(leftTiptapRefs.current)
        .map((editorRef) => editorRef?.editor?.getHTML() || "") // Get HTML or empty string if unavailable
        .filter((html) => html.trim() !== ""); // Remove empty entries
      console.log("leftEditorContents", leftEditorContents);
      const res = await axios.post("https://immune-exactly-rat.ngrok-free.app/api/model", {
        prompt,
        content: leftEditorContents.join(""),
      });
      console.log(res.data);
      if (res.data.data.success) {
        const html = res.data.data.data.split("```")[1].replace("html\n", "");
        // console.log("html ------------------>", html)
        const match = html.match(/data-page="(\d+)"/);

        // Extract the value if found
        const dataPage = match ? match[1] : 0;
        setFocusedPage(parseInt(dataPage));
        setResult(html);
      }
    } catch (error) {
      console.log("error while submission", error);
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    if (rightTiptapRef.current && rightTiptapRef.current.editor) {
      rightTiptapRef.current.editor.commands.setContent(result);
    }
  }, [result]);

  useEffect(() => {
    const scrollToDataPage = (targetPage: number) => {
      const targetRef = Object.values(leftTiptapRefs.current).find((ref) => {
        if (ref?.editor) {
          const content = ref.editor.getHTML();
          return content.includes(`data-page="${targetPage}"`);
        }
        return false;
      });

      if (targetRef) {
        const editorDom = targetRef.editor.view.dom;
        const targetElement = editorDom.querySelector(
          `[data-page="${targetPage}"]`
        );

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };
    scrollToDataPage(focusedPage);
  }, [focusedPage]);

  const getActiveBlockNode = (editor) => {
    if (!editor) return null;

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    const node = $from.node($from.depth);
    return node ? node.toJSON() : null;
};

  useEffect(() => {
    console.log("updating active editor index", activeEditorIndex);
}, [leftTiptapRefs?.current[activeEditorIndex]?.editor]);  

 // Function to handle editor clicks
 const handleEditorClick = (index) => {
  console.log("index ============>>>>>>>>> " , index)
  setActiveEditorIndex(index);
};

  return (
    <>
      {htmlArray.length > 0 ? (
        <>
          <div className="flex h-screen relative justify-center">
            {/* Left Tiptap: Slides Left When Result Exists */}
            <motion.div
              className="h-full overflow-y-scroll flex flex-col gap-4"
              animate={{ x: result ? "0%" : "0%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {htmlArray.map((item, index) => (
                <div
                key={index}
                className={`editor-container ${activeEditorIndex === index ? "active-editor" : ""}`}
                onClick={() => handleEditorClick(index)}
            >
                <Tiptap
                    content={item}
                    ref={(el) => {
                        leftTiptapRefs.current[index] = el;
                    }}
                    editable={true}
                />
            </div>
              ))}
            </motion.div>

            {result && (
              <motion.div
                className="flex flex-col justify-center items-center"
                initial={{ x: "100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="h-full overflow-y-scroll w-full">
                  <Tiptap
                    ref={rightTiptapRef}
                    content={result}
                    editable={true}
                  />
                </div>
                <Button
                 variant="secondary"
                  className="cursor-pointer h-fit w-[90%] text-2xl p-2 rounded-md m-2"
                  onClick={handleSave}
                >
                  Save
                </Button>
              </motion.div>
            )}
          </div>
          <div className="absolute bottom-[3rem] right-[3rem]">
            <SearchDialog
              setHtmlArray={setHtmlArray}
              handleSubmit={handleSubmit}
              loading={loading}
              setPrompt={setPrompt}
              setResult={setResult}
              isDialogOpen={isDialogOpen}
              setIsDialogOpen={setIsDialogOpen}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <FileUploader setHtmlArray={setHtmlArray} />
        </div>
      )}
    </>
  );
};

export default page;
