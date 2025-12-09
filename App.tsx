import React, { useState } from 'react';
import { LayoutDashboard, MessageSquare, Image, Mic, Menu, X, Github } from 'lucide-react';
import ChatTool from './components/ChatTool';
import ImageTool from './components/ImageTool';
import LiveTool from './components/LiveTool';
import { ToolType } from './types';
import { APP_NAME } from './constants';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const tools = [
    { id: ToolType.CHAT, name: 'Chat Assistant', icon: MessageSquare, desc: 'Advanced conversational AI for answering questions and writing.' },
    { id: ToolType.IMAGE, name: 'Image Studio', icon: Image, desc: 'Create stunning visuals from text descriptions instantly.' },
    { id: ToolType.LIVE, name: 'Live Voice', icon: Mic, desc: 'Real-time, low-latency voice conversation with Gemini.' },
  ];

  const renderContent = () => {
    switch (activeTool) {
      case ToolType.CHAT:
        return <ChatTool />;
      case ToolType.IMAGE:
        return <ImageTool />;
      case ToolType.LIVE:
        return <LiveTool />;
      default:
        return (
          <div className="flex flex-col h-full bg-gray-900 text-gray-100 rounded-lg overflow-y-auto">
            <div className="p-8 max-w-5xl mx-auto w-full">
              <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 mb-4">
                  Welcome to {APP_NAME}
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Experience the power of Google's Gemini API through our suite of next-generation tools.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className="group relative overflow-hidden bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-gray-500 transition-all duration-300 text-left hover:shadow-2xl hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gray-600 transition-colors">
                        <tool.icon className="w-6 h-6 text-gray-200" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{tool.name}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row text-gray-100 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center z-50">
         <span className="font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"/>
            {APP_NAME}
         </span>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
           {isSidebarOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative inset-y-0 left-0 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out z-40 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div 
            className="text-2xl font-bold mb-10 tracking-tight flex items-center gap-2 cursor-pointer hidden md:flex"
            onClick={() => setActiveTool(ToolType.DASHBOARD)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
               <span className="text-white text-sm font-bold">G</span>
            </div>
            {APP_NAME}
          </div>

          <nav className="flex-1 space-y-2">
            <button
              onClick={() => { setActiveTool(ToolType.DASHBOARD); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTool === ToolType.DASHBOARD 
                  ? 'bg-gray-800 text-white shadow-lg' 
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
              Tools
            </div>

            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => { setActiveTool(tool.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTool === tool.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <tool.icon className="w-5 h-5" />
                <span className="font-medium">{tool.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-800">
             <div className="flex items-center gap-3 px-4 py-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                API Connected
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-64px)] md:h-screen overflow-hidden p-2 md:p-6 relative">
        {renderContent()}
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
