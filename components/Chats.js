"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Chats({ onSelectChat }) {
    const [chats, setChats] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]); // State for selected users
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

                const chatResponse = await fetch(`http://localhost:3001/chats/${sessionId}`);
                const chatData = await chatResponse.json();
                setChats(chatData);
                setFilteredChats(chatData);

            } catch (error) {
                console.error('Error checking authentication:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);

            if (searchQuery.trim()) {
                setSearching(true);
                try {
                    const response = await fetch('http://localhost:3001/get-ip');
                    const { ip: sessionId } = await response.json();

                    const contactResponse = await fetch(`http://localhost:3001/contacts/${sessionId}`);
                    const contactData = await contactResponse.json();
                    setContacts(contactData);

                    const mergedData = [...chats, ...contactData];
                    const filtered = mergedData.filter(item =>
                    (item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.id?.user && item.id.user.includes(searchQuery)))
                    );
                    setFilteredChats(filtered);

                } catch (error) {
                    console.error('Error fetching contacts:', error);
                }
            } else {
                setFilteredChats(chats);
                setSearching(false);
            }

            setLoading(false);
        };

        performSearch();
    }, [searchQuery, chats]);

    const handleUserSelect = (userId) => {
        setSelectedUsers(prevSelected => {
            if (prevSelected.includes(userId)) {
                return prevSelected.filter(id => id !== userId);
            } else {
                return [...prevSelected, userId];
            }
        });
    };

    const handleSendMessageToSelectedUsers = () => {
        onSelectChat(selectedUsers);
        setSelectedUsers([]); // Clear selection after sending
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:3001/get-ip');
            const { ip: sessionId } = await response.json();

            const logoutResponse = await fetch(`http://localhost:3001/logout/${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const logoutData = await logoutResponse.json();

            if (logoutData.success) {
                router.push('/auth');
            }

        } catch (error) {
            console.error('Error logging out:', error);
            router.push('/auth');
        }
    }

    return (
        <aside className="w-1/3 bg-white border-r border-gray-300 flex flex-col overflow-y-scroll">
            <header className="p-4 bg-gray-100 border-b border-gray-300">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Chats</h2>
                    <div className="flex items-center">
                        <button className="bg-red-500 text-white p-2 rounded" onClick={handleLogout}>
                            Logout
                        </button>
                        <button className="bg-blue-500 text-white p-2 rounded ml-2" onClick={() => router.push('/Clients')}>
                            Clients
                        </button>
                    </div>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or number"
                    className="mt-2 p-2 w-full border border-gray-300 rounded"
                />
                {selectedUsers.length > 0 && (
                    <button 
                        className="mt-2 p-2 bg-green-500 text-white rounded"
                        onClick={handleSendMessageToSelectedUsers}
                    >
                        Send Message to Selected Users
                    </button>
                )}
            </header>
            {loading ? <p className="p-4 text-center">Loading...</p> :
                <ul className="list-none p-0">
                    {filteredChats.map(item => (
                        <li
                            key={item.id?.user || item.id}
                            onClick={() => handleUserSelect(item.id?.user || item.id)}
                            className={`p-4 border-b border-gray-300 cursor-pointer hover:bg-gray-200 ${selectedUsers.includes(item.id?.user || item.id) ? 'bg-gray-300' : ''}`}
                        >
                            {item.name || item.id?.user}
                        </li>
                    ))}
                </ul>
            }
        </aside>
    );
}
