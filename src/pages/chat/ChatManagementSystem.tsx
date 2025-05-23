import React, { useState } from 'react';
import { 
  MessageSquare,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock
} from "lucide-react";
import { ChatData, Category, QuickAction } from './types';
import ChatHistoryView from './components/ChatHistoryView';
import ChatConversationView from './components/ChatConversationView';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';

const ChatManagementSystem: React.FC = () => {
  const [currentView, setCurrentView] = useState<'history' | 'chat'>('history');
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Sample chat history with full message threads
  const [chatHistory, setChatHistory] = useState<ChatData[]>([
    {
      id: 1,
      title: "Overdue Invoices Analysis",
      preview: "Which clients owe me money?",
      category: "financial",
      timestamp: "2 hours ago",
      isPinned: true,
      messageCount: 8,
      lastValue: "$17,900 overdue",
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-red-400",
      bgColor: "bg-red-900/20",
      messages: [
        {
          id: 1,
          type: 'user',
          content: "Which clients owe me money?",
          timestamp: "2:34 PM"
        },
        {
          id: 2,
          type: 'ai',
          content: "Here are your overdue invoices that need immediate attention:",
          timestamp: "2:34 PM",
          data: {
            type: 'overdue_invoices',
            items: [
              { client: "Johnson Kitchen", amount: "$8,900", days: 47, urgency: "high" },
              { client: "Pine Ave Deck", amount: "$5,600", days: 23, urgency: "medium" },
              { client: "Oak St Bathroom", amount: "$3,400", days: 12, urgency: "low" }
            ],
            total: "$17,900",
            insight: "💡 Johnson Kitchen is your biggest risk - 47 days overdue. Call them today!"
          }
        },
        {
          id: 3,
          type: 'user',
          content: "What's Johnson Kitchen's contact info?",
          timestamp: "2:35 PM"
        },
        {
          id: 4,
          type: 'ai',
          content: "Johnson Kitchen contact details: Sarah Johnson, (512) 555-0123, sarah@email.com. Last payment was on time for previous projects, so this might be an oversight. Recommend a friendly call first.",
          timestamp: "2:35 PM"
        }
      ]
    },
    {
      id: 2,
      title: "Profit Optimization Deep Dive",
      preview: "What's my most profitable project type?",
      category: "analytics",
      timestamp: "Yesterday",
      isPinned: false,
      messageCount: 12,
      lastValue: "Bathrooms: $198/hr",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-green-400",
      bgColor: "bg-green-900/20",
      messages: [
        {
          id: 1,
          type: 'user',
          content: "What's my most profitable project type?",
          timestamp: "Yesterday 3:22 PM"
        },
        {
          id: 2,
          type: 'ai',
          content: "Here's your profit analysis by project type:",
          timestamp: "Yesterday 3:22 PM",
          data: {
            type: 'profit_analysis',
            items: [
              { type: "Bathroom Renovations", profit: "$198/hour", margin: "34.2%", projects: 8 },
              { type: "Kitchen Remodels", profit: "$156/hour", margin: "28.7%", projects: 12 },
              { type: "Deck Installations", profit: "$135/hour", margin: "25.1%", projects: 6 }
            ],
            insight: "🎯 Focus on bathroom work - 47% higher profit than decks!"
          }
        }
      ]
    },
    {
      id: 3,
      title: "Cold Leads Recovery",
      preview: "Show me leads going cold",
      category: "leads",
      timestamp: "2 days ago",
      isPinned: true,
      messageCount: 6,
      lastValue: "$207K at risk",
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      messages: [
        {
          id: 1,
          type: 'user',
          content: "Show me leads going cold",
          timestamp: "2 days ago 11:15 AM"
        },
        {
          id: 2,
          type: 'ai',
          content: "These high-value leads are going cold - contact them ASAP:",
          timestamp: "2 days ago 11:15 AM",
          data: {
            type: 'cold_leads',
            items: [
              { project: "Commercial Office Renovation", value: "$95K", days: 4, contact: "John Smith" },
              { project: "Multi-Family Addition", value: "$67K", days: 6, contact: "Robert Kim" },
              { project: "Luxury Pool Install", value: "$45K", days: 3, contact: "Lisa Chen" }
            ],
            total: "$207K",
            insight: "⚠️ $207K in opportunities at risk! The Commercial Office is your biggest priority."
          }
        }
      ]
    }
  ]);

  // Categories for filtering
  const categories: Category[] = [
    { id: 'all', label: 'All Chats', count: chatHistory.length, icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'financial', label: 'Financial', count: chatHistory.filter(c => c.category === 'financial').length, icon: <DollarSign className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', count: chatHistory.filter(c => c.category === 'analytics').length, icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'clients', label: 'Clients', count: chatHistory.filter(c => c.category === 'clients').length, icon: <Users className="h-4 w-4" /> },
    { id: 'leads', label: 'Leads', count: chatHistory.filter(c => c.category === 'leads').length, icon: <AlertTriangle className="h-4 w-4" /> }
  ];

  const quickActions: QuickAction[] = [
    { icon: <DollarSign className="h-4 w-4" />, text: "Cash flow issues", color: "text-red-400", query: "Show me overdue invoices and cash flow problems" },
    { icon: <TrendingUp className="h-4 w-4" />, text: "Profit analysis", color: "text-green-400", query: "Analyze my profit margins by project type" },
    { icon: <Users className="h-4 w-4" />, text: "Client insights", color: "text-blue-400", query: "Who are my most valuable clients?" },
    { icon: <Clock className="h-4 w-4" />, text: "Time efficiency", color: "text-yellow-400", query: "Which projects take too long and hurt my hourly rate?" }
  ];

  // Handle opening existing chat
  const openChat = (chatId: number) => {
    setSelectedChatId(chatId);
    setCurrentView('chat');
  };

  // Handle creating new chat
  const createNewChat = () => {
    const newChat: ChatData = {
      id: Date.now(),
      title: "New Business Analysis",
      preview: "Ask me anything about your business...",
      category: "analytics",
      timestamp: "Just now",
      isPinned: false,
      messageCount: 1,
      lastValue: "New chat",
      icon: <MessageSquare className="h-4 w-4" />,
      color: "text-[#336699]",
      bgColor: "bg-[#336699]/20",
      messages: [
        {
          id: 1,
          type: 'ai',
          content: "Hey! I'm ready to analyze your business data. What would you like to know about your projects, clients, profits, or cash flow?",
          timestamp: new Date().toLocaleTimeString(),
          suggestions: [
            "Show me my biggest money makers",
            "Which invoices are overdue?", 
            "What projects have the best margins?",
            "Who are my slowest paying clients?"
          ]
        }
      ]
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    setCurrentView('chat');
  };

  // Handle sending message in current chat
  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim() || !selectedChatId) return;

    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    // Add user message to current chat
    setChatHistory(prev => prev.map(chat => 
      chat.id === selectedChatId 
        ? { ...chat, messages: [...chat.messages, userMessage], messageCount: chat.messageCount + 1 }
        : chat
    ));

    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(text);
      setChatHistory(prev => prev.map(chat => 
        chat.id === selectedChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, aiResponse], 
              messageCount: chat.messageCount + 1,
              timestamp: "Just now",
              preview: text
            }
          : chat
      ));
      setIsTyping(false);
    }, 1200);
  };

  const generateAIResponse = (query: string) => {
    // Simplified AI response generation
    return {
      id: Date.now(),
      type: 'ai' as const,
      content: "I understand you're asking about " + query.toLowerCase() + ". Let me analyze your business data and provide insights.",
      timestamp: new Date().toLocaleTimeString()
    };
  };

  // Get current chat data
  const currentChat = chatHistory.find(chat => chat.id === selectedChatId);

  return (
    <DashboardLayout>
      {currentView === 'history' ? (
        <ChatHistoryView 
          chatHistory={chatHistory}
          searchQuery={searchQuery}
          selectedFilter={selectedFilter}
          setSearchQuery={setSearchQuery}
          setSelectedFilter={setSelectedFilter}
          createNewChat={createNewChat}
          openChat={openChat}
          categories={categories}
        />
      ) : currentChat ? (
        <ChatConversationView 
          currentChat={currentChat}
          inputValue={inputValue}
          setInputValue={setInputValue}
          isTyping={isTyping}
          handleSendMessage={handleSendMessage}
          goBack={() => setCurrentView('history')}
          quickActions={quickActions}
        />
      ) : null}
    </DashboardLayout>
  );
};

export default ChatManagementSystem;
