"use client"
import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

const socket = io('http://localhost:3001');

export default function Auth() {
    const [qrCode, setQrCode] = useState('');
    const router = useRouter();

    useEffect(() => {
        socket.on('qr', (qr) => {
            setQrCode(qr);
        });

        socket.on('authenticated', () => {
            router.push('/'); // Redirect to the main chat page
        });

        return () => {
            socket.off('qr');
            socket.off('authenticated');
        };
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-900">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Scan the QR Code</h1>
                {qrCode ? (
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}`}
                        alt="QR Code"
                        className="mx-auto"
                    />
                ) : (
                    <p>Loading QR Code...</p>
                )}
            </div>
        </div>
    );
}
