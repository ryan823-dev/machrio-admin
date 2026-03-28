import { useRef, useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  label?: string;
}

export default function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Enter content...',
  height = 400,
  label 
}: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const initOptions = useMemo(() => ({
    height,
    menubar: 'file edit insert view format table tools',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample'
    ],
    toolbar:
      'undo redo | blocks fontsize | bold italic backcolor forecolor | ' +
      'alignleft aligncenter alignright alignjustify | ' +
      'bullist numlist outdent indent | link image media table | ' +
      'removeformat codesample help',
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
    placeholder,
    setup: (editor: TinyMCEEditor) => {
      editorRef.current = editor;
    },
  }), [height, placeholder]);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ marginBottom: 8, fontWeight: 500, color: '#333' }}>
          {label}
        </div>
      )}
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}
        initialValue={value}
        init={initOptions}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
}