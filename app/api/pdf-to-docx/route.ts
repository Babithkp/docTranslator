import { NextRequest } from "next/server";
import ConvertAPI from "convertapi";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const tempPdfPath = path.join(os.tmpdir(), file.name);

    fs.writeFileSync(tempPdfPath, buffer);

    const convertapi = new ConvertAPI(
      process.env.CONVERTAPI_SECRET!
    );

    const result = await convertapi.convert(
      "docx",
      {
        File: tempPdfPath,
      },
      "pdf"
    );

    const savedFiles = await result.saveFiles(os.tmpdir());

    const docxBuffer = fs.readFileSync(savedFiles[0]);

    return new Response(docxBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition":
          'attachment; filename="converted.docx"',
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Conversion failed" },
      { status: 500 }
    );
  }
}