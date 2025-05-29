import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PaperclipIcon, SendIcon } from 'lucide-react';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="border-t p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
        >
          <PaperclipIcon className="h-5 w-5 text-zinc-500" />
        </Button>
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite sua mensagem..." 
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <Button type="submit" className="rounded-full p-2 h-auto w-auto">
          <SendIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;