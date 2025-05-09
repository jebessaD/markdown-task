"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { jsPDF } from "jspdf";

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(`# Test
- One
- Two

> Blockquotes look nice too
`);

  const [status, setStatus] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    if (!previewRef.current) return;

    try {
      // Get the HTML content from the preview
      const htmlContent = previewRef.current.innerHTML;

      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: "text/html" });
      const data = [new ClipboardItem({ "text/html": blob })];

      await navigator.clipboard.write(data);
      setStatus("Formatted content copied to clipboard!");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("Failed to copy formatted content: ", err);
      try {
        // Fallback to text-only copy
        await navigator.clipboard.writeText(markdown);
        setStatus("Text copied to clipboard!");
        setTimeout(() => setStatus(""), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        setStatus("Failed to copy");
        setTimeout(() => setStatus(""), 2000);
      }
    }
  };

  const exportToPDF = async () => {
    if (!previewRef.current) return;

    setStatus("Generating PDF...");

    try {
      // Dynamic import to reduce bundle size
      const { toPng } = await import("html-to-image");

      // Convert to high-quality PNG
      const dataUrl = await toPng(previewRef.current, {
        quality: 1,
        backgroundColor: "#ffffff",
        pixelRatio: 2, // Higher resolution
        cacheBust: true,
        filter: (node) => {
          // Skip any hidden elements
          if (node instanceof HTMLElement) {
            return node.style.display !== "none";
          }
          return true;
        },
      });

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("markdown-preview.pdf");

      setStatus("PDF downloaded!");
      setTimeout(() => setStatus(""), 2000);
    } catch (error) {
      console.error("Error generating PDF: ", error);
      setStatus("Failed to generate PDF");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            Real-Time Markdown Editor
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Markdown Input */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-gray-300 text-sm font-mono">
                  markdown.md
                </span>
              </div>
              <span className="text-gray-400 text-xs">Markdown</span>
            </div>
            <textarea
              className="w-full h-[70vh] p-4 font-mono text-gray-700 focus:outline-none resize-none bg-gray-50"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck="false"
            />
          </div>

          {/* HTML Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex space-x-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-gray-300 text-sm font-mono">
                  preview.html
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm flex items-center gap-1"
                  title="Copy formatted content"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm flex items-center gap-1"
                  title="Export to PDF"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  Export
                </button>
              </div>
            </div>
            <div ref={previewRef} className="p-6 h-[70vh] overflow-y-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ ...props }) => (
                    <h1
                      className="text-3xl font-bold my-4 border-b pb-2 border-gray-200"
                      {...props}
                    />
                  ),
                  h2: ({ ...props }) => (
                    <h2
                      className="text-2xl font-bold my-3 border-b pb-2 border-gray-200"
                      {...props}
                    />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="text-xl font-semibold my-2" {...props} />
                  ),
                  h4: ({ ...props }) => (
                    <h4 className="text-lg font-medium my-2" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="my-4 leading-relaxed" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="list-disc pl-6 my-4" {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol className="list-decimal pl-6 my-4" {...props} />
                  ),
                  li: ({ ...props }) => <li className="my-1" {...props} />,
                  code: ({ className, ...props }) => (
                    <pre className="bg-gray-800 rounded p-4 my-4 overflow-x-auto">
                      <code
                        className={`text-gray-100 font-mono text-sm ${className}`}
                        {...props}
                      />
                    </pre>
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="border-l-4 border-gray-400 pl-4 italic my-4 text-gray-600"
                      {...props}
                    />
                  ),
                  table: ({ ...props }) => (
                    <table
                      className="border-collapse border border-gray-300 my-4 w-full"
                      {...props}
                    />
                  ),
                  th: ({ ...props }) => (
                    <th
                      className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold"
                      {...props}
                    />
                  ),
                  td: ({ ...props }) => (
                    <td
                      className="border border-gray-300 px-4 py-2"
                      {...props}
                    />
                  ),
                  a: ({ ...props }) => (
                    <a
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  img: ({ ...props }) => (
                    <img
                      className="max-w-full h-auto my-4 rounded-lg"
                      {...props}
                    />
                  ),
                  hr: ({ ...props }) => (
                    <hr className="my-6 border-t border-gray-200" {...props} />
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
            {status && (
              <div className="px-4 py-2 text-sm text-gray-600 bg-gray-100 animate-fade-in">
                {status}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Built with Next.js, Tailwind CSS, and React Markdown</p>
        </div>
      </div>
    </div>
  );
}
