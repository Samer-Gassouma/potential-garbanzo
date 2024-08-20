"use client";
import { useEffect, useState, useRef } from 'react';
import UserDetails from './UserDetails';
import Image from 'next/image';
export default function Chat({ chatId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [media, setMedia] = useState(null);
    const [user, setUser] = useState({});
    const messagesEndRef = useRef(null);

    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);

    useEffect(() => {
        fetchUser();
        fetchMessages();
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUser = async () => {
        try {
            const response0 = await fetch('http://localhost:3001/get-ip');
            const { ip: sessionId } = await response0.json();
            const response = await fetch(`http://localhost:3001/user/${sessionId}?id=${chatId}`);
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };
    const fetchMessages = async () => {
        try {
            const response = await fetch('http://localhost:3001/get-ip');
            const { ip: sessionId } = await response.json();

            fetch(`http://localhost:3001/chat/${sessionId}?id=${chatId}`)
                .then(response => response.json())
                .then(data => setMessages(data.messages))
                .catch(error => console.error('Error fetching messages:', error));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('recipientId', chatId);

            try {
                const response0 = await fetch('http://localhost:3001/get-ip');
                const { ip: sessionId } = await response0.json();

                const response = await fetch(`http://localhost:3001/upload/${sessionId}`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    fetchMessages();
                } else {
                    console.error('Failed to send media');
                }
            } catch (error) {
                console.error('Error sending media:', error);
            }
        }
    };

    const sendMessage = async () => {
        if (newMessage.trim() === '' && !media) return;

        try {
            const response0 = await fetch('http://localhost:3001/get-ip');
            const { ip: sessionId } = await response0.json();

            const response = await fetch(`http://localhost:3001/send/${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: chatId, message: newMessage }),
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);

            recorder.ondataavailable = (event) => {
                setAudioChunks((prev) => [...prev, event.data]);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(audioUrl);
                setIsRecording(false);
            };

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing audio devices:', error);
            alert('Failed to access audio devices. Please try again.');
        }
    };

    const stopRecording = () => {
        mediaRecorder.stop();
        setMediaRecorder(null);
    };

    const sendAudio = async () => {
        if (!audioChunks.length) return;

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('recipientId', chatId);

        try {
            const response0 = await fetch('http://localhost:3001/get-ip');
            const { ip: sessionId } = await response0.json();

            const response = await fetch(`http://localhost:3001/upload/${sessionId}`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setAudioChunks([]);
                setAudioUrl(null);
                fetchMessages();
            } else {
                console.error('Failed to send audio');
            }
        } catch (error) {
            console.error('Error sending audio:', error);
        }
    };


    const MediaManager = (message) => {
        let mediaUrl = 'http://localhost:3001' + message.media.url.replace(/.*[\/\\]received/, '/media');

        const isImage = message.media.mimetype.startsWith('image/');
        const isAudio = message.media.mimetype.startsWith('audio/');


        switch (true) {
            case isImage:
                return <Image src={mediaUrl} width={200} height={200} alt='Media' />;
            case isAudio:
                return (
                    <>
                        <audio controls ><source src={mediaUrl} type={message.media.mimetype} /></audio>
                    </>
                );
            default:
                return (
                    <a href={mediaUrl} target="_blank" rel="noreferrer" className="block text-blue-500">
                        Download File
                    </a>
                );
        }
    }

    return (
        <div className="flex h-screen">
            <div className="flex h-screen flex-col">
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
                                <p className="text-sm text-gray-600">{user.number}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="text-sm text-white bg-green-500 p-2 rounded-full">✅: Done</span>
                            <span className="ml-4 text-sm text-gray-600">🟠: Active</span>
                        </div>
                    </div>
                </header>

                {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">No messages yet</p>
                    </div>
                )    
                :
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} mb-2`}>
                            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${msg.fromMe ? 'bg-green-400 text-white' : 'bg-white text-gray-800'} shadow`}>
                                <div className="text-sm">
                                    {msg.body && <p className="mb-1">{msg.body}</p>}
                                    {msg.media && msg.media.url && MediaManager(msg)}
                                </div>
                                <div className={`text-xs mt-1 ${msg.fromMe ? 'text-white' : 'text-gray-500'} text-right`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                }
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
                    <button
                        className={`px-4 py-2 ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white rounded-full`}
                        onClick={isRecording ? stopRecording : startRecording}
                    >
                        {isRecording ? 'Stop Recording' : 'Record'}
                    </button>
                    {audioUrl && (
                        <>
                            <audio controls src={audioUrl} className="mt-2 max-w-xs"></audio>
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-full"
                                onClick={sendAudio}
                            >
                                Send Audio
                            </button>
                        </>
                    )}
                </footer>
            </div>

            <UserDetails user={user} className="w-full md:w-1/3" />
        </div>
    );
}
