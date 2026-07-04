import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extracts selectable text from a PDF file blob.
 * @param pdfBlob The PDF file Blob.
 * @returns The extracted plain text.
 */
export async function extractTextFromPDF(pdfBlob: Blob): Promise<string> {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  
  // Load the document using the Uint8Array array buffer
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    disableFontFace: true, // Speeds up loading for simple text extraction
  });
  
  const pdf = await loadingTask.promise;
  let text = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    const strings = content.items
      .map((item: any) => item.str || '')
      .filter((str: string) => str.trim().length > 0);
      
    text += strings.join(' ') + '\n';
  }
  
  return text.trim();
}
