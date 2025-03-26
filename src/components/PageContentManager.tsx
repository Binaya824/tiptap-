import React, { useRef, useEffect, useState } from 'react';
import { debounce } from 'lodash'; // For performance optimization
import Tiptap from './Tiptap';

// Define your Tiptap ref type
type TiptapRefType = {
  editor: any;
  getContent: () => string;
  setContent: (html: string) => void;
};

const PageContentManager = () => {
  const [page_array, setPageArray] = useState<string[]>(['', '']); // Initial pages
  const leftTiptapRefs = useRef<Array<React.RefObject<TiptapRefType | null>>>([]);
  const pageRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([]);
  
  // Initialize refs
  useEffect(() => {
    leftTiptapRefs.current = Array(page_array.length)
      .fill(null)
      .map(() => React.createRef<TiptapRefType>());
      
    pageRefs.current = Array(page_array.length)
      .fill(null)
      .map(() => React.createRef<HTMLDivElement>());
  }, [page_array.length]);

  // Content redistribution logic
  const redistributeContent = debounce(() => {
    // Skip if we don't have at least 2 pages
    if (page_array.length < 2) return;

    // Process each page
    for (let i = 0; i < page_array.length; i++) {
      const currentPageRef = pageRefs.current[i].current;
      const currentEditorRef = leftTiptapRefs.current[i].current;
      
      if (!currentPageRef || !currentEditorRef) continue;
      
      // Check if current page has overflow
      const isOverflowing = detectOverflow(currentPageRef);
      
      if (isOverflowing && i < page_array.length - 1) {
        // Handle overflow - move content to next page
        moveOverflowToNextPage(i);
      } else if (!isOverflowing && i > 0) {
        // Check if we can pull content from next page
        tryPullContentFromNextPage(i);
      }
    }
  }, 300);

  // Detect if a page is overflowing
  const detectOverflow = (element: HTMLDivElement): boolean => {
    // Compare scrollHeight to clientHeight
    return element.scrollHeight > element.clientHeight;
  };

  // Move overflow content to the next page
  const moveOverflowToNextPage = (pageIndex: number) => {
    const currentEditor = leftTiptapRefs.current[pageIndex].current;
    const nextEditor = leftTiptapRefs.current[pageIndex + 1].current;
    
    if (!currentEditor || !nextEditor) return;
    
    // This is where the complex part happens:
    // 1. Find the overflowing node
    // 2. Split the content at appropriate point
    // 3. Move overflow to next page
    
    // For simplicity in this example, we'll use a binary search approach
    // to find approximately where to split the content
    const content = currentEditor.getContent();
    const pageElement = pageRefs.current[pageIndex].current;
    
    if (!pageElement) return;
    
    // Find split point through binary search
    const splitIndex = findSplitPoint(content, pageElement, currentEditor);
    
    if (splitIndex > 0) {
      // Split content
      const firstPart = content.substring(0, splitIndex);
      const secondPart = content.substring(splitIndex);
      
      // Set content for current page
      currentEditor.setContent(firstPart);
      
      // Prepend overflow to next page's content
      const nextContent = nextEditor.getContent();
      nextEditor.setContent(secondPart + nextContent);
    }
  };

  // Try to pull content from next page if there's space
  const tryPullContentFromNextPage = (pageIndex: number) => {
    const currentEditor = leftTiptapRefs.current[pageIndex].current;
    const nextEditor = leftTiptapRefs.current[pageIndex + 1].current;
    
    if (!currentEditor || !nextEditor) return;
    
    const nextContent = nextEditor.getContent();
    if (!nextContent) return; // Nothing to pull
    
    // Try to pull content by gradually increasing amounts
    // until we detect overflow or run out of content to pull
    const currentContent = currentEditor.getContent();
    const pageElement = pageRefs.current[pageIndex].current;
    
    if (!pageElement) return;
    
    // Find how much content we can pull
    const pullAmount = findPullAmount(currentContent, nextContent, pageElement, currentEditor);
    
    if (pullAmount > 0) {
      // Pull content from next page
      const contentToPull = nextContent.substring(0, pullAmount);
      const remainingNextContent = nextContent.substring(pullAmount);
      
      // Update both pages
      currentEditor.setContent(currentContent + contentToPull);
      nextEditor.setContent(remainingNextContent);
    }
  };

  // Find where to split content using binary search (simplified)
  const findSplitPoint = (content: string, pageElement: HTMLDivElement, editor: TiptapRefType): number => {
    // This is a simplified approach
    // A more sophisticated approach would work at the DOM level
    
    let low = 0;
    let high = content.length;
    let lastValid = 0;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      editor.setContent(content.substring(0, mid));
      
      // Check if it fits
      if (detectOverflow(pageElement)) {
        high = mid - 1;
      } else {
        lastValid = mid;
        low = mid + 1;
      }
    }
    
    // Reset content
    editor.setContent(content);
    return lastValid;
  };

  // Find how much content we can pull from next page (simplified)
  const findPullAmount = (
    currentContent: string, 
    nextContent: string, 
    pageElement: HTMLDivElement, 
    editor: TiptapRefType
  ): number => {
    // Similar to findSplitPoint but for pulling content
    let low = 0;
    let high = nextContent.length;
    let lastValid = 0;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      editor.setContent(currentContent + nextContent.substring(0, mid));
      
      // Check if it fits
      if (detectOverflow(pageElement)) {
        high = mid - 1;
      } else {
        lastValid = mid;
        low = mid + 1;
      }
    }
    
    // Reset content
    editor.setContent(currentContent);
    return lastValid;
  };

  // Monitor changes in any editor
  useEffect(() => {
    const setupContentListeners = () => {
      leftTiptapRefs.current.forEach((ref, index) => {
        const editor = ref.current?.editor;
        if (editor) {
          editor.on('update', () => {
            // When content changes, schedule content redistribution
            redistributeContent();
          });
        }
      });
    };
    
    // Set up listeners after a short delay to ensure editors are initialized
    const timer = setTimeout(setupContentListeners, 500);
    return () => clearTimeout(timer);
  }, [page_array]);

  // Add a new page when needed
  const addNewPage = () => {
    setPageArray([...page_array, '']);
  };

  return (
    <div className="document-container">
      {page_array.map((content, index) => (
        <div 
          key={index} 
          ref={pageRefs.current[index]} 
          className="page"
          style={{
            height: '842px', // A4 height in pixels at 96 DPI
            width: '595px',  // A4 width
            overflow: 'hidden', // Important - hide overflow
            position: 'relative',
            margin: '20px auto',
            padding: '40px',
            border: '1px solid #ddd',
            backgroundColor: 'white',
          }}
        >
          <Tiptap 
            content={content} 
            ref={leftTiptapRefs.current[index]} 
            editable={true}
          />
        </div>
      ))}
      
      <button onClick={addNewPage}>Add Page</button>
      <button onClick={() => redistributeContent()}>Redistribute Content</button>
    </div>
  );
};

export default PageContentManager;