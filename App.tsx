import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImageDisplay } from './components/ImageDisplay';
import { GenerationConfig, GeneratedImage, BrandColor, VisualStyle, GraphicType, AspectRatioOption } from './types';
import { 
  BRAND_COLORS, 
  VISUAL_STYLES, 
  GRAPHIC_TYPES, 
  ASPECT_RATIOS 
} from './constants';
import { generateGraphic, refineGraphic } from './services/geminiService';
import { 
  AlertCircle, 
  Sun, 
  Moon, 
  HelpCircle, 
  X,
  Layout,
  PenTool,
  Palette,
  Plus,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Application State for Options (allows adding/removing)
  const [brandColors, setBrandColors] = useState<BrandColor[]>(BRAND_COLORS);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>(VISUAL_STYLES);
  const [graphicTypes, setGraphicTypes] = useState<GraphicType[]>(GRAPHIC_TYPES);
  const [aspectRatios, setAspectRatios] = useState<AspectRatioOption[]>(ASPECT_RATIOS);

  // Configuration State
  const [config, setConfig] = useState<GenerationConfig>({
    prompt: '',
    colorSchemeId: BRAND_COLORS[0].id,
    visualStyleId: VISUAL_STYLES[0].id,
    graphicTypeId: GRAPHIC_TYPES[0].id,
    aspectRatio: ASPECT_RATIOS[0].value
  });

  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to toggle body class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Grouped context for easier passing
  const context = { brandColors, visualStyles, graphicTypes, aspectRatios };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateGraphic(config, context);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (refinementText: string) => {
    if (!generatedImage) return;

    setIsGenerating(true);
    setError(null);
    try {
      const result = await refineGraphic(generatedImage, refinementText, config, context);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || 'Failed to refine image.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen font-sans transition-colors duration-200">
      
      {/* 1. Dedicated Header Row */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">
            🍌
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">BananaBrand</h1>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={() => setIsHelpOpen(true)}
             className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#21262d] rounded-lg transition-colors"
             title="Help"
           >
             <HelpCircle size={20} />
           </button>
           <button 
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#21262d] rounded-lg transition-colors"
             title="Toggle Theme"
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </div>
      </header>

      {/* 2. Toolbar & Controls */}
      <ControlPanel 
        config={config} 
        setConfig={setConfig} 
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        options={context}
        setOptions={{ setBrandColors, setVisualStyles, setGraphicTypes, setAspectRatios }}
      />

      {/* 3. Main Content Area */}
      <main className="flex-1 relative flex flex-col min-w-0 bg-gray-50 dark:bg-[#0d1117] transition-colors duration-200">
        
        {/* Error Toast */}
        {error && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-red-100 dark:bg-red-900/90 text-red-800 dark:text-red-100 px-4 py-3 rounded-lg shadow-lg border border-red-200 dark:border-red-800 flex items-center gap-2 animate-bounce-in backdrop-blur-sm">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 hover:bg-red-200 dark:hover:bg-red-800 p-1 rounded">
              ✕
            </button>
          </div>
        )}

        {/* Display */}
        <ImageDisplay 
          image={generatedImage} 
          onRefine={handleRefine}
          isRefining={isGenerating}
        />
      </main>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">How to use BananaBrand</h3>
              <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#30363d] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <p className="mb-4">
                BananaBrand helps you create consistent graphics for your brand using AI.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-[#21262d] rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Layout size={16} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Select Type:</strong> Choose what kind of graphic you need (e.g., Icon, Chart).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-[#21262d] rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                    <PenTool size={16} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Select Style:</strong> Pick a visual style that matches your brand guidelines.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-[#21262d] rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Palette size={16} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Select Colors:</strong> Enforce your brand's color palette.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-[#21262d] rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Plus size={16} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Custom Options:</strong> Add your own custom types, styles, or colors by clicking "Add Custom..." in any dropdown.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-[#21262d] rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Prompt:</strong> Describe what you want to see. Be specific!
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-gray-100 dark:bg-[#21262d] rounded-md text-indigo-600 dark:text-indigo-400 shrink-0">
                    <RefreshCw size={16} />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Refine:</strong> Once generated, use the text box below the image to ask for changes.
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex justify-end border-t border-gray-200 dark:border-[#30363d] pt-4">
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm shadow-lg shadow-indigo-500/20"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;