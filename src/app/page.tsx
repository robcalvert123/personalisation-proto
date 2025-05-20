'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from 'next/link';

interface BaseMessage {
  text: string;
  isUser: boolean;
}

interface UserMessage extends BaseMessage {
  isUser: true;
}

interface BotMessage extends BaseMessage {
  isUser: false;
  isProductLink?: false;
  isTyping?: boolean;
  displayText?: string;
}

interface ProductMessage extends BaseMessage {
  isUser: false;
  isProductLink: true;
  linkText: string;
  linkUrl: string;
  isTyping?: boolean;
  displayText?: string;
}

type Message = UserMessage | BotMessage | ProductMessage;

const BOT_RESPONSES = [
  "How many runs per week are you doing for training?",
  "How long are those runs?",
  "How do you find the recovery from your runs?",
  "Based on this I'd recommend our Ultra Electrolytes Discovery Pack as a one-off purchase"
];

const TYPING_SPEED = 200; // milliseconds per word
const WORD_PAUSE = 80; // milliseconds pause between words
const THINKING_DELAY = 500; // milliseconds to "think" before typing

interface TypingWord {
  text: string;
  id: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isInputAtBottom, setIsInputAtBottom] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState<{id: number, words: TypingWord[]} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);
  const wordIdRef = useRef(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Cleanup function for typing animation
  const cleanupTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = undefined;
    }
    setCurrentTypingMessage(null);
    setIsBotTyping(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTyping();
    };
  }, []);

  const typeMessage = (messageId: number, fullText: string) => {
    // Cleanup any existing typing animation
    cleanupTyping();
    
    const words = fullText.split(' ');
    let currentIndex = 0;
    
    // First, add the message container with no words
    setCurrentTypingMessage({ 
      id: messageId, 
      words: [] 
    });
    
    const updateMessage = () => {
      if (currentIndex < words.length) {
        const currentWords = words.slice(0, currentIndex + 1).map((word, index) => ({
          text: word,
          id: wordIdRef.current + index
        }));
        
        setCurrentTypingMessage(prev => {
          // Only update if this is still the current message being typed
          if (prev?.id !== messageId) return prev;
          return { 
            id: messageId, 
            words: currentWords 
          };
        });
        
        currentIndex++;
        
        if (currentIndex < words.length) {
          typingTimeoutRef.current = setTimeout(updateMessage, WORD_PAUSE);
        } else {
          // Last word typed, wait for animation to complete before finishing
          typingTimeoutRef.current = setTimeout(() => {
            cleanupTyping();
            wordIdRef.current += words.length;
          }, TYPING_SPEED);
        }
      }
    };
    
    // Start typing after a small initial delay
    typingTimeoutRef.current = setTimeout(updateMessage, 100);
  };

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt);
    // Use setTimeout to ensure the input value is set before triggering the send
    setTimeout(() => {
      handleSendMessage(prompt);
    }, 0);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isBotTyping) return;
    
    // Add user message
    const userMessage: UserMessage = {
      text,
      isUser: true
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsInputAtBottom(true);

    // Simulate response after a delay
    const responseTimeout = setTimeout(() => {
      const isLastResponse = responseIndex === BOT_RESPONSES.length - 1;
      const botMessage = BOT_RESPONSES[responseIndex];
      const botMessageId = messageIdRef.current++;
      
      if (isLastResponse) {
        // For the last message, split it into text and link
        const linkText = "Ultra Electrolytes Discovery Pack";
        const messageText = botMessage.replace(linkText, '');
        const productMessage: ProductMessage = {
          text: messageText,
          isUser: false,
          isProductLink: true,
          linkText,
          linkUrl: "https://puresport.co/products/ultra-electrolytes-discovery-pack-2x15-pack?variant=45319763099786"
        };
        
        setMessages(prev => [...prev, productMessage]);
        setIsBotTyping(true);
        typeMessage(botMessageId, messageText);
      } else {
        const botResponse: BotMessage = {
          text: botMessage,
          isUser: false,
          isProductLink: false
        };
        setMessages(prev => [...prev, botResponse]);
        setIsBotTyping(true);
        typeMessage(botMessageId, botMessage);
      }
      
      setResponseIndex(prev => (prev + 1) % BOT_RESPONSES.length);
    }, THINKING_DELAY);

    // Cleanup timeout
    return () => clearTimeout(responseTimeout);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputValue);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const isProductMessage = (message: Message): message is ProductMessage => {
    return message.isUser === false && 'isProductLink' in message && message.isProductLink === true;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-20">
      <div className={`chat-container ${isInputAtBottom ? 'input-at-bottom' : ''}`}>
        <div className="messages-container">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
            >
              {message.isUser ? message.text : (
                <>
                  {currentTypingMessage?.id === index ? (
                    <span className="typing-indicator">
                      {currentTypingMessage.words.map((word, wordIndex) => (
                        <span 
                          key={word.id} 
                          className="typing-word"
                          style={{ 
                            animationDelay: `${wordIndex * WORD_PAUSE}ms`,
                            display: 'inline-block'
                          }}
                        >
                          {word.text}
                          {wordIndex < currentTypingMessage.words.length - 1 ? ' ' : ''}
                        </span>
                      ))}
                      <span className="cursor">|</span>
                    </span>
                  ) : (
                    <>
                      {message.text}
                      {isProductMessage(message) && (
                        <>
                          {' '}
                          <Link 
                            href={message.linkUrl} 
                            className="text-puresport-green underline hover:text-puresport-green/80"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {message.linkText}
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className={`chat-prompt ${isInputAtBottom ? 'input-at-bottom' : ''}`}>
          {!isInputAtBottom && <h1>What are you looking to achieve?</h1>}
          <div className="chat-input-container">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftIcon className="h-7 w-7 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder={isBotTyping ? "Bot is typing..." : "Type your message..."}
                className="chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isBotTyping}
              />
            </div>
          </div>
          {!isInputAtBottom && !isBotTyping && (
            <div className="prompt-suggestions">
              {['Running a marathon', 'Building muscle', 'Improving sports performance'].map((prompt) => (
                <button 
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  className="prompt-suggestion"
                  type="button"
                  disabled={isBotTyping}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
