import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import CubeWithArrow from '../Cube/cubeWithArrow';
import OpponentCube from '../Cube/OpponentCube';

const TwoPlayerCubeView = () => {
  const { socket, sendMove, roomId, opponentId, setOnOpponentMove } = useSocket();
  
  const myCubeRef = useRef();
  const opponentCubeRef = useRef();
  const [currentSlice, setCurrentSlice] = useState(null);
  const [gameStatus, setGameStatus] = useState('waiting'); 

  // --- Socket and Game State Management ---
  useEffect(() => {
    if (roomId && opponentId) setGameStatus('active');
    
    const handleOpponentMove = (move) => {
      if (opponentCubeRef.current) opponentCubeRef.current.performMove(move);
    };
    setOnOpponentMove(() => handleOpponentMove);
    
    const handleOpponentLeft = () => setGameStatus('opponent_left');
    if (socket) socket.on('opponent:left', handleOpponentLeft);

    return () => {
      setOnOpponentMove(null);
      if (socket) socket.off('opponent:left', handleOpponentLeft);
    };
  }, [roomId, opponentId, setOnOpponentMove, socket]);

  // --- Keyboard Input Handling ---
  useEffect(() => {
    const digitMapping = { "1":"1","!":"1","2":"2","@":"2","3":"3","#":"3","4":"4","$":"4","5":"5","%":"5","6":"6","^":"6","7":"7","&":"7","8":"8","*":"8","9":"9","(":"9" };
    const handleKeyDown = (e) => {
      if (gameStatus !== 'active') return;
      if (digitMapping[e.key]) {
        setCurrentSlice(parseInt(digitMapping[e.key]) - 1);
        return;
      }
      if ("udlrfb".includes(e.key.toLowerCase())) {
        if (!roomId) return;
        const face = e.key.toUpperCase();
        const sliceIndex = currentSlice !== null ? currentSlice : 0;
        const clockwise = !e.shiftKey;
        const move = { face, sliceIndex, clockwise };
        sendMove(move);
        if (myCubeRef.current) myCubeRef.current.performMove(move);
        setCurrentSlice(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sendMove, currentSlice, roomId, gameStatus]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        :root {
          --clr-dark: #070a13;
          --clr-light: #f1f5f9;
          --clr-slate400: #94a3b8;
          --clr-slate600: #1e293b;
          --clr-rose: #e11d48;
          --clr-indigo: #4f46e5;
          --size-xs: 0.75rem;
          --size-base: 1rem;
          --size-xl: 1.25rem;
          --size-3xl: 1.875rem;
        }
        .pulsing-dot {
          display: inline-block;
          width: var(--size-xs);
          height: var(--size-xs);
          background-color: var(--clr-indigo);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          margin: 0 2px;
        }
        .pulsing-dot:nth-child(2) { animation-delay: 0.2s; }
        .pulsing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: 'var(--clr-dark)',
        color: 'var(--clr-light)',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden' 
      }}>
       
        <main style={{
          display: 'flex',
          flex: 1,
          padding: 'var(--size-base)',
          gap: 'var(--size-base)',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%', /* Ensure main takes full height */
          overflow: 'hidden'
        }}>
          
          {/* PLAYER CARD */}
          <PlayerCard name="You">
            <CubeWithArrow ref={myCubeRef} canvasId="myCubeCanvas" cubeSize={3} />
          </PlayerCard>

          {/* MIDDLE STATUS */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '150px',
            textAlign: 'center',
            flexShrink: 0 /* Prevent status from squishing */
          }}>
            {gameStatus === 'waiting' && <StatusIndicator text="Finding Match" />}
            {gameStatus === 'active' && <VsIndicator />}
            {gameStatus === 'opponent_left' && <StatusMessage text="Opponent Left" />}
          </div>

          {/* OPPONENT CARD */}
          <PlayerCard name="Opponent" status={gameStatus}>
             <OpponentCube ref={opponentCubeRef} canvasId="opponentCubeCanvas" cubeSize={3} />
          </PlayerCard>
        </main>
        
      </div>
    </>
  );
};

// --- UPDATED PlayerCard Component ---
const PlayerCard = ({ name, children, status }) => (
  <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--clr-slate600)',
    borderRadius: 'var(--size-base)',
    padding: 'var(--size-base)',
    border: '1px solid hsl(225, 25%, 20%)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    maxWidth: '45vw',
    height: '80%',         /* Target Height */
    maxHeight: '85vh',     /* HARD LIMIT: Never go taller than this */
    overflow: 'hidden',    /* CUT OFF any overflow */
    opacity: (name === 'Opponent' && status === 'waiting') ? 0.3 : 1,
    transition: 'opacity 0.3s ease-in-out',
  }}>
    <h2 style={{ margin: '0 0 var(--size-base) 0', color: 'var(--clr-light)', fontWeight: 600, fontSize: 'var(--size-xl)', textAlign: 'center', flexShrink: 0 }}>{name}</h2>
    
    {/* CONTAINER FOR CANVAS */}
    <div style={{ 
      flex: 1, 
      width: '100%', 
      position: 'relative',  /* Crucial for absolute child */
      minHeight: 0           /* Allow shrinking */
    }}>
      {children}
    </div>
  </div>
);

const VsIndicator = () => <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--clr-indigo)' }}>VS</div>;
const StatusIndicator = ({ text }) => (
    <div>
        <div style={{ fontSize: '1rem', color: 'var(--clr-slate400)', marginBottom: '0.5rem' }}>{text}</div>
        <div><span className="pulsing-dot"></span><span className="pulsing-dot"></span><span className="pulsing-dot"></span></div>
    </div>
);
const StatusMessage = ({ text }) => <div style={{ fontSize: '1.1rem', color: 'var(--clr-rose)', fontWeight: 600 }}>{text}</div>;

export default TwoPlayerCubeView;