import React, { useState, useRef, useEffect } from 'react';
import faqData from '../../data/faq.json';

interface Message {
  type: 'bot' | 'user';
  text: string;
}

interface FaqEntry {
  keywords: string[];
  answer: string;
}

const WA_LINK = 'https://wa.me/541165361612?text=Hola%2C%20tengo%20una%20consulta';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function findAnswer(query: string): FaqEntry | null {
  const normalizedQuery = normalize(query);
  const words = normalizedQuery.split(/\s+/);

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of faqData.entries) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const normalizedKw = normalize(keyword);
      if (normalizedQuery.includes(normalizedKw)) {
        score += normalizedKw.length;
      } else {
        for (const word of words) {
          if (word.length >= 3 && normalizedKw.includes(word)) {
            score += word.length * 0.5;
          }
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestMatch;
}

function linkify(text: string): (string | React.JSX.Element)[] {
  const parts = [];
  const linkRegex = /(\/[\w\-\/#+]*|wa\.me\/\S+|discord\.gg\/\S+|usevia\.app)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[0].startsWith('/') ? match[0] : `https://${match[0]}`;
    parts.push(
      <a
        key={match.index}
        href={url}
        target={match[0].startsWith('/') ? '_self' : '_blank'}
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
      >
        {match[0]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function formatMessage(text: string): React.JSX.Element[] {
  return text.split('\n').map((line: string, i: number) => {
    const boldFormatted = line.split(/(\*\*.*?\*\*)/).map((part: string, j: number) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{linkify(part)}</span>;
    });

    return (
      <span key={i}>
        {boldFormatted}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

export default function AntaresHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      setMessages([{
        type: 'bot',
        text: 'Hola, soy el asistente de AntarTech. ¿En qué te puedo ayudar?\n\nPodés preguntarme sobre productos, envíos, atajos VIA, precios y más.',
      }]);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = { type: 'user', text: trimmed };
    const match = findAnswer(trimmed);

    let botMsg: Message;
    if (match) {
      botMsg = { type: 'bot', text: match.answer };
    } else {
      botMsg = {
        type: 'bot',
        text: `No estoy seguro de eso, pero Antares te puede responder personalmente por WhatsApp:\n\n→ wa.me/541165361612`,
      };
    }

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div id="antares-helper-root" className="contents">
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        aria-label={isOpen ? 'Cerrar asistente' : 'Abrir asistente'}
        className="fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg hover:scale-110 hover:shadow-xl group"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
        }}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[70] w-[340px] sm:w-[380px] max-h-[480px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d20 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.1), 0 0 60px rgba(99, 102, 241, 0.05)',
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{
              background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
              borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-400/80"></span>
            </div>
            <span
              className="text-[11px] font-bold tracking-[0.15em] uppercase flex-1"
              style={{
                background: 'linear-gradient(90deg, #818cf8, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              antares://soporte
            </span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{
              maxHeight: '340px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#6366f1 #0a0a1a',
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed"
                  style={
                    msg.type === 'user'
                      ? {
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.15))',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          color: '#c7d2fe',
                        }
                      : {
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(6, 182, 212, 0.15)',
                          color: '#94a3b8',
                        }
                  }
                >
                  {msg.type === 'bot' ? formatMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div
            className="px-3 py-3 shrink-0"
            style={{
              borderTop: '1px solid rgba(6, 182, 212, 0.15)',
              background: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-cyan-500/60 text-xs font-mono shrink-0">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribí tu consulta..."
                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none font-mono"
                style={{ caretColor: '#22d3ee' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 disabled:opacity-30"
                style={{
                  background: input.trim()
                    ? 'linear-gradient(135deg, #6366f1, #06b6d4)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14-7-4 7 4 7Z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
