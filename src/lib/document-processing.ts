import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx"
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

export async function extractTextContent(file: File, buffer: Buffer): Promise<string | null> {
  try {
    // Create temporary file
    const tempPath = join(tmpdir(), `${Date.now()}-${file.name}`)
    await writeFile(tempPath, buffer)

    let textContent: string | null = null

    try {
      if (file.type === 'application/pdf') {
        // Handle PDF files
        const loader = new PDFLoader(tempPath, {
          splitPages: false,
          parsedItemSeparator: "\n"
        })
        const docs = await loader.load()
        textContent = docs[0].pageContent
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.toLowerCase().endsWith('.docx')
      ) {
        // Handle DOCX files
        const loader = new DocxLoader(tempPath)
        const docs = await loader.load()
        textContent = docs[0].pageContent
      }
    } catch (error) {
      console.error("[TEXT_EXTRACTION_ERROR]", error)
      return null
    } finally {
      // Clean up temp file
      await writeFile(tempPath, '')
    }

    return textContent
  } catch (error) {
    console.error("[TEMP_FILE_ERROR]", error)
    return null
  }
} 