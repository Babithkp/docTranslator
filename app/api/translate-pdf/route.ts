// app/api/translate/route.ts

import { NextRequest } from "next/server";
import * as deepl from "deepl-node";
import fs from "fs/promises";
import path from "path";
import os from "os";

const translator = new deepl.Translator(
  process.env.DEEPL_API_KEY!
);

export async function POST(req: NextRequest) {
  let inputPath = "";
  let outputPath = "";

  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const targetLang =
      (formData.get("targetLang") as string) ||
      "EN-US";

    if (!file) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    const bytes = await file.arrayBuffer();

    inputPath = path.join(
      os.tmpdir(),
      `${Date.now()}-${file.name}`
    );

    outputPath = path.join(
      os.tmpdir(),
      `translated-${Date.now()}-${file.name}`
    );

    await fs.writeFile(
      inputPath,
      Buffer.from(bytes)
    );

    await translator.translateDocument(
      inputPath,
      outputPath,
      null,
      targetLang as deepl.TargetLanguageCode
    );

    const translatedBuffer =
      await fs.readFile(outputPath);

    const ext =
      path.extname(file.name) || ".pdf";

    return new Response(translatedBuffer, {
      headers: {
        "Content-Type":
          "application/octet-stream",
        "Content-Disposition": `attachment; filename="translated${ext}"`,
      },
    });
  } catch (error) {
    console.error("DeepL Error:", error);

    if (
      error instanceof
      deepl.DocumentTranslationError
    ) {
      console.error(
        "Document Handle:",
        error.documentHandle
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Translation failed",
      },
      { status: 500 }
    );
  } finally {
    try {
      if (inputPath) {
        await fs.unlink(inputPath);
      }
    } catch {}

    try {
      if (outputPath) {
        await fs.unlink(outputPath);
      }
    } catch {}
  }
}