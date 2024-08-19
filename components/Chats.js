"use client"
import { useEffect, useState } from 'react';

export default function Chats({ onSelectChat }) {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/chats')
            .then(response => response.json())
            .then(data => setChats(data))
            .catch(error => console.error('Error fetching chats:', error));
    }, []);

    return (
        <aside className="w-1/3 bg-white border-r border-gray-300 flex flex-col overflow-y-scroll">
            <header className="p-4 bg-gray-100 border-b border-gray-300">
                <h2 className="text-lg font-bold">Chats</h2>
            </header>
            <ul className="list-none p-0">
                {chats.map(chat => (
                    <li
                        key={chat.id._serialized}
                        onClick={() => onSelectChat(chat.id._serialized)}
                        className="p-4 border-b border-gray-300"
                    >
                        {chat.name || chat.formattedTitle || chat.id.user}
                    </li>
                ))}
            </ul>
        </aside>
    );
}
