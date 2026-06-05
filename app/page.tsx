"use client";

import { useState } from "react";
import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import LanguageSelector from "./components/LanguageSelector";
import DocumentViewer from "./components/DocumentViewer";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [translated, setTranslated] = useState(false);
  const [translatedFile, setTranslatedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState("French");

  const translateDocx = async () => {
    if (!file) return;
    setIsLoading(true);

    const formData = new FormData();

    formData.append("file", file);

    formData.append("language", lang);

    const response = await fetch("/api/translate", {
      method: "POST",
      body: formData,
    });

    const blob = await response.blob();
    setTranslatedFile(blob as File);
    setIsLoading(false);
  };

  const downloadFileHander = () =>{
    const url = URL.createObjectURL(translatedFile as Blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "translated.docx";

    a.click();

    URL.revokeObjectURL(url);
  }

  const handleFileUpload = async (selectedFile: File) => {
    setFile(selectedFile);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <UploadZone file={file} onFileSelect={handleFileUpload} />

        <LanguageSelector setLang={setLang} />

        <div className="flex justify-center gap-5 mt-5" >
          {isLoading ? (
            "loading..."
          ) : (
            <button
              onClick={translateDocx}
              className="rounded-xl bg-black px-8 py-3 text-white font-medium hover:bg-neutral-800"
            >
              Translate Document
            </button>
          )}
          
          <button
            className="rounded-xl border px-8 py-3 font-medium text-black"
            onClick={downloadFileHander}
          >
            Download Translation
          </button>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2 text-black">
          {file && <DocumentViewer title="Original Document" file={file} />}
          {translatedFile && (
            <DocumentViewer title="Translated Document" file={translatedFile} />
          )}
        </div>
      </div>
    </main>
  );
}
