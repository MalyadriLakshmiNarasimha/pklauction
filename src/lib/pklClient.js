/**
 * PKL Auction - Socket & API client abstraction
 * Drop in your Socket.io server URL to enable real-time features.
 * Currently operates in local-state mode (no socket dependency).
 */

// Socket.io integration placeholder
// import { io } from 'socket.io-client';
// export const socket = io(import.meta.env.VITE_PKL_SERVER_URL);

export const PKL_VERSION = '1.0.0';
export const PKL_THEME = {
  green: '#009B4D',
  yellow: '#FFCC00',
  ivory: '#FAF5E9',
  dark: '#0B0B0F',
};

/** Generate a random 6-char room code */
export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** Format crore currency */
export function formatCrore(val) {
  if (typeof val !== 'number') return '₹0 Cr';
  return `₹${val.toFixed(2)} Cr`;
}

/** Get initials from name */
export function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}