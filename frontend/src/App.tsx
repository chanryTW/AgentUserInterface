import { useState, useRef, useEffect } from 'react';
import { connectAGUI, type AGUIEvent } from './lib/ag-ui';
import { DynamicRenderer } from './components/registry';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UIComponent {
  name: string;
  props: any;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeComponent, setActiveComponent] = useState<UIComponent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeComponent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setActiveComponent(null);

    await connectAGUI('http://localhost:8000/agent', userMessage, (event: AGUIEvent) => {
      if (event.type === 'message') {
        setMessages(prev => {
          // Simple deduplication or appending logic could go here if needed
          return [...prev, { role: 'assistant', content: event.content }];
        });
      } else if (event.type === 'update_ui') {
        setActiveComponent({ name: event.component, props: event.props });
      }
    });

    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar / Chat Area */}
      <div className="w-96 flex flex-col border-r border-gray-200 bg-white shadow-sm z-10">
        <div className="p-6 border-b border-gray-100 bg-white">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            AG-UI Demo
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Agentic User Interface</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-10 px-6">
              <p className="mb-2">👋 Welcome!</p>
              <p className="text-sm">Try asking for a <span className="font-bold text-gray-600">table</span>, <span className="font-bold text-gray-600">form</span>, or <span className="font-bold text-gray-600">card</span>.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none flex space-x-1 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your request..."
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Main Content / Dynamic UI Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-50/50">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none"></div>

        <div className="h-full w-full flex items-center justify-center p-12 overflow-y-auto relative z-0">
          {activeComponent ? (
            <div className="w-full max-w-5xl animate-fade-in flex justify-center">
              <DynamicRenderer
                componentName={activeComponent.name}
                props={activeComponent.props}
              />
            </div>
          ) : (
            <div className="text-center space-y-4 max-w-md">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082m0 0a24.301 24.301 0 01-2.538.119m2.538-.119L19.8 15.3m0 0l-4.5 4.5m4.5-4.5l-4.5-4.5m-9 9l-4.5-4.5m4.5 4.5l4.5-4.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Dynamic UI Canvas</h2>
              <p className="text-gray-500 leading-relaxed">
                This area will display rich UI components generated by the agent based on your conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
