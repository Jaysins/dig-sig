import React, { useRef, useState, useMemo } from 'react';
import PdfViewer from './PdfViewer';
import SignaturePad from './SignaturePad';
import { addSignatureToPdf } from '../../utils/pdfModificationUtils';

interface PdfEditorProps {
    pdfUrl: string;
}

const PdfEditor: React.FC<PdfEditorProps> = ({ pdfUrl }) => {
    const sigCanvas = useRef<SignaturePad>(null);
    const [modifiedPdf, setModifiedPdf] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSavePdf = async (signatureImage: string) => {
        try {
            console.log('loaddinf..')
            setLoading(true);

            const originalPdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
            console.log('orgi', originalPdfBytes)
            const modifiedPdfBytes = await addSignatureToPdf(originalPdfBytes, signatureImage);
            console.log('moadid', modifiedPdfBytes)

            setModifiedPdf(modifiedPdfBytes);
            setLoading(false);
        } catch (err) {
            setError('Error modifying PDF');
            setLoading(false);
            console.error(err);
        }
    };
    const pdfViewer = useMemo(() => <PdfViewer pdfUrl={pdfUrl} />, [pdfUrl, modifiedPdf]);
    const signaturePad = useMemo(() => <SignaturePad onSign={(signatureImage) => handleSavePdf(signatureImage)} />, [modifiedPdf === null]);
    return (
        <div>
            {modifiedPdf === null && pdfViewer}
            {modifiedPdf === null && signaturePad}
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {modifiedPdf && (
                <a
                    href={`data:application/pdf;base64,${modifiedPdf}`}
                    download="modified.pdf"
                >
                    Download Modified PDF
                </a>
            )}        </div>
    );
};

export default PdfEditor;
