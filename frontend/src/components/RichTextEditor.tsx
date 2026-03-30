import { useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  label?: string;
  showMenu?: boolean;
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = '请输入内容...',
  height = 300,
  label,
  showMenu = true
}: RichTextEditorProps) {
  const [editorId] = useState(() => `tinymce_${Math.floor(Math.random() * 900000) + 100000}`);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  // Keep refs updated
  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  }, [onChange, value]);

  useEffect(() => {
    if (!window.tinymce || isInitializedRef.current) return;

    const initEditor = () => {
      if (!window.tinymce || isInitializedRef.current) return;

      const textarea = document.getElementById(editorId);
      if (!textarea) return;

      // Check if editor already exists
      const existingEditor = window.tinymce.get(editorId);
      if (existingEditor) {
        editorRef.current = existingEditor;
        isInitializedRef.current = true;
        return;
      }

      window.tinymce.init({
        selector: `#${editorId}`,
        license_key: 'gpl',
        language: 'zh_CN',
        language_url: '/tinymce/langs/zh_CN.js',
        height: height,
        menubar: showMenu ? 'file edit view insert format tools table help' : false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
          'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
        ],
        toolbar:
          'undo redo | blocks fontsize | bold italic underline strikethrough | ' +
          'forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist outdent indent | link image media table | codesample help',
        content_style: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 16px;
            line-height: 1.6;
            padding: 16px;
          }
          img { max-width: 100%; height: auto; }
          table { border-collapse: collapse; width: 100%; }
          table, th, td { border: 1px solid #ddd; padding: 8px; }
        `,
        branding: false,
        promotion: false,
        statusbar: true,
        skin: 'oxide',
        skin_url: '/tinymce/skins/ui/oxide',
        content_css: '/tinymce/skins/content/default/content.css',
        placeholder: placeholder,
        init_instance_callback: (editor: any) => {
          editorRef.current = editor;
          isInitializedRef.current = true;
          if (valueRef.current) {
            editor.setContent(valueRef.current);
          }
        },
        setup: (editor: any) => {
          editor.on('change', () => {
            const content = editor.getContent();
            if (onChangeRef.current) {
              onChangeRef.current(content);
            }
          });
        }
      });
    };

    // Try immediately
    initEditor();

    // Also try after a short delay (for tabs/conditional rendering)
    const timer1 = setTimeout(initEditor, 100);
    const timer2 = setTimeout(initEditor, 500);
    const timer3 = setTimeout(initEditor, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (window.tinymce && isInitializedRef.current) {
        try {
          window.tinymce.remove(`#${editorId}`);
        } catch (e) {
          // Ignore cleanup errors
        }
        editorRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [editorId, height, showMenu, placeholder]);

  // Handle external value changes
  useEffect(() => {
    if (editorRef.current && isInitializedRef.current && value !== undefined) {
      const currentContent = editorRef.current.getContent();
      if (currentContent !== value) {
        editorRef.current.setContent(value || '');
      }
    }
  }, [value]);

  return (
    <div style={{ width: '100%' }} ref={containerRef}>
      {label && (
        <div style={{ marginBottom: 8, fontWeight: 500, color: '#333' }}>
          {label}
        </div>
      )}
      <textarea
        id={editorId}
        style={{ width: '100%', minHeight: height, visibility: 'hidden' }}
        defaultValue={value}
      />
    </div>
  );
}