import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import CubeWithArrow from '../Cube/cubeWithArrow';
import OpponentCube from '../Cube/OpponentCube';
// Import the generic logic
import { getInitialState, applyMoveObject, checkSolved } from '../Cube/CubeStateUtil';

const TwoPlayerCubeView = () => {
  const {
    socket, sendMove, declareWin, joinQueue,
    roomId, opponentId, setOnOpponentMove,
    scramble, winner, cubeSize
  } = useSocket();

  const myCubeRef = useRef();
  const opponentCubeRef = useRef();
  const [currentSlice, setCurrentSlice] = useState(null);

  // Game Status: 'idle' (Lobby) -> 'searching' -> 'active' -> 'won'/'lost'
  const [gameStatus, setGameStatus] = useState('idle');
  const [isScrambling, setIsScrambling] = useState(false);

  // --- VIRTUAL CUBE STATE ---
  // We default to 3, but this MUST be reset when the game starts with the correct size
  const virtualState = useRef(getInitialState(3));

  // --- Game Initialization Effect ---
  // Only runs when the room/opponent/size changes (i.e. new game)
  useEffect(() => {
    if (roomId && opponentId) {
      console.log(`Initializing Game: ${cubeSize}x${cubeSize} in room ${roomId}`);
      setGameStatus('active');
      // Sync logic size immediately when room is confirmed
      virtualState.current = getInitialState(cubeSize);
    }
  }, [roomId, opponentId, cubeSize]);

  // --- Event Listeners Effect ---
  // Runs when dependencies change, but DOES NOT reset the virtual state
  useEffect(() => {
    // FIX: Safe check for socket.id
    if (winner && socket) {
      setGameStatus(winner === socket.id ? 'won' : 'lost');
    }

    const handleOpponentMove = (move) => {
      if (!isScrambling && opponentCubeRef.current && !winner) {
        opponentCubeRef.current.performMove(move);
      }
    };
    setOnOpponentMove(handleOpponentMove);

    const handleOpponentLeft = () => setGameStatus('opponent_left');
    if (socket) socket.on('opponent:left', handleOpponentLeft);

    return () => {
      setOnOpponentMove(null);
      if (socket) socket.off('opponent:left', handleOpponentLeft);
    };
  }, [setOnOpponentMove, socket, isScrambling, winner]);

  // --- SCRAMBLE SEQUENCE ---
  useEffect(() => {
    let isMounted = true;

    const applyScramble = async () => {
      if (scramble && scramble.length > 0 && myCubeRef.current && opponentCubeRef.current) {
        console.log(`Starting ${cubeSize}x${cubeSize} Scramble...`);
        setIsScrambling(true);

        // CRITICAL: Reset virtual state to clean solved state before applying scramble
        virtualState.current = getInitialState(cubeSize);

        // Buffer for Three.js init
        await new Promise(r => setTimeout(r, 100));

        for (const move of scramble) {
          if (!isMounted) break;

          // 1. Visual Update
          const fastMove = { ...move, duration: 120 };
          const promises = [];
          if (myCubeRef.current) promises.push(myCubeRef.current.performMove(fastMove));
          if (opponentCubeRef.current) promises.push(opponentCubeRef.current.performMove(fastMove));

          // 2. Logic Update
          virtualState.current = applyMoveObject(virtualState.current, move);

          await Promise.all(promises);
        }

        console.log("Scramble Complete. Virtual State Ready. Solved?", checkSolved(virtualState.current));
        setIsScrambling(false);
      }
    };

    applyScramble();

    return () => { isMounted = false; };
  }, [scramble, cubeSize]);

  // --- MANUAL WIN CHECK (DEBUGGING) ---
  const handleManualCheck = () => {
    const isSolved = checkSolved(virtualState.current);
    console.log("Manual Check - Is Solved?", isSolved);
    if (isSolved) {
      declareWin();
    } else {
      alert("Cube is not solved yet!");
    }
  };

  // --- KEYBOARD HANDLING ---
  useEffect(() => {
    const digitMapping = { "1": "1", "!": "1", "2": "2", "@": "2", "3": "3", "#": "3", "4": "4", "$": "4", "5": "5", "%": "5", "6": "6", "^": "6", "7": "7", "&": "7", "8": "8", "*": "8", "9": "9", "(": "9" };

    const handleKeyDown = (e) => {
      if (gameStatus !== 'active' || isScrambling || winner) return;

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

        // 1. Send to Opponent
        sendMove(move);

        // 2. Update My Visuals
        if (myCubeRef.current) myCubeRef.current.performMove(move);

        // 3. Update My Logic
        virtualState.current = applyMoveObject(virtualState.current, move);

        // 4. Check Win
        const isSolved = checkSolved(virtualState.current);
        if (isSolved) {
          console.log("AUTO-DETECT: CUBE SOLVED!");
          declareWin();
        } else {
          console.log("Move applied. Solved?", isSolved);
        }

        setCurrentSlice(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sendMove, currentSlice, roomId, gameStatus, isScrambling, winner, declareWin]);

  const handleJoin = (size) => {
    setGameStatus('searching');
    joinQueue(size);
  };

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
          --clr-emerald: #10b981;
          --size-base: 1rem;
          --size-xl: 1.25rem;
        }
        .pulsing-dot { display: inline-block; width: 0.75rem; height: 0.75rem; background-color: var(--clr-indigo); border-radius: 50%; animation: pulse 1.5s infinite; margin: 0 2px; }
        .pulsing-dot:nth-child(2) { animation-delay: 0.2s; }
        .pulsing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
        
        .btn-primary {
            background: var(--clr-indigo); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: transform 0.1s; margin: 5px;
        }
        .btn-secondary {
            background: transparent; border: 1px solid var(--clr-slate400); color: var(--clr-slate400); padding: 5px 10px; border-radius: 5px; cursor: pointer; margin-top: 10px; font-size: 0.8rem;
        }
        .btn-primary:hover { transform: scale(1.05); }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--clr-dark)', color: 'var(--clr-light)', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

        <main style={{ display: 'flex', flex: 1, padding: 'var(--size-base)', gap: 'var(--size-base)', alignItems: 'center', justifyContent: 'center', height: '100%', overflow: 'hidden' }}>

          {/* --- LOBBY --- */}
          {gameStatus === 'idle' && (
            <div style={{ textAlign: 'center', zIndex: 10 }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Choose Puzzle Size</h1>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => handleJoin(2)}>2x2</button>
                <button className="btn-primary" onClick={() => handleJoin(3)}>3x3</button>
                <button className="btn-primary" onClick={() => handleJoin(4)}>4x4</button>
              </div>
            </div>
          )}

          {/* --- GAME --- */}
          {gameStatus !== 'idle' && (
            <>
              <PlayerCard name="You" result={socket && winner === socket.id ? 'won' : (winner ? 'lost' : null)}>
                <CubeWithArrow ref={myCubeRef} canvasId="myCubeCanvas" cubeSize={cubeSize} disableKeyboard={true} />
              </PlayerCard>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '150px', textAlign: 'center', flexShrink: 0 }}>
                {gameStatus === 'searching' && <StatusIndicator text={`Searching ${cubeSize}x${cubeSize}...`} />}
                {gameStatus === 'active' && (isScrambling ? <StatusMessage text="Scrambling..." /> : <VsIndicator />)}
                {gameStatus === 'opponent_left' && <StatusMessage text="Opponent Left" />}
                {gameStatus === 'won' && <WinMessage text="YOU WON!" />}
                {gameStatus === 'lost' && <LoseMessage text="YOU LOST" />}

                {/* Manual Check Button REMOVED as requested */}

                {(gameStatus === 'opponent_left' || gameStatus === 'won' || gameStatus === 'lost') && (
                  <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setGameStatus('idle')}>Play Again</button>
                )}
              </div>

              <PlayerCard name="Opponent" status={gameStatus} result={winner && socket && winner !== socket.id ? 'won' : (winner ? 'lost' : null)}>
                <OpponentCube ref={opponentCubeRef} canvasId="opponentCubeCanvas" cubeSize={cubeSize} />
              </PlayerCard>
            </>
          )}
        </main>
      </div>
    </>
  );
};

// ... (Helper Components)
const PlayerCard = ({ name, children, status, result }) => (
  <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--clr-slate600)',
    borderRadius: 'var(--size-base)',
    padding: 'var(--size-base)',
    border: result === 'won' ? '2px solid var(--clr-emerald)' : result === 'lost' ? '2px solid var(--clr-rose)' : '1px solid hsl(225, 25%, 20%)',
    boxShadow: result === 'won' ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(0,0,0,0.3)',
    maxWidth: '45vw',
    height: '80%',
    maxHeight: '85vh',
    overflow: 'hidden',
    opacity: (name === 'Opponent' && (status === 'waiting' || status === 'searching')) ? 0.3 : 1,
    transition: 'all 0.3s ease-in-out',
  }}>
    <h2 style={{
      margin: '0 0 var(--size-base) 0',
      color: result === 'won' ? 'var(--clr-emerald)' : result === 'lost' ? 'var(--clr-rose)' : 'var(--clr-light)',
      fontWeight: 600,
      fontSize: 'var(--size-xl)',
      textAlign: 'center',
      flexShrink: 0
    }}>
      {name} {result === 'won' && "👑"}
    </h2>
    <div style={{ flex: 1, width: '100%', position: 'relative', minHeight: 0 }}>{children}</div>
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
const WinMessage = ({ text }) => <div style={{ fontSize: '1.5rem', color: 'var(--clr-emerald)', fontWeight: 700, textShadow: '0 0 10px rgba(16,185,129,0.5)' }}>{text}</div>;
const LoseMessage = ({ text }) => <div style={{ fontSize: '1.5rem', color: 'var(--clr-rose)', fontWeight: 700 }}>{text}</div>;

export default TwoPlayerCubeView;