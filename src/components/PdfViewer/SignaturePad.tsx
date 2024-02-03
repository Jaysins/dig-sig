// SignaturePad.tsx

import React, { forwardRef, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

interface SignaturePadProps {
    onSign: (signatureImage: string) => void;
}


const SignaturePad: React.ForwardRefRenderFunction<SignatureCanvas, SignaturePadProps> =
    ({ onSign }) => {
        const sigCanvas = useRef<SignatureCanvas>(null);

        return (
            <div style={{'border': '1px solid'}}>
                <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
                />
                <button onClick={() => onSign(sigCanvas.current?.toDataURL('image/png') || '')}>
                    Save Signature
                </button>
            </div>
        );
    };

export default forwardRef(SignaturePad);
