import {PDFDocument} from 'pdf-lib';

export const addSignatureToPdf = async (
    originalPdfBytes: ArrayBuffer,
    signatureImageBytes: string,
) => {
    const pdfDoc = await PDFDocument.load(originalPdfBytes);
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

    const firstPage = pdfDoc.getPages()[0];
    const { width, height } = firstPage.getSize();
    const imageSize = { width: 100, height: 50 };
        // Use default positioning
    firstPage.drawImage(signatureImage, {
            x: width - imageSize.width - 280,
            y: height - imageSize.height - 280,
            width: imageSize.width,
            height: imageSize.height,
        });

    return await pdfDoc.saveAsBase64();
};
