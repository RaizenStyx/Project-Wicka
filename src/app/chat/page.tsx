'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Search, MoreVertical, Phone, Video, Image as ImageIcon, Smile, Paperclip } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

// --- DUMMY DATA ---
const USERS = [
  { id: '1', name: 'Kali', avatar: null, status: 'online', lastMsg: 'This will show for everyone for now, but this is a converstaion between LordStyx and Kali!', time: '19:35', unread: 0 },
  { id: '2', name: 'Raefyn', avatar: null, status: 'offline', lastMsg: 'I have some ideas for the tarot system.', time: '19:06', unread: 2 },
  { id: '3', name: 'Aliyah', avatar: null, status: 'online', lastMsg: 'Did you see the new rune drop?', time: 'Yesterday', unread: 0 },
  { id: '4', name: 'System', avatar: null, status: 'dnd', lastMsg: 'Thanks for becoming a Supporter!', time: 'Yesterday', unread: 0 },
];

// A "Dictionary" where the key is the User ID (e.g., '1', '2')
const DUMMY_CHAT_HISTORY: Record<string, any[]> = {
  '1': [
    { id: 1, senderId: '1', text: 'I love you', timestamp: '19:06', isMe: false },
    { id: 2, senderId: 'me', text: 'I love you more!', timestamp: '19:10', isMe: true },
    { id: 3, senderId: '1', text: 'This will show for everyone for now, but this is a converstaion between LordStyx and Kali!', timestamp: '19:35', isMe: false },
  ],
  '2': [
    { id: 1, senderId: '2', text: 'Hey, are you still working on the site?', timestamp: '14:20', isMe: false },
    { id: 2, senderId: '2', text: 'I have some ideas for the tarot system.', timestamp: '14:21', isMe: false },
  ],
  '3': [
    { id: 1, senderId: '3', text: 'Did you see the new rune drop?', timestamp: 'Yesterday', isMe: false },
    { id: 2, senderId: 'me', text: 'Yeah, looks insane.', timestamp: 'Yesterday', isMe: true },
  ],
  '4': [
    { id: 1, senderId: '4', text: 'Thanks for becoming a Supporter!', timestamp: 'Yesterday', isMe: false },
  ]
};

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState('1');
  
  // Initialize with the messages for the default user ('1')
  const [messages, setMessages] = useState(DUMMY_CHAT_HISTORY['1']);
  
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // NEW: When the user clicks a different contact, swap the messages
  useEffect(() => {
    // 1. Get history for the clicked ID (or empty array if none exists)
    const history = DUMMY_CHAT_HISTORY[activeChatId] || [];
    // 2. Update the view
    setMessages(history);
  }, [activeChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const activeUser = USERS.find(u => u.id === activeChatId) || USERS[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = {
      id: Date.now(),
      senderId: 'me',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages([...messages, newMsg]);
    setInputValue('');
  };

  // 1. Define the shape of a single status object
    type StatusStyle = {
      color: string;
      bg: string;
      label: string;
      animation: string;
    };

  // 2. Define the styles for each status type
  const statusConfig: Record<string, StatusStyle> = {    online: { 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-400', 
      label: 'Online', 
      animation: 'animate-pulse' 
    },
    dnd: { 
      color: 'text-red-500', 
      bg: 'bg-red-500', 
      label: 'Do Not Disturb', 
      animation: '' 
    },
    offline: { 
      color: 'text-slate-500', 
      bg: 'bg-slate-500', 
      label: 'Offline', 
      animation: '' 
    },
    idle: { 
      color: 'text-amber-400', 
      bg: 'bg-amber-400', 
      label: 'Away', 
      animation: '' 
    }
  };

  // 3. Get the current style (fallback to 'offline' if status is missing)
  // Ensure activeUser.status matches the keys above (e.g., 'online', 'dnd')
  const statusStyle = statusConfig[activeUser.status] || statusConfig.offline;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8">
      
      {/* Main Window Container */}
      <div className="w-full max-w-6xl h-[85vh] bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* --- LEFT SIDEBAR (Contacts) --- */}
        <div className="w-full md:w-80 bg-slate-900/80 border-r border-slate-800 flex flex-col">
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800">
            <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 mb-4 cursor-pointer">
              <Plus size={18} />
              <span>New Invocation</span>
            </button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search Initiates..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => setActiveChatId(user.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group ${
                  activeChatId === user.id 
                    ? 'bg-purple-500/10 border border-purple-500/20' 
                    : 'hover:bg-slate-800 border border-transparent'
                }`}
              >
                {/* Avatar Placeholder */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-serif font-bold border border-slate-600">
                    {user.name[0]}
                  </div>
                  {/* Status Dot */}
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    user.status === 'online' ? 'bg-emerald-500' : 
                    user.status === 'dnd' ? 'bg-red-500' : 'bg-slate-500'
                  }`}></span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className={`font-medium truncate ${activeChatId === user.id ? 'text-purple-300' : 'text-slate-300 group-hover:text-white'}`}>
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500">{user.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate group-hover:text-slate-400">
                    {user.lastMsg}
                  </p>
                </div>

                {user.unread > 0 && (
                  <span className="bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {user.unread}
                  </span>
                )}
              </button>
            ))}
            Avatarrs will show once I connect this to a functional system.
          </div> 
        </div>

        {/* --- RIGHT MAIN CHAT --- */}
        <div className="flex-1 flex flex-col bg-slate-950/30 relative">
          
          {/* Chat Header */}
          <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-serif font-bold border border-slate-600">
                  {activeUser.name[0]}
               </div>
               <div>
                 <h2 className="font-bold text-slate-100">{activeUser.name}</h2>
                 <p className={`text-xs flex items-center gap-1.5 font-medium ${statusStyle.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.bg} ${statusStyle.animation}`}></span>
                  {statusStyle.label}
                </p>
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-purple-400 transition-colors"><Phone size={20} /></button>
              <button className="hover:text-purple-400 transition-colors"><Video size={20} /></button>
              <div className="w-px h-6 bg-slate-700 mx-1"></div>
              <button className="hover:text-white transition-colors"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth"
            style={{ backgroundImage: 'radial-gradient(circle at center, rgba(88, 28, 135, 0.05) 0%, transparent 70%)' }}
          >
            {/* Date Separator */}
            <div className="flex justify-center">
              <span className="text-[10px] font-medium text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
                December 7
              </span>
            </div>

            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isMe && (
                   <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs text-slate-300 border border-slate-600 mt-1">
                      {activeUser.name[0]}
                   </div>
                )}
                
                <div className={`max-w-[70%] sm:max-w-[60%] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.isMe 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'}
                  `}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <form onSubmit={handleSend} className="relative flex items-center gap-3">
              <button type="button" className="text-slate-400 hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-slate-800">
                <Paperclip size={20} />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Message ${activeUser.name}...`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 placeholder:text-slate-600 shadow-inner"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-400 transition-colors">
                  <Smile size={20} />
                </button>
              </div>

              <button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl shadow-lg shadow-purple-900/20 transition-all transform hover:scale-105"
              >
                <Send size={20} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}