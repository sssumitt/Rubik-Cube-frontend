import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

// const SOCKET_URL = "http://localhost:5000";
const SOCKET_URL = "https://rubik-cube-backend-multiplayer.onrender.com";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [scramble, setScramble] = useState(null);
  const [winner, setWinner] = useState(null);
  const [cubeSize, setCubeSize] = useState(3);
  const [isConnected, setIsConnected] = useState(false);

  // --- FIX: Direct Ref Handler (No useState) ---
  const onOpponentMoveRef = useRef(null);

  // Call this from the component to register the handler
  const setOnOpponentMove = useCallback((fn) => {
    onOpponentMoveRef.current = fn;
  }, []);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.on("connect", () => {
      console.log("Connected to socket:", socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on("game:start", ({ roomId, players, scramble, cubeSize }) => {
      setRoomId(roomId);
      const opponent = players.find(id => id !== socketRef.current.id);
      setOpponentId(opponent);
      setScramble(scramble);
      if (cubeSize) setCubeSize(cubeSize);
      setWinner(null);
    });

    // Always call the latest ref function
    socketRef.current.on("opponent:move", (move) => {
      if (onOpponentMoveRef.current) {
        onOpponentMoveRef.current(move);
      }
    });

    socketRef.current.on("game:over", ({ winnerId }) => {
      console.log("Socket: Received game:over. Winner:", winnerId);
      setWinner(winnerId);
    });

    socketRef.current.on("disconnect", () => setIsConnected(false));

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMove = useCallback((move) => {
    if (!roomId) return;
    socketRef.current.emit("move", { roomId, move });
  }, [roomId]);

  const declareWin = useCallback(() => {
    console.log("Socket: declareWin called. RoomId:", roomId);
    if (!roomId) {
      console.error("Socket: Cannot declare win, no roomId!");
      return;
    }
    socketRef.current.emit("game:won", { roomId });
  }, [roomId]);

  const joinQueue = useCallback((size) => {
    if (socketRef.current && user) {
      // Reset all game state to prevent "ghost" data from previous games
      setWinner(null);
      setScramble(null);
      setRoomId(null);
      setOpponentId(null);

      setCubeSize(size);
      socketRef.current.emit("join_queue", { size, userId: user.id });
    }
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        sendMove,
        declareWin,
        joinQueue,
        roomId,
        opponentId,
        scramble,
        winner,
        cubeSize,
        setOnOpponentMove // Export the new direct setter
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};