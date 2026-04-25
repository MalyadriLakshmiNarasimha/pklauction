import React, { createContext, useContext, useReducer, useCallback } from 'react';

const AuctionContext = createContext(null);

const INITIAL_STATE = {
  // Room
  roomCode: null,
  roomName: 'PKL Auction',
  roomConfig: { purse: 100, squadSize: 15, timerDuration: 30, bidIncrement: 0.5 },
  participants: [],   // { id, name, email, avatar, isAdmin, color, isReady }
  isAdmin: false,
  currentUser: null,  // populated from auth

  // Auction lifecycle
  auctionStatus: 'waiting', // waiting | active | paused | round_transition | completed
  currentRound: 'normal',   // normal | unsold
  roundTransitionTimer: null,

  // Current player up for bid
  currentPlayer: null,
  currentBid: 0,
  currentBidder: null,
  playerStatus: null, // null | 'sold' | 'unsold'

  // Timer
  timer: 30,
  timerRunning: false,

  // Player pools
  playerQueue: [],
  currentPlayerIndex: 0,
  unsoldPlayers: [],
  soldPlayers: [],
  selectedPlayerIds: new Set(), // host-selected players for round 1

  // Teams: { [userId]: { id, name, color, purse, players:[], isReady } }
  teams: {},

  // Activity & chat
  activityFeed: [],
  chatMessages: [],
};

function auctionReducer(state, action) {
  switch (action.type) {

    // ── Room setup ──────────────────────────────────────────
    case 'INIT_ROOM':
      return {
        ...state,
        roomCode: action.payload.code,
        roomName: action.payload.name || 'PKL Auction',
        roomConfig: { ...state.roomConfig, ...action.payload.config },
        isAdmin: action.payload.isAdmin,
        currentUser: action.payload.currentUser,
      };

    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };

    case 'ADD_PARTICIPANT': {
      const exists = state.participants.find(p => p.id === action.payload.id);
      if (exists) return state;
      return { ...state, participants: [...state.participants, action.payload] };
    }

    case 'REMOVE_PARTICIPANT':
      return { ...state, participants: state.participants.filter(p => p.id !== action.payload) };

    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };

    // ── Team management ─────────────────────────────────────
    case 'INIT_TEAMS': {
      const teams = {};
      action.payload.forEach(p => {
        teams[p.id] = {
          id: p.id, name: p.name, color: p.color,
          purse: state.roomConfig.purse, players: [], isReady: false,
        };
      });
      return { ...state, teams };
    }

    case 'SET_TEAM_READY': {
      const { userId, ready } = action.payload;
      return {
        ...state,
        teams: {
          ...state.teams,
          [userId]: { ...state.teams[userId], isReady: ready },
        },
        participants: state.participants.map(p =>
          p.id === userId ? { ...p, isReady: ready } : p
        ),
      };
    }

    // ── Auction lifecycle ───────────────────────────────────
    case 'SET_AUCTION_STATUS': return { ...state, auctionStatus: action.payload };
    case 'SET_CURRENT_ROUND': return { ...state, currentRound: action.payload };
    case 'SET_PLAYER_QUEUE':
      return {
        ...state,
        playerQueue: action.payload,
        currentPlayerIndex: 0,
        currentPlayer: action.payload[0] || null,
        currentBid: action.payload[0]?.basePrice || 0,
        currentBidder: null,
        playerStatus: null,
      };

    case 'SET_CURRENT_PLAYER':
      return {
        ...state,
        currentPlayer: action.payload,
        currentBid: action.payload?.basePrice || 0,
        currentBidder: null,
        playerStatus: null,
        timer: state.roomConfig.timerDuration,
        timerRunning: true,
      };

    case 'SET_PLAYER_STATUS': return { ...state, playerStatus: action.payload };

    // ── Timer ───────────────────────────────────────────────
    case 'SET_TIMER': return { ...state, timer: action.payload };
    case 'SET_TIMER_RUNNING': return { ...state, timerRunning: action.payload };
    case 'TICK_TIMER': return { ...state, timer: Math.max(0, state.timer - 1) };
    case 'RESET_TIMER':
      return { ...state, timer: state.roomConfig.timerDuration, timerRunning: true };

    // ── Bidding ─────────────────────────────────────────────
    case 'PLACE_BID': {
      const { amount, bidder } = action.payload;
      return {
        ...state,
        currentBid: amount,
        currentBidder: bidder,
        timer: state.roomConfig.timerDuration,
        timerRunning: true,
        activityFeed: [
          { id: Date.now() + Math.random(), type: 'bid', message: `${bidder.name} bid ₹${amount.toFixed(2)} Cr`, timestamp: Date.now() },
          ...state.activityFeed.slice(0, 49),
        ],
      };
    }

    // ── Sell / Unsold ───────────────────────────────────────
    case 'SELL_PLAYER': {
      const { player, buyer, price } = action.payload;
      const existingTeam = state.teams[buyer.id] || {
        id: buyer.id, name: buyer.name, color: buyer.color,
        purse: state.roomConfig.purse, players: [], isReady: false,
      };
      return {
        ...state,
        playerStatus: 'sold',
        timerRunning: false,
        soldPlayers: [...state.soldPlayers, { ...player, soldTo: buyer.id, soldPrice: price }],
        teams: {
          ...state.teams,
          [buyer.id]: {
            ...existingTeam,
            purse: existingTeam.purse - price,
            players: [...existingTeam.players, { ...player, price }],
          },
        },
        activityFeed: [
          { id: Date.now() + Math.random(), type: 'sold', message: `${player.name} SOLD to ${buyer.name} for ₹${price.toFixed(2)} Cr`, timestamp: Date.now() },
          ...state.activityFeed.slice(0, 49),
        ],
      };
    }

    case 'UNSOLD_PLAYER': {
      const player = action.payload;
      const shouldQueue = state.currentRound === 'normal';
      return {
        ...state,
        playerStatus: 'unsold',
        timerRunning: false,
        unsoldPlayers: shouldQueue ? [...state.unsoldPlayers, player] : state.unsoldPlayers,
        activityFeed: [
          { id: Date.now() + Math.random(), type: 'unsold', message: `${player.name} went UNSOLD`, timestamp: Date.now() },
          ...state.activityFeed.slice(0, 49),
        ],
      };
    }

    case 'ADVANCE_PLAYER': {
      const nextIndex = state.currentPlayerIndex + 1;
      const nextPlayer = state.playerQueue[nextIndex] || null;
      return {
        ...state,
        currentPlayerIndex: nextIndex,
        currentPlayer: nextPlayer,
        currentBid: nextPlayer?.basePrice || 0,
        currentBidder: null,
        playerStatus: null,
        timer: state.roomConfig.timerDuration,
        timerRunning: !!nextPlayer,
      };
    }

    // ── Player selection (host) ─────────────────────────────
    case 'SET_SELECTED_PLAYER_IDS':
      return { ...state, selectedPlayerIds: action.payload };

    // ── Activity & chat ─────────────────────────────────────
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activityFeed: [action.payload, ...state.activityFeed.slice(0, 49)],
      };

    case 'ADD_CHAT':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };

    case 'RESET': return { ...INITIAL_STATE };

    default: return state;
  }
}

export function AuctionProvider({ children }) {
  const [state, dispatch] = useReducer(auctionReducer, INITIAL_STATE);

  const placeBid = useCallback((amount, bidder) => {
    dispatch({ type: 'PLACE_BID', payload: { amount, bidder } });
  }, []);

  const sellPlayer = useCallback((player, buyer, price) => {
    dispatch({ type: 'SELL_PLAYER', payload: { player, buyer, price } });
  }, []);

  const markUnsold = useCallback((player) => {
    dispatch({ type: 'UNSOLD_PLAYER', payload: player });
  }, []);

  const addActivity = useCallback((type, message) => {
    dispatch({ type: 'ADD_ACTIVITY', payload: { id: Date.now() + Math.random(), type, message, timestamp: Date.now() } });
  }, []);

  return (
    <AuctionContext.Provider value={{ state, dispatch, placeBid, sellPlayer, markUnsold, addActivity }}>
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be used within AuctionProvider');
  return ctx;
}