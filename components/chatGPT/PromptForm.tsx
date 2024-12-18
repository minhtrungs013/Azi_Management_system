import { useState, ChangeEvent, FormEvent } from 'react';
// import styles from './PromptForm.module.css';

// Define the types for the props
interface PromptFormProps {
  isLoading: boolean;
  onSubmit: (prompt: string) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ isLoading, onSubmit }) => {
  const [prompt, setPrompt] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = (el: FormEvent<HTMLFormElement>) => {
    el.preventDefault();

    if (prompt === '') {
      return;
    }

    onSubmit(prompt);
    setPrompt('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Question</label>
      <input
    
        type='text'
        value={prompt}
        onChange={handleInputChange}
      />
      <input type='submit' disabled={isLoading} />
    </form>
  );
};

export default PromptForm;
