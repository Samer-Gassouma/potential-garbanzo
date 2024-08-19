"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Chats({ onSelectChat }) {
    const [chats, setChats] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:3001/get-ip');
                const { ip: sessionId } = await response.json();

                const authResponse = await fetch(`http://localhost:3001/ready/${sessionId}`);
                const authData = await authResponse.json();

                if (!authData.ready) {
                    router.push('/auth');
                    return;
                }

                fetch(`http://localhost:3001/chats/${sessionId}`)
                    .then(response => response.json())
                    .then(data => {
                        setChats(data);
                        setFilteredChats(data); // Initialize filtered chats
                    })
                    .catch(error => console.error('Error fetching chats:', error));
            } catch (error) {
                console.error('Error checking authentication:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const filtered = chats.filter(chat =>
                (chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (chat.id?.user && chat.id.user.includes(searchQuery)))
            );
            setFilteredChats(filtered);
        } else {
            setFilteredChats(chats); 
        }
    }, [searchQuery, chats]);

    if (loading) {
        return <div>Loading chats...</div>;
    }

    return (
        <aside className="w-1/3 bg-white border-r border-gray-300 flex flex-col overflow-y-scroll">
            <header className="p-4 bg-gray-100 border-b border-gray-300">
                <h2 className="text-lg font-bold">Chats</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or number"
                    className="mt-2 p-2 w-full border border-gray-300 rounded"
                />
            </header>
            <ul className="list-none p-0">
                {filteredChats.map(chat => (
                    <li
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className="p-4 border-b border-gray-300 cursor-pointer hover:bg-gray-200"
                    >
                        {chat.name || chat.id?.user}
                    </li>
                ))}
            </ul>
        </aside>
    );
}
