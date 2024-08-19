"use client";
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import UserDetails from './UserDetails';
export default function Chat({ chatId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [media, setMedia] = useState(null);

    const user = {
        name: "Haidy MG",
        phone: "+201004099066",

    };

    useEffect(() => {
        const socket = io('http://localhost:3001');

        socket.on('message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('message');
        };
    }, [chatId]);


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('caption', ''); // Add a caption if needed

            try {
                await fetch(`http://localhost:3001/send-media/${chatId}`, {
                    method: 'POST',
                    body: formData,
                });
            } catch (error) {
                console.error('Error sending media:', error);
            }
        }
    };


    useEffect(() => {
        fetchMessages();
    }, [chatId]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:3001/messages/${chatId}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
    const sendMessage = async () => {
        if (newMessage.trim() === '' && !media) return;

        try {
            const response = await fetch('http://localhost:3001/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId, message: newMessage }),
            });

            if (response.ok) {
                setMessages(prevMessages => [...prevMessages, { body: newMessage, fromMe: true }]);
                setNewMessage('');
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    console.log('messages', messages);
    return (
        <div className="flex h-screen">
            <div className="flex-1 p-4 overflow-y-scroll">
                <main className="flex-1 flex flex-col">
                    <header className="p-4 bg-gray-100 border-b border-gray-300">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <img
                                    src="/user.png"
                                    alt="User Avatar"
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="ml-4">
                                    <h2 className="text-xl font-semibold">{user.name}</h2>
                                    <p className="text-sm text-gray-600">{user.phone}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className="text-sm text-white bg-green-500 p-2 rounded-full">✅: Done</span>
                                <span className="ml-4 text-sm text-gray-600">🟠: Active</span>
                            </div>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className="mb-2 p-4 border rounded-lg">
                                <strong>{msg.fromMe ? 'You' : chatId}:</strong>
                                {msg.body && <p>{msg.body}</p>}
                                {msg.media && (
                                    <div>
                                        {msg.media.mimetype.startsWith('image/') && (
                                            <img src={`http://localhost:3001/${msg.media.path}`} alt="Media" className="mt-2 max-w-xs" />
                                        )}
                                        {msg.media.mimetype.startsWith('video/') && (
                                            <video controls className="mt-2 max-w-xs">
                                                <source src={`http://localhost:3001/${msg.media.path}`} type={msg.media.mimetype} />
                                            </video>
                                        )}
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                    <footer className="p-4 border-t border-gray-300 flex bg-white items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                aria-label="Upload file"
                            />
                            <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full">📎Upload</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Type a message"
                            className="flex-1 p-2 border rounded-full border-gray-300"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            aria-label="Type a message"
                        />
                        <button
                            className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                            onClick={sendMessage}
                            disabled={newMessage.trim() === ''}
                        >
                            Send
                        </button>
                    </footer>
                </main>
            </div>
            <UserDetails user={user} className="w-full md:w-1/3" />

        </div>
    );
}
