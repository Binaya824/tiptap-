import '@tiptap/core';
import { Editor } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setPageBreak: (position?: number) => ReturnType;
  }
}