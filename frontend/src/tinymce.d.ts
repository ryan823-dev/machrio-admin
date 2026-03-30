declare global {
  interface Window {
    tinymce: {
      init: (options: any) => any[];
      remove: (selector: string) => void;
      get: (id: string) => any;
    };
  }
}

export {};