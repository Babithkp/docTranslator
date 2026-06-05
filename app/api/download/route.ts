import htmlToDocx from "html-to-docx";

export async function POST(
  request: Request
) {
  const { html } =
    await request.json();

  const documentHtml = `
    <html>
      <body>
        ${html}
      </body>
    </html>
  `;

  const docx = await htmlToDocx(
    documentHtml
  );
  
  if (docx instanceof Blob) {
    return new Response(
      await docx.arrayBuffer(),
      {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  
          "Content-Disposition":
            'attachment; filename="translated.docx"',
        },
      }
    );
  }
  
  return new Response(docx, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  
      "Content-Disposition":
        'attachment; filename="translated.docx"',
    },
  });
}