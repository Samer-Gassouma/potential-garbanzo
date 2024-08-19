"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Auth() {
    const [qrCode, setQrCode] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Fetch the user's public IP address to use as session ID
        fetch('http://localhost:3001/get-ip')
            .then(response => response.json())
            .then(data => {
                const sessionId = data.ip;

                // Fetch the QR code for the session
                fetch(`http://localhost:3001/qr/${sessionId}`)
                    .then(response => {
                        if (response.ok) {
                            return response.text(); // QR code URL
                        } else {
                            throw new Error('Failed to get QR code');
                        }
                    })
                    .then(qr => {
                        setQrCode(qr);
                    })
                    .catch(error => {
                        console.error('Error fetching QR code:', error);
                    });

                // Poll the backend to check if the session is authenticated
                const checkAuthInterval = setInterval(() => {
                    fetch(`http://localhost:3001/ready/${sessionId}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.ready) {
                                clearInterval(checkAuthInterval);
                                router.push('/'); // Redirect to the main chat page
                            }
                        })
                        .catch(error => {
                            console.error('Error checking session readiness:', error);
                        });
                }, 2000);
            });
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-900">
            <div className="bg-white p-8 rounded shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Scan the QR Code</h1>
                {qrCode ? (
                    <img
                        src={qrCode}
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
