import React, { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const ChatHistory = ({ messages, userType }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div 
          key={index} 
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={
              message.sender === 'user'
                ? "bg-purple-100 text-purple-900 rounded-lg rounded-tr-none p-3 max-w-xs sm:max-w-md"
                : "bg-zinc-100 rounded-lg rounded-tl-none p-3 max-w-xs sm:max-w-md"
            }
          >
            <p className="text-sm">{message.text}</p>
            <p 
              className={
                message.sender === 'user'
                  ? "text-xs text-right text-purple-700/70 mt-1"
                  : "text-xs text-right text-muted-foreground mt-1"
              }
            >
              {message.time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;