import { useState, useRef, useEffect } from 'react';
import { connectAGUI, type AGUIEvent } from './lib/ag-ui';
import { DynamicRenderer } from './components/registry';

interface Message {
  role: 'user' | 'assistant';
  content?: string;
  ui?: {
    component: string;
    props: any;
  };
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the endpoint URL as the first argument
      await connectAGUI('http://localhost:8000/agent', input, (event: AGUIEvent) => {
        setIsLoading(false);
        if (event.type === 'message') {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            // If the last message was an assistant text message, append to it
            if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.ui) {
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, content: (lastMsg.content || '') + event.content },
              ];
            } else {
              // Otherwise, create a new text message
              return [...prev, { role: 'assistant', content: event.content }];
            }
          });
        } else if (event.type === 'update_ui') {
          // Add UI component as a new message
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              ui: {
                component: event.component,
                props: event.props,
              },
            },
          ]);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 justify-center">
      {/* Main Chat Area - Centered and Full Height */}
      <div className="w-full max-w-4xl flex flex-col bg-white shadow-xl h-full border-x border-gray-100 relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 text-center">
            AG-UI Demo
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium text-center">Agentic User Interface</p>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 bg-gray-50/50">
          {/* Persistent Guidance */}
          <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-100 mb-8 mx-auto max-w-2xl backdrop-blur-sm">
            <p className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
              <span className="bg-blue-200 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">?</span>
              試試看以下指令：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center" onClick={() => setInput('請幫我比較 iPhone 15 和 16 的規格')}>
                比較 iPhone 規格 (表格)
              </button>
              <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center" onClick={() => setInput('我想報名參加下週的研討會')}>
                報名研討會 (表單)
              </button>
              <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center" onClick={() => setInput('介紹一下馬斯克是誰')}>
                介紹馬斯克 (卡片)
              </button>
              <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center" onClick={() => setInput('顯示過去半年的銷售趨勢')}>
                銷售趨勢 (圖表)
              </button>
              <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center" onClick={() => setInput('給我一個學習 Python 的計畫')}>
                學習計畫 (步驟)
              </button>
              <button className="text-left text-sm text-blue-700 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center" onClick={() => setInput('顯示本月關鍵績效指標')}>
                關鍵指標 (統計)
              </button>
            </div>
          </div>

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] ${msg.role === 'user'
                  ? 'bg-blue-600 text-white p-4 rounded-2xl rounded-br-none shadow-md'
                  : msg.ui
                    ? 'w-full max-w-3xl' // Full width for UI components
                    : 'bg-white text-gray-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100'
                  }`}
              >
                {msg.ui ? (
                  <div className="animate-fade-in">
                    <DynamicRenderer componentName={msg.ui.component} props={msg.ui.props} />
                  </div>
                ) : (
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex space-x-1.5 items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="輸入您的需求..."
              className="w-full pl-5 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
