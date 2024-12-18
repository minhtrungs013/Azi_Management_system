'use client';
import { useState } from 'react';
import PromptForm from './PromptForm';

// Define the types for the response
interface Choice {
  index: number;
  message: {
    content: string;
  };
}

export default function ChatGPT() {
  // Define the state types
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (prompt: string) => {
    setIsLoading(true);
    const response = await fetch('./api/chat-gpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      setChoices(result.choices);
    }
    setIsLoading(false);
  };

  return (
    <main>
      <div >
        <h1>Next.js with Chat-GPT</h1>
        <h3>Write your question</h3>
        <PromptForm isLoading={isLoading} onSubmit={onSubmit} />

        {choices.map((choice) => {
          return (
            <p key={choice.index} >
              {choice.message.content}
            </p>
          );
        })}
      </div>
    </main>
  );
}
