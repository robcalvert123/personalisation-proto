'use client';

import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const handlePromptClick = (prompt: string) => {
    // TODO: Handle prompt click
    console.log('Selected prompt:', prompt);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-20">
      <div className="chat-prompt mx-auto">
        <h1>What are you looking to achieve?</h1>
        <div className="chat-input-container">
          <div className="flex items-center gap-3">
            <ChatBubbleLeftIcon className="h-7 w-7 text-gray-400" />
            <input
              type="text"
              placeholder="Type your message..."
              className="chat-input"
            />
          </div>
        </div>
        <div className="prompt-suggestions">
          {['Running a marathon', 'Building muscle', 'Improving sports performance'].map((prompt) => (
            <button 
              key={prompt}
              onClick={() => handlePromptClick(prompt)}
              className="prompt-suggestion"
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
