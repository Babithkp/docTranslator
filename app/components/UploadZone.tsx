import { useRef } from "react";

type Props = {
    file: File | null;
    onFileSelect: (file: File) => void;
  };
  
  export default function UploadZone({
    file,
    onFileSelect,
  }: Props) {
    const uploadRef = useRef<HTMLInputElement>(null);
    const handleClick = () => {
        uploadRef.current?.click();
    };

    return (
      <button className="rounded-2xl border-2 border-dashed bg-white p-12 text-center w-full" onClick={handleClick}>
        <input
        className="hidden"
          type="file"
          accept=".pdf,.doc,.docx"
          ref={uploadRef as React.RefObject<HTMLInputElement>}
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) onFileSelect(selected);
          }}
        />
  
        <h2 className="mt-4 text-lg font-semibold">
          Upload PDF or DOCX
        </h2>
  
        <p className="text-slate-500">
          Drag & drop your file here
        </p>
  
        {file && (
          <p className="mt-4 font-medium text-green-600">
            {file.name}
          </p>
        )}
      </button>
    );
  }