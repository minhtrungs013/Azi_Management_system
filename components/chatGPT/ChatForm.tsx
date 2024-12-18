'use client';
import { useEffect, useState } from 'react';

interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
}

interface Choice {
    index: number;
    message: {
        content: string;
    };
}

const ChatForm = () => {
    const [message, setMessage] = useState<string>(''); // Input từ người dùng
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); // Lịch sử tin nhắn
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setChatMessages([{ role: 'bot', content: 'Hello' },
        { role: 'bot', content: 'Welcome to AZI chatbot!' },
        { role: 'bot', content: "I'm here to help 😊" }]);
    }, []);

    // Xử lý thay đổi input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };

    // Gửi yêu cầu đến API
    const onSubmit = async (prompt: string) => {
        setIsLoading(true);

        // Thêm tin nhắn người dùng vào mảng chatMessages
        setChatMessages((prev) => [...prev, { role: 'user', content: prompt }]);

        try {
            const response = await fetch('http://192.168.188.70:3000/api/chat-gpt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (response.ok) {
                const result = await response.json();

                // Lấy tin nhắn từ API và thêm vào mảng chatMessages
                const botResponse = result.choices[0]?.message.content || 'No response';
                setChatMessages((prev) => [...prev, { role: 'bot', content: botResponse }]);
            } else {
                console.error('Failed to fetch data from API');
                setChatMessages((prev) => [
                    ...prev,
                    { role: 'bot', content: 'Error: Unable to get a response' },
                ]);
            }
        } catch (error) {
            console.error('Error during fetch:', error);
            setChatMessages((prev) => [
                ...prev,
                { role: 'bot', content: 'Error: Something went wrong' },
            ]);
        }
        setIsLoading(false);
    };

    // Xử lý gửi tin nhắn
    const handleSubmit = () => {
        if (message.trim() !== '') {
            onSubmit(message); // Gửi tin nhắn
            setMessage(''); // Reset ô input
        }
    };

    return (
        <div className="fixed bottom-28 right-4 bg-white shadow-lg rounded-lg w-80 p-4 z-50">
            <h3 className="text-lg font-semibold mb-4">Chat with us! ✨🚀💖</h3>

            {/* Hiển thị lịch sử chat */}
            <div className="flex flex-col mb-4 max-h-60 overflow-y-auto space-y-2">
                {chatMessages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`p-2 rounded-lg shadow text-sm  max-w-52 ${msg.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ô nhập tin nhắn */}
            <div className="flex items-center space-x-2">
                <input
                    className="flex-1 p-2 h-10 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message..."
                    value={message}
                    onChange={handleInputChange}
                ></input>

                {/* Nút gửi */}
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={isLoading || !message.trim()}
                >
                    {isLoading ? '...' : '➤'}
                </button>
            </div>
        </div>
    );
};

export default ChatForm;
