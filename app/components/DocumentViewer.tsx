import { renderAsync } from "docx-preview";import { useEffect, useRef } from "react";

type Props = {
  title: string;
  file: File | null;
};

export default function DocumentViewer({ title, file }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDocx =
    file &&
    (file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx"));

  useEffect(() => {
    if (!isDocx || !containerRef.current) return;

    const loadDoc = async () => {
      const buffer = await file.arrayBuffer();

      containerRef.current!.innerHTML = "";

      await renderAsync(buffer, containerRef.current!);
    };

    loadDoc();
  }, [file, isDocx]);

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="border-b px-5 py-4">
        <h3 className="font-semibold">{title}</h3>
      </div>

      <div className="h-[700px] bg-slate-100 mt-4">
        {file && file.type === "application/pdf" && (
          <iframe
            src={URL.createObjectURL(file)}
            title="PDF Preview"
            className="w-full h-full"
          />
        )}
        {isDocx && (
          <div
            ref={containerRef}
            className="h-[700px] overflow-auto bg-white p-6"
          />
        )}
      </div>
    </div>
  );
}
