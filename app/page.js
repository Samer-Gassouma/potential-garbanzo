"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chats from '@/components/Chats';
import Chat from '@/components/Chat';

export default function Home() {
    const router = useRouter();
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Fetch the user's public IP address to use as session ID
        fetch('http://localhost:3001/get-ip')
            .then(response => response.json())
            .then(data => {
                const sessionId = data.ip;

                // Check if the session is authenticated
                fetch(`http://localhost:3001/ready/${sessionId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.ready) {
                            router.push('/auth'); // Redirect to the auth page
                        }
                    });

                // Fetch initial chat messages when a chat is selected
                if (selectedChatId) {
                    fetch(`http://localhost:3001/chat/${sessionId}?id=${selectedChatId}`)
                        .then(response => response.json())
                        .then(data => setMessages(data.messages))
                        .catch(error => console.error('Error fetching messages:', error));
                }
            });
    }, [router, selectedChatId]);

    const sendMessage = (chatId, message) => {
        fetch(`http://localhost:3001/send/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: chatId, message }),
        })
            .then(response => response.ok)
            .then(() => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { body: message, fromMe: true, timestamp: Date.now() },
                ]);
            })
            .catch(error => console.error('Error sending message:', error));
    };

    return (
        <div className="flex h-screen bg-gray-100 border border-gray-300 text-gray-800">
            <Chats onSelectChat={setSelectedChatId} />
            {selectedChatId ? (
                <Chat
                    chatId={selectedChatId}
                    messages={messages}
                    onSendMessage={sendMessage}
                />
            ) : (
                <div>Select a chat to view messages</div>
            )}
        </div>
    );
}
