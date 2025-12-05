
import { type FormEvent, useEffect, useRef, useState } from 'react'
import axios from 'axios';
import BASE_URL from './config';

type Sender = 'user' | 'bot'

type Message = {
  id: number
  sender: Sender
  text: string
  timestamp: string
}

const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const buildInitialMessages = (): Message[] => [
  {
    id: 1,
    sender: 'bot',
    text: 'Welcome back! How can I help you today?',
    timestamp: formatTime(),
  }
]

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const botTimerRef = useRef<number | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      if (botTimerRef.current) {
        window.clearTimeout(botTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('sessionId')) {
      setMessages(buildInitialMessages);
      return;
    }
    axios({
      url: `${BASE_URL}/api/history/${localStorage.getItem('sessionId')}`,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((response) => {
      let history = JSON.parse(response.data.history);
      setMessages(history);
    })
    .catch((err) => {
      console.log(err);
    })
  }, []);

  const handleResetSession = () => {
    if (botTimerRef.current) {
      window.clearTimeout(botTimerRef.current)
    }

    axios({
      url: `${BASE_URL}/api/session/${localStorage.getItem("sessionId")}`,
      method:"DELETE",
      headers: {
        'Content-Type': "application/json"
      }
    })
    .then((response) => {
      console.log(response);
      setMessages(buildInitialMessages());
      localStorage.removeItem("sessionId");
    })
    .catch((err) => {
      console.log(err);
    })


    setInputValue('')
    setIsLoading(false)
  }

  const addBotMessage = (prompt: string) => {
    botTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'bot',
          text: prompt,
          timestamp: formatTime(),
        },
      ])
    }, 600)
  }

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text: trimmed,
        timestamp: formatTime(),
      },
    ])
    setInputValue('')
    setIsLoading(true)

    axios({
      method: 'POST',
      url: `${BASE_URL}/api/chat/`,
      data: {
        query: trimmed,
        sessionId: localStorage.getItem('sessionId') || null
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      addBotMessage(response.data.data);
      if (!localStorage.getItem("sessionId")) {
        localStorage.setItem("sessionId", response.data.sessionId);
      }
    })
    .catch((error) => {
      console.error(error)
      addBotMessage('Something went wrong. Please try again.')
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex h-screen max-w-5xl flex-col px-4 py-6">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <p className="text-xl font-semibold uppercase tracking-[0.3em] text-slate-500">
              Main Chat Interface
            </p>
            <h1 className="text-2xl font-semibold text-white"></h1>
          </div>
          <button
            onClick={handleResetSession}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
          >
            Reset Session
          </button>
        </header>

        <section className="mt-4 flex flex-1 min-h-0 flex-col">
          <div className="flex flex-1 min-h-0 flex-col rounded-3xl bg-slate-900/60 p-4 shadow-[0_25px_80px_rgba(15,23,42,0.7)] ring-1 ring-slate-800">
            <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-1 min-h-0">
              {messages.map((message) => {
                const isUser = message.sender === 'user'
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-full whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg md:max-w-[75%] ${
                        isUser
                          ? 'bg-gradient-to-br from-indigo-500 via-indigo-400 to-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-100'
                      }`}
                    >
                      {message.text}
                    </div>
                    <span className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      {message.timestamp}
                    </span>
                  </div>
                )
              })}
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-xs text-slate-300 shadow-lg">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                  <span className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                    Thinking...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="mt-4 border-t border-slate-800 pt-4"
            >
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  name="message"
                  autoComplete="off"
                  autoFocus
                  placeholder="Type a message..."
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App
