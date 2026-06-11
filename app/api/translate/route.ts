import JSZip from "jszip";
import { DOMParser, XMLSerializer } from "xmldom";
import xpath from "xpath";
import { openai } from "@/app/lib/openai";

interface ParagraphInfo {
  textNodes: Node[];
  text: string;
}

function chunkArray<T>(
  array: T[],
  size: number
) {
  const chunks: T[][] = [];

  for (
    let i = 0;
    i < array.length;
    i += size
  ) {
    chunks.push(
      array.slice(i, i + size)
    );
  }

  return chunks;
}

function extractParagraphs(
  xml: string
) {
  const doc =
    new DOMParser().parseFromString(
      xml,
      "text/xml"
    );

  const paragraphNodes =
    xpath.select(
      "//*[local-name()='p']",
      doc
    ) as Node[];

  const paragraphs: ParagraphInfo[] =
    [];

  paragraphNodes.forEach(
    (paragraph) => {
      const textNodes =
        xpath.select(
          ".//*[local-name()='t']",
          paragraph
        ) as Node[];

      const text =
        textNodes
          .map(
            (node) =>
              node.textContent ?? ""
          )
          .join("");

      if (text.trim()) {
        paragraphs.push({
          textNodes,
          text,
        });
      }
    }
  );

  return {
    doc,
    paragraphs,
  };
}

async function translateBatch(
  paragraphs: string[],
  language: string
) {
  const response =
    await openai.responses.create({
      model: "gpt-4.1-mini",
      input: `
Translate every paragraph to ${language}.

Return ONLY JSON:

{
  "translations":[]
}

${JSON.stringify(paragraphs)}
`,
    });

  const cleaned =
    response.output_text
      .replace(
        /```json/g,
        ""
      )
      .replace(
        /```/g,
        ""
      )
      .trim();

  const parsed =
    JSON.parse(cleaned);

  return parsed
    .translations as string[];
}

function replaceParagraphText(
  paragraph: ParagraphInfo,
  translatedText: string
) {
  const nodes =
    paragraph.textNodes;

  if (nodes.length === 0) {
    return;
  }

  nodes[0].textContent =
    translatedText;

  for (
    let i = 1;
    i < nodes.length;
    i++
  ) {
    nodes[i].textContent = "";
  }
}

export async function POST(
  request: Request
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get(
        "file"
      ) as File;

    const language =
      formData.get(
        "language"
      ) as string;

    if (!file) {
      return Response.json(
        {
          error:
            "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const buffer =
      await file.arrayBuffer();

    const zip =
      await JSZip.loadAsync(
        buffer
      );

    const documentXmlFile =
      zip.file(
        "word/document.xml"
      );

    if (!documentXmlFile) {
      return Response.json(
        {
          error:
            "document.xml not found",
        },
        {
          status: 400,
        }
      );
    }

    const documentXml =
      await documentXmlFile.async(
        "string"
      );

    const {
      doc,
      paragraphs,
    } = extractParagraphs(
      documentXml
    );

    const translatedTexts: string[] =
      [];

    const chunks =
      chunkArray(
        paragraphs.map(
          (p) => p.text
        ),
        20
      );

    for (const chunk of chunks) {
      const translated =
        await translateBatch(
          chunk,
          language
        );

      translatedTexts.push(
        ...translated
      );
    }

    paragraphs.forEach(
      (paragraph, index) => {
        replaceParagraphText(
          paragraph,
          translatedTexts[
          index
          ] ??
          paragraph.text
        );
      }
    );

    const newXml =
      new XMLSerializer()
        .serializeToString(
          doc
        );

    zip.file(
      "word/document.xml",
      newXml
    );

    const translatedDocx =
      await zip.generateAsync({
        type: "arraybuffer",
      });

    return new Response(
      translatedDocx,
      {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition":
            'attachment; filename="translated.docx"',
        },
      }
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          "Translation failed",
      },
      {
        status: 500,
      }
    );
  }
}