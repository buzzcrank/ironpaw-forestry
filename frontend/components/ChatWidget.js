import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { startChat, sendMessage } from '../services/api';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('ip_session_id');
      if (!id) { id = uuidv4(); sessionStorage.setItem('ip_session_id', id); }
      return id;
    }
    return uuidv4();
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleOpen() {
    setOpen(true);
    if (messages.length === 0) {
      setLoading(true);
      try {
        const res = await startChat();
        setMessages([{ role: 'bot', text: res.data.reply }]);
      } catch {
        setMessages([{ role: 'bot', text: "Hi! I'm the Iron Paw AI assistant. Tell me about your land clearing project and I'll get you a quick estimate!" }]);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const res = await sendMessage({ session_id: sessionId, message: userMsg });
      setMessages(m => [...m, { role: 'bot', text: res.data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: "Sorry, I hit a snag. You can also call us at 1-346-IRONPAW!" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Widget */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-80 sm:w-96 z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-forest-600">
          {/* Header */}
          <div className="bg-forest-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <img src="/ironpaw-logo-simple.png" alt="IP" className="w-7 h-7 object-contain" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Iron Paw AI</div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-forest-400 text-xs">Online · Free estimate</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-forest-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="bg-forest-900 flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-amber-500 text-forest-950 font-medium rounded-br-sm'
                    : 'bg-forest-800 text-white rounded-bl-sm border border-forest-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-forest-800 border border-forest-700 px-3 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-forest-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="bg-forest-800 border-t border-forest-700 flex items-center gap-2 px-3 py-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-forest-700 text-white placeholder-forest-400 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="w-8 h-8 bg-amber-500 hover:bg-amber-600 text-forest-950 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

          {/* Footer */}
          <div className="bg-forest-900 border-t border-forest-800 px-3 py-1.5 flex justify-between items-center">
            <span className="text-forest-600 text-xs">Powered by Iron Paw AI</span>
            <a href="tel:+13464766729" className="text-amber-400 text-xs hover:text-amber-300 transition-colors">
              📞 Call us
            </a>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-forest-950 rounded-full shadow-lg hover:shadow-amber-500/30 transition-all duration-200 flex items-center justify-center"
        aria-label="Open chat"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </>
  );
}
