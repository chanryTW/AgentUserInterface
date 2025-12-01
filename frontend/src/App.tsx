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
    setActiveComponent(null); // Reset active component on new request

    await connectAGUI('http://localhost:8000/agent', userMessage, (event: AGUIEvent) => {
      if (event.type === 'message') {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            // If we want to support streaming text updates, we'd append here.
            // But our backend sends full messages for simplicity in this demo, 
            // or we can just append new messages.
            // Let's assume backend sends distinct message blocks.
            return [...prev, { role: 'assistant', content: event.content }];
          }
          return [...prev, { role: 'assistant', content: event.content }];
        });
      } else if (event.type === 'update_ui') {
        setActiveComponent({ name: event.component, props: event.props });
      }
    });

    setIsLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 flex flex-col border-r bg-white">
        <div className="p-4 border-b bg-gray-50">
          <h1 className="text-xl font-bold text-gray-800">AG-UI Demo</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-[85%] ${msg.role === 'user'
                ? 'bg-blue-500 text-white self-end ml-auto'
                : 'bg-gray-200 text-gray-800 self-start'
                }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type 'table', 'form', or 'card'..."
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center bg-gray-50">
        {activeComponent ? (
          <div className="w-full max-w-4xl animate-fade-in">
            <DynamicRenderer
              componentName={activeComponent.name}
              props={activeComponent.props}
            />
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            <p className="text-xl">Dynamic UI Area</p>
            <p className="text-sm">Ask the agent to show you something!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
