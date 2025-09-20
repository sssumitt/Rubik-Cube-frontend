import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Ensure this matches your server

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // State to track connection

  const onOpponentMoveRef = useRef(null);

  const [onOpponentMove, setOnOpponentMove] = useState(null);
  useEffect(() => {
    onOpponentMoveRef.current = onOpponentMove;
  }, [onOpponentMove]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.on("connect", () => {
      console.log("Connected to Socket.io:", socketRef.current.id);
      setIsConnected(true); // Trigger a re-render by setting state
    });

    socketRef.current.on("game:start", ({ roomId, players }) => {
      setRoomId(roomId);
      const opponent = players.find(id => id !== socketRef.current.id);
      setOpponentId(opponent);
      console.log("Game started in room:", roomId, "Opponent:", opponent);
    });

    socketRef.current.on("opponent:move", (move) => {
      console.log("Opponent move received:", move);
      if (onOpponentMoveRef.current) onOpponentMoveRef.current(move);
    });
    
    socketRef.current.on("disconnect", () => {
        setIsConnected(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMove = (move) => {
    if (!roomId) {
        console.log("Cannot send move, not in a room.");
        return;
    }
    socketRef.current.emit("move", { roomId, move });
  };

  return (
    <SocketContext.Provider 
      value={{ 
        socket: socketRef.current, // <-- THE FIX: Expose the socket instance
        sendMove, 
        roomId, 
        opponentId, 
        setOnOpponentMove 
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

