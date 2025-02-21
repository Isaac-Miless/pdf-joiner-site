"use server"

import { PDFDocument } from "pdf-lib"

export async function mergePDFs(formData: FormData) {
  try {
    const files = formData.getAll("pdfs") as File[]
    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices())
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }

    const mergedPdfBytes = await mergedPdf.save()
    return mergedPdfBytes
  } catch (error) {
    console.error("Error merging PDFs:", error)
    throw new Error("Failed to merge PDFs")
  }
}

