import React, { useRef, useEffect } from 'react';
import { ArrowLeft, Bot, User, ThumbsUp, ThumbsDown, Copy, Send, Pin } from 'lucide-react';
import DataVisualization from './DataVisualization';
import { ChatData, QuickAction } from '../types';

interface ChatConversationViewProps {
  currentChat: ChatData;
  inputValue: string;
  setInputValue: (value: string) => void;
  isTyping: boolean;
  handleSendMessage: (text?: string) => void;
  goBack: () => void;
  quickActions: QuickAction[];
}

const ChatConversationView: React.FC<ChatConversationViewProps> = ({
  currentChat,
  inputValue,
  setInputValue,
  isTyping,
  handleSendMessage,
  goBack,
  quickActions
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages, isTyping]);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-[#333333] bg-[#121212]/95 backdrop-blur sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={goBack}
                className="p-2 hover:bg-[#1E1E1E] rounded-[4px] transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className={`${currentChat.bgColor} p-2 rounded-[4px]`}>
                  <div className={currentChat.color}>{currentChat.icon}</div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{currentChat.title}</h1>
                  <p className="text-gray-400 text-sm">{currentChat.messageCount} messages • {currentChat.timestamp}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {currentChat.isPinned && <Pin className="h-4 w-4 text-[#F9D71C]" />}
              <div className="bg-[#336699]/20 px-3 py-2 rounded-[4px] border border-[#336699]/30">
                <span className="text-[#336699] text-sm font-bold">AI POWERED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-[#333333]">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(action.query)}
              className="flex items-center space-x-2 px-3 py-2 bg-[#1E1E1E] hover:bg-[#333333] rounded-[4px] border border-[#333333] transition-colors text-sm"
            >
              <div className={action.color}>{action.icon}</div>
              <span className="text-gray-300">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {currentChat.messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start space-x-3">
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 bg-[#336699] rounded-[4px] flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className={`p-4 rounded-[4px] ${
                      message.type === 'user' 
                        ? 'bg-[#336699] text-white' 
                        : 'bg-[#1E1E1E] border border-[#333333]'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      {message.data && <DataVisualization data={message.data} />}
                      {message.suggestions && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs text-gray-400 font-medium uppercase">💡 Try asking:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSendMessage(suggestion)}
                                className="text-left p-2 bg-[#121212] hover:bg-[#333333] rounded-[4px] text-xs transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-[#1E1E1E] rounded-[4px]">
                            <ThumbsUp className="h-3 w-3 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-[#1E1E1E] rounded-[4px]">
                            <ThumbsDown className="h-3 w-3 text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-[#1E1E1E] rounded-[4px]">
                            <Copy className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-[#336699] rounded-[4px] flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-[#336699] rounded-[4px] flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-[#1E1E1E] p-4 rounded-[4px] border border-[#333333]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-[#333333] p-6 bg-[#121212]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Continue the conversation..."
                className="w-full bg-[#1E1E1E] border border-[#333333] rounded-[4px] px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/20"
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="bg-[#F9D71C] hover:bg-[#e9c91c] disabled:bg-[#333333] disabled:cursor-not-allowed text-[#121212] p-3 rounded-[4px] transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatConversationView;
