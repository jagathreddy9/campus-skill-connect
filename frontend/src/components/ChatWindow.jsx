import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, Paperclip, File, Image as ImageIcon, X, Check, CheckCheck } from 'lucide-react';
import io from 'socket.io-client';

const ChatWindow = ({ chatWith, onClose }) => {
    const { user, token } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [uploading, setUploading] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);
        newSocket.emit('join', user.id);

        newSocket.on('receiveMessage', (msg) => {
            if (
                (msg.senderId._id === chatWith._id && msg.receiverId._id === user.id) ||
                (msg.senderId._id === user.id && msg.receiverId._id === chatWith._id)
            ) {
                setMessages(prev => [...prev, msg]);
                // If I am receiving this message, mark it as read immediately
                if (msg.receiverId._id === user.id) {
                    newSocket.emit('markAsRead', { messageId: msg._id, senderId: msg.senderId._id });
                }
            }
        });

        newSocket.on('messageRead', ({ messageId }) => {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, readStatus: true } : m));
        });

        // Load History
        const fetchHistory = async () => {
            const res = await fetch(`http://localhost:5000/api/chat/${chatWith._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMessages(data);
            
            // Mark all unread incoming messages as read
            data.forEach(m => {
                if (!m.readStatus && m.receiverId === user.id) {
                   newSocket.emit('markAsRead', { messageId: m._id, senderId: m.senderId });
                }
            });
        };
        fetchHistory();

        return () => newSocket.disconnect();
    }, [chatWith, user.id, token]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        socket.emit('sendMessage', {
            senderId: user.id,
            receiverId: chatWith._id,
            content: newMessage,
            messageType: 'text'
        });
        setNewMessage('');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1014) {
            alert("File size limit is 10MB");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://localhost:5000/api/chat/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const fileData = await res.json();
            
            if (res.ok) {
                socket.emit('sendMessage', {
                    senderId: user.id,
                    receiverId: chatWith._id,
                    messageType: 'file',
                    ...fileData
                });
            } else {
                alert(fileData.msg || "Upload failed");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ height: '550px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', background: 'rgba(15, 23, 42, 0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--color-accent)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.1)' }}>
                        {chatWith.profilePhoto ? <img src={`http://localhost:5000${chatWith.profilePhoto}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{chatWith.fullName.charAt(0)}</span>}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{chatWith.fullName}</h4>
                        <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.9, color: '#60a5fa' }}>
                            {chatWith.collegeName || (chatWith.collegeEmail ? chatWith.collegeEmail.split('@')[1].split('.')[0].toUpperCase() : 'Campus Partner')}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.65rem', opacity: 0.6 }}>{chatWith.personalEmail}</p>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--color-accent)' }}>{chatWith.collegeEmail}</p>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}><X size={18}/></button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
                {messages.map((msg, i) => {
                    const isMine = msg.senderId._id === user.id || msg.senderId === user.id;
                    return (
                        <div key={i} style={{ 
                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            background: isMine ? '#075e54' : '#1f2c33', // WhatsApp inspired colors
                            borderTopRightRadius: isMine ? '2px' : '12px',
                            borderTopLeftRadius: isMine ? '12px' : '2px',
                            color: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            position: 'relative',
                            marginBottom: '4px'
                        }}>
                            {msg.messageType === 'file' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {msg.fileType?.startsWith('image/') ? (
                                        <img src={`http://localhost:5000${msg.fileUrl}`} alt="Sent" style={{ maxWidth: '100%', borderRadius: '6px', maxHeight: '250px', cursor: 'pointer' }} onClick={() => window.open(`http://localhost:5000${msg.fileUrl}`)} />
                                    ) : (
                                        <a href={`http://localhost:5000${msg.fileUrl}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', textDecoration: 'none', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ background: 'var(--color-accent)', padding: '6px', borderRadius: '4px' }}><File size={16} /></div>
                                            <span style={{ fontSize: '0.85rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.fileName}</span>
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.4', paddingRight: isMine ? '30px' : '0' }}>{msg.content}</p>
                            )}
                            
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                justifyContent: 'flex-end',
                                marginTop: '4px',
                                opacity: 0.6
                            }}>
                                <span style={{ fontSize: '0.65rem' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMine && (
                                    <span>
                                        {msg.readStatus ? <CheckCheck size={14} color="#34b7f1" /> : <CheckCheck size={14} />}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', background: '#1f2c33', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ cursor: 'pointer', color: '#8696a0', padding: '4px' }}>
                    <Paperclip size={22} />
                    <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading}/>
                </label>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                        type="text" 
                        className="input-field" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder={uploading ? "Uploading..." : "Type a message..."} 
                        style={{ 
                            marginBottom: 0, 
                            borderRadius: '24px', 
                            background: '#2a3942', 
                            border: 'none', 
                            padding: '12px 20px',
                            color: 'white',
                            fontSize: '0.95rem'
                        }}
                        disabled={uploading}
                    />
                </div>
                <button type="submit" style={{ background: '#00a884', border: 'none', color: 'white', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} disabled={uploading || !newMessage.trim()}>
                    <Send size={20} fill="white" />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
