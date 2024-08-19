"use client"
import { useEffect, useState } from 'react';

export default function Contacts() {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/contacts')
            .then(response => response.json())
            .then(data => setContacts(data))
            .catch(error => console.error('Error fetching contacts:', error));
    }, []);

    return (
        <aside className="w-1/3 bg-gray-200 p-4">
            <h2 className="text-xl font-bold">Contacts</h2>
            <ul>
                {contacts.map(contact => (
                    <li key={contact.id._serialized}>
                        {contact.name || contact.pushname || contact.number}
                    </li>
                ))}
            </ul>
        </aside>
    );
}
