// src/App.tsx
import React from 'react';
import PdfEditor from './components/PdfViewer/PdfEditor';
import PdfViewer from "./components/PdfViewer/PdfViewer";

const App: React.FC = () => {
  // Provide the URL of the PDF you want to display
  const pdfUrl = 'http://localhost:3000/modifiedPdf - 2024-02-02T195521.983.pdf';

  return (
      <div>
        <h1>PDF Editor</h1>
        <PdfViewer pdfUrl={pdfUrl} />
      </div>
  );
};

export default App;
