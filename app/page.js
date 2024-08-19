"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';
import Chats from '@/components/Chats';
import Contacts from '@/components/Contacts';
import Chat from '@/components/Chat';

const socket = io('http://localhost:3001');

export default function Home() {

  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  useEffect(() => {
    
    fetch('http://localhost:3001/isAuthenticated')
      .then((response) => response.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/auth');
        }
      });

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-100 border border-gray-300 text-gray-800">
      <Chats onSelectChat={setSelectedChatId} />
      {selectedChatId ? <Chat chatId={selectedChatId} /> : <div>Select a chat to view messages</div>}

    
    </div>
  );
}
