declare module 'tiptap-pagination-breaks' {
    interface PaginationOptions {
      pageHeight: number;
      pageWidth: number;
      pageMargin: number;
    }
  
    function Pagination(): any;
  
    namespace Pagination {
      function configure(options: PaginationOptions): any;
    }
    interface Commands<ReturnType> {
      setPageBreak: (position?: number) => ReturnType;
    }
  }
  