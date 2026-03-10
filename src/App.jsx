import { useState, useRef, useEffect } from 'react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null); 
  
  const fileInputRef = useRef(null);
  const outputRef = useRef(null);

  // Auto-scroll to output when extraction finishes on mobile
  useEffect(() => {
    if (!isLoading && extractedText && outputRef.current && window.innerWidth < 1024) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading, extractedText]);

  const processImage = async (file) => {
    setIsLoading(true);
    setExtractedText('');
    setIsCopied(false);
    setError(null); 

    const apiKey = import.meta.env.VITE_OCR_API_KEY;
    if (!apiKey) {
      setError("API Configuration missing. Please check Vercel environment variables.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('apikey', apiKey);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2'); 

    try {
      const response = await fetch('https://api8.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();

      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage ? data.ErrorMessage[0] : 'Processing error');
      }

      const parsedText = data.ParsedResults?.[0]?.ParsedText || '';
      const cleanText = parsedText.trim();

      // Basic Noise Filter: If it's mostly symbols and very short, or just symbols on a long string (like shirt patterns)
      const hasLetters = /[a-zA-Z]/.test(cleanText);
      
      if (!cleanText || (!hasLetters && cleanText.length > 0)) {
        setError("No readable text found. Try a clearer image.");
      } else {
        setExtractedText(cleanText);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Connection timed out or failed. Please try a smaller image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(URL.createObjectURL(file));
      processImage(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(URL.createObjectURL(file));
      processImage(file);
    }
  };

  const handleCopy = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleReset = () => {
    setImage(null);
    setExtractedText('');
    setIsCopied(false);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; 
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
        
        <header className="border-b border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-[#0B0F19]/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              </div>
              <span className="font-bold text-lg tracking-tight">Extract<span className="text-indigo-600 dark:text-indigo-400">IQ</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              {image && (
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-white bg-red-500 hover:bg-red-600 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 dark:border dark:border-red-500/30 rounded-lg transition-all active:scale-95 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16"></path></svg>
                  <span className="hidden sm:inline">Clear Workspace</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
              
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-white dark:bg-[#111520] text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all duration-200 active:scale-95 shadow-sm"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Workspace</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Upload an image to securely extract its text contents.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* SOURCE CARD */}
            <div className={`flex flex-col bg-white dark:bg-[#111520] rounded-2xl border transition-all duration-500 overflow-hidden ${
              image 
                ? 'border-[#4f39f6] shadow-[0_0_20px_rgba(79,57,246,0.3)]' 
                : 'border-[#4f39f6]/30 shadow-sm'
            }`}>
              <div className="px-5 py-3 lg:px-6 lg:py-4 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Source Image
                </h2>
              </div>

              <div className="p-4 lg:p-6 flex-1 flex flex-col">
                <div
                  className={`relative flex-1 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[200px] lg:min-h-[300px] overflow-hidden group
                    ${isDragging ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                    ${image ? 'border-none p-0 bg-slate-100 dark:bg-[#0B0F19]' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={!image ? () => fileInputRef.current.click() : undefined}
                >
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                  
                  {image ? (
                    <div className="relative w-full h-full flex items-center justify-center group">
                      <img src={image} alt="Source" className="max-h-[200px] lg:max-h-[400px] object-contain" />
                      <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current.click()}
                      >
                        <span className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium text-sm border border-white/20 backdrop-blur-md">
                          Click to swap
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-6 lg:px-6 lg:py-8 flex flex-col items-center">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3 lg:mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1">Upload or drag & drop</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* OUTPUT CARD */}
            <div ref={outputRef} className={`flex flex-col bg-white dark:bg-[#111520] rounded-2xl border transition-all duration-500 overflow-hidden h-full min-h-[350px] lg:min-h-[400px] scroll-mt-20 ${
              extractedText 
                ? 'border-[#4f39f6] shadow-[0_0_20px_rgba(79,57,246,0.3)]' 
                : 'border-[#4f39f6]/30 shadow-sm'
            }`}>
              <div className="px-5 py-3 lg:px-6 lg:py-4 border-b border-slate-200 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-transparent">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${extractedText ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
                  Output
                </h2>
                
                <button
                  onClick={handleCopy}
                  disabled={!extractedText || isLoading}
                  className={`flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg transition-all active:scale-95 shadow-sm ${
                    !extractedText || isLoading
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : isCopied
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                  }`}
                >
                  {isCopied ? (
                    <><svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Copied</>
                  ) : (
                    <><svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copy Text</>
                  )}
                </button>
              </div>

              <div className="relative flex-1 bg-slate-50/50 dark:bg-[#0B0F19]/50 flex flex-col">
                
                {isLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-[#111520]/80 backdrop-blur-sm">
                    <div className="w-8 h-8 border-2 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">Running OCR Engine...</p>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center p-6 text-center">
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-5 flex items-center gap-4 max-w-sm shadow-xl shadow-red-500/5">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-red-900 dark:text-red-400 leading-none">Extraction Failed</h3>
                        <p className="text-xs text-red-700 dark:text-red-500/90 mt-1.5 leading-relaxed">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <textarea
                  className="flex-1 w-full p-4 lg:p-6 bg-transparent border-none focus:ring-0 resize-none outline-none text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed"
                  placeholder={image ? "" : "Extracted Text will be visible here.."}
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)} 
                  spellCheck="false"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;