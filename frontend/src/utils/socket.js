import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://manithub-backend.vercel.app";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    // Idempotent: reuse the live socket so app-wide presence and the Messages
    // page share one connection.
    if (this.socket && this.socket.connected) return this.socket;
    if (this.socket) return this.socket;
    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  markRead(conversationId) {
    if (this.socket) {
      this.socket.emit('mark_read', { conversationId });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  offReceiveMessage() {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messages_read', callback);
    }
  }

  offMessagesRead() {
    if (this.socket) {
      this.socket.off('messages_read');
    }
  }

  // --- Friend presence ---
  onPresenceSnapshot(callback) {
    if (this.socket) this.socket.on('presence_snapshot', callback);
  }

  onFriendOnline(callback) {
    if (this.socket) this.socket.on('friend_online', callback);
  }

  onFriendOffline(callback) {
    if (this.socket) this.socket.on('friend_offline', callback);
  }

  offPresence() {
    if (this.socket) {
      this.socket.off('presence_snapshot');
      this.socket.off('friend_online');
      this.socket.off('friend_offline');
    }
  }
}

export default new SocketService();
