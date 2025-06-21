
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Globe, MapPin, DollarSign, Clock } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Language {
  code: string;
  name: string;
  flag: string;
  greeting: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', greeting: 'Welcome to Dwntwna! I\'m your AI travel assistant for Downtown Dubai.' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪', greeting: 'مرحباً بكم في دونتانا! أنا مساعدكم الذكي للسفر في وسط دبي.' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', greeting: 'डाउनटाउन दुबई में आपका स्वागत है! मैं आपका AI यात्रा सहायक हूं।' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', greeting: 'ڈاؤن ٹاؤن دبئی میں خوش آمدید! میں آپ کا AI سفری معاون ہوں۔' },
  { code: 'zh', name: '中文', flag: '🇨🇳', greeting: '欢迎来到迪拜市中心！我是您的AI旅行助手。' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', greeting: 'Добро пожаловать в центр Дубая! Я ваш AI помощник по путешествиям.' },
];

const DwntwnaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageSelector(false);
    
    const systemMessage: Message = {
      role: 'system',
      content: `User selected ${language.name} as their preferred language. Always respond in ${language.name} unless they specifically ask for another language.`,
      timestamp: new Date()
    };
    
    const welcomeMessage: Message = {
      role: 'assistant',
      content: language.greeting,
      timestamp: new Date()
    };
    
    setMessages([systemMessage, welcomeMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // This will be connected to your Supabase Edge Function
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          language: selectedLanguage?.code || 'en'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || 'I apologize, but I\'m having trouble responding right now. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I\'m sorry, I\'m experiencing technical difficulties. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showLanguageSelector) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 font-cantata">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dwntwna-black mb-4">
            Welcome to Dwntwna
          </h1>
          <p className="text-lg text-dwntwna-black/70 mb-2">
            Your AI Travel Assistant for Downtown Dubai
          </p>
          <div className="flex items-center justify-center gap-2 text-dwntwna-teal">
            <MapPin className="w-5 h-5" />
            <span>Downtown Dubai & Beyond</span>
          </div>
        </div>

        <Card className="p-8 bg-dwntwna-bronze-light border-dwntwna-bronze/20">
          <div className="text-center mb-6">
            <Globe className="w-12 h-12 text-dwntwna-bronze mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-dwntwna-black mb-2">
              Choose Your Language
            </h2>
            <p className="text-dwntwna-black/70">
              Select your preferred language to start planning your Dubai adventure
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant="outline"
                className="h-auto p-4 border-dwntwna-bronze/30 hover:bg-dwntwna-bronze hover:text-dwntwna-white hover:border-dwntwna-bronze transition-all duration-200"
                onClick={() => handleLanguageSelect(language)}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{language.flag}</div>
                  <div className="font-semibold">{language.name}</div>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-dwntwna-black/60">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>Budget Planning</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Destination Recommendations</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Real-time Information</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto h-screen flex flex-col font-cantata">
      {/* Header */}
      <div className="bg-dwntwna-white border-b border-dwntwna-bronze/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dwntwna-black">Dwntwna AI Concierge</h1>
            <p className="text-sm text-dwntwna-black/70">Downtown Dubai Travel Assistant</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-dwntwna-bronze text-dwntwna-bronze">
              {selectedLanguage?.flag} {selectedLanguage?.name}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLanguageSelector(true)}
              className="text-dwntwna-teal hover:text-dwntwna-bronze hover:bg-dwntwna-bronze-light"
            >
              <Globe className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-dwntwna-bronze-light">
        <div className="space-y-4">
          {messages.filter(m => m.role !== 'system').map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-dwntwna-teal text-dwntwna-white'
                    : 'bg-dwntwna-white text-dwntwna-black border border-dwntwna-bronze/20'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-dwntwna-white/70' : 'text-dwntwna-black/50'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-dwntwna-white text-dwntwna-black border border-dwntwna-bronze/20 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-dwntwna-bronze rounded-full animate-typing"></div>
                  <div className="w-2 h-2 bg-dwntwna-bronze rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-dwntwna-bronze rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-dwntwna-bronze/20 p-4 bg-dwntwna-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about Dubai destinations, budget planning, or anything else..."
            disabled={isLoading}
            className="flex-1 border-dwntwna-bronze/30 focus:border-dwntwna-bronze focus:ring-dwntwna-bronze/20"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-dwntwna-teal hover:bg-dwntwna-bronze text-dwntwna-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DwntwnaChat;
