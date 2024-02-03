import React, {useEffect, useRef, useState} from 'react';
import {Document, Page, pdfjs} from 'react-pdf';
import Draggable from 'react-draggable';
import {PDFDocument, StandardFonts} from 'pdf-lib';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import {sign} from "node:crypto";

const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PdfViewerProps {
    pdfUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
    const [error,setError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfWidth, setPdfWidth] = useState<number>(0);
    const [pdfHeight, setPdfHeight] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isAddingSignature, setIsAddingSignature] = useState<boolean>(false);
    const [hasAddedSignature, setHasAddedSignature] = useState<boolean>(false);
    const [signatureText, setSignatureText] = useState<string>('');
    const [signaturePosition, setSignaturePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const signatureRef = useRef<HTMLDivElement>(null);
    const documentRef = useRef<any>(null); // Change the type to any

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (signatureRef.current && !signatureRef.current.contains(e.target as Node)) {
                setIsAddingSignature(false);
                setHasAddedSignature(true);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleError = (e: Error) => {
        setError(e.message);
    };

    const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleAddSignatureClick = () => {
        setIsAddingSignature(!isAddingSignature);
        setHasAddedSignature(false);
    };

    const handleSignatureInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSignatureText(e.target.value);
    };

    const handleDrag = (e: any, data: { x: number; y: number }) => {
        if (data.y > pdfHeight){
            data.y = data.y/currentPage
        }
        setSignaturePosition({ x: data.x, y: data.y });
        console.log(data)
    };

    const handleDownload = async () => {
        const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(pdfBytes);

        const pages = await pdfDoc.getPages();


        const currentPageIndex = currentPage - 1;
        const currentPageDimensions = pages[currentPageIndex].getSize();

        console.log(currentPageDimensions, signaturePosition)
        // Adjust the signature position based on the scaling factor
        const scale = pdfWidth / currentPageDimensions.width;
        const adjustedX = signaturePosition.x / scale;
        const adjustedY = (currentPageDimensions.height - signaturePosition.y) / scale;

        const currentPdfPage = pages[currentPageIndex];

        // Embed the Helvetica font
        const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        console.log(currentPage)

        console.log(currentPageDimensions.height)
        console.log(window.innerHeight)
        console.log(signaturePosition.y)

        currentPdfPage.drawText(signatureText, {
            x: signaturePosition.x + 20,
            y: ((currentPageDimensions.height - signaturePosition.y) * pages.length) - 30,
            font,
            size: 20
        });

        const modifiedPdfBytes = await pdfDoc.save();
        const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(modifiedPdfBlob);
        downloadLink.download = 'modifiedPdf.pdf';
        downloadLink.click();
    };


    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {error && <div>Error: {error}</div>}
            <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                <button onClick={handleAddSignatureClick}>
                    {isAddingSignature ? 'Hide Signature Box' : 'Show Signature Box'}
                </button>
                <div ref={documentRef} style={{ position: 'relative' }}>
                    <Document file={pdfUrl} onLoadSuccess={handleLoadSuccess}>
                        {(isAddingSignature || hasAddedSignature) && (
                            <Draggable
                                onDrag={handleDrag}
                                defaultPosition={{ x: signaturePosition.x, y: signaturePosition.y }}
                                bounds="parent" // Restrict to the parent container (the PDF page)
                                nodeRef={signatureRef}
                            >
                                <div
                                    ref={signatureRef}
                                    style={{
                                        position: 'absolute',
                                        zIndex: 1000,
                                        background: isAddingSignature ? 'rgba(255, 255, 255, 0.7)' : 'transparent',
                                        padding: '20px',
                                        border: isAddingSignature ? '1px solid black' : 'none',
                                    }}
                                >
                                    <input
                                        type="text"

                                        placeholder="Enter your name"
                                        value={signatureText}
                                        onChange={handleSignatureInputChange}
                                    />
                                </div>
                            </Draggable>
                        )}

                        {[...Array(numPages)].map((_, index) => (
                            <div key={`page_${index + 1}`} style={{ position: 'relative' }}>
                                <Page
                                    pageNumber={index + 1}
                                    onLoadSuccess={(pdf) => {
                                        console.log("heriiii==.", pdf.height)
                                        setPdfWidth(pdf.width)
                                        setPdfHeight(pdf.height)
                                        setNumPages(pdf.pageNumber)
                                    }}
                                    onRenderSuccess={() => handlePageChange(index + 1)}
                                />
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
            <div>Current Page: {currentPage}</div>
            <button onClick={handleDownload}>Download PDF with Signature</button>
        </div>
    );
};

export default PdfViewer;
