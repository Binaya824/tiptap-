'use client'
import { useState, useRef, useEffect } from "react";

const PAGE_WIDTH = 800;
const PAGE_HEIGHT = 1100;
const MARGIN = 50;
const CONTENT_HEIGHT = PAGE_HEIGHT - 2 * MARGIN;

const PageEditor = () => {
  const [documentData, setDocumentData] = useState([
    { id: 1, type: "paragraph", content: "", x: MARGIN, y: MARGIN }
  ]);
  const textAreaRef = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderDocument();
  }, [documentData]);

  const handleInput = (e) => {
    const newText = e.target.value;
    setDocumentData([{ ...documentData[0], content: newText }]);
  };

  const splitTextIntoLines = (text, maxWidth, ctx) => {
    const words = text.split(" ");
    let lines: string[] = [];
    let line = "";

    words.forEach((word) => {
      let testLine = line + word + " ";
      let metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth) {
        lines.push(line);
        line = word + " ";
      } else {
        line = testLine;
      }
    });

    if (line) lines.push(line);
    return lines;
  };

  const paginateContent = (blocks, ctx) => {
    let pages: { id: number; type: string; content: string; x: number; y: number; lines: string[] }[][] = [];
    let currentPage: { id: number; type: string; content: string; x: number; y: number; lines: string[] }[] = [];
    let currentHeight = MARGIN;

    blocks.forEach((block) => {
      let lines = splitTextIntoLines(block.content, PAGE_WIDTH - 2 * MARGIN, ctx);
      let blockHeight = lines.length * 20;

      if (currentHeight + blockHeight > CONTENT_HEIGHT) {
        pages.push(currentPage);
        currentPage = [];
        currentHeight = MARGIN;
      }

      currentPage.push({ ...block, lines });
      currentHeight += blockHeight;
    });

    if (currentPage.length) pages.push(currentPage);
    return pages;
  };

  const renderDocument = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element is not available.");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context.");
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000";

    const pages = paginateContent(documentData, ctx);

    pages.forEach((page, pageIndex) => {
      let y = MARGIN;

      page.forEach((block) => {
        block.lines.forEach((line) => {
          ctx.fillText(line, MARGIN, y);
          y += 20;
        });
      });

      if (pageIndex < pages.length - 1) {
        ctx.beginPath();
        ctx.moveTo(0, PAGE_HEIGHT);
        ctx.lineTo(PAGE_WIDTH, PAGE_HEIGHT);
        ctx.stroke();
      }
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={textAreaRef}
        onInput={handleInput}
        style={{
          position: "absolute",
          top: MARGIN,
          left: MARGIN,
          opacity: 0,
          pointerEvents: "none",
          width: "300px",
          height: "30px",
          border: " 1px solid blue"
        }}
      />
      <canvas ref={canvasRef} width={PAGE_WIDTH} height={PAGE_HEIGHT} className="border border-red-600" />
    </div>
  );
};

export default PageEditor;
