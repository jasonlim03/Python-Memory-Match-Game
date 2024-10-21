import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import axios from 'axios'; // Import axios for HTTP requests

function Game4() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showReplayPrompt, setShowReplayPrompt] = useState(false);
  const timerRef = useRef(null);
  const audioRef = useRef(null); // Reference for the audio element
  
  // Game history state
  const [gameHistory, setGameHistory] = useState({
    userId: '',
    score: 0,
    timeTaken: 0,
    completed: false,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setGameHistory(prev => ({ ...prev, userId: parsedUser.user_id })); // Set userId from parsedUser
      console.log("User ID:", parsedUser.user_id); // Log the user ID for debugging
    } else {
      navigate('/');
    }
  
    fetchQuestions();

    // Play audio on component mount
    if (audioRef.current) {
      audioRef.current.play();
      audioRef.current.loop = true; // Set audio to loop
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          setShowReplayPrompt(true);
          saveGameHistory(false); // Save history when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  
    return () => {
      clearInterval(timerRef.current);
      // Stop audio when the component unmounts
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset audio to the beginning
      }
    };
  }, [navigate]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8081/questions?category=set4');
      const data = await response.json();
      const shuffledQuestions = data.sort(() => Math.random() - 0.5).slice(0, 5);
      const formattedCards = shuffledQuestions.flatMap(question => [
        {
          id: `q_${question.question_id}`,
          type: 'description',
          content: question.description,
          questionId: question.question_id,
        },
        {
          id: `a_${question.question_id}`,
          type: 'answer',
          content: question.correct_answer,
          questionId: question.question_id,
        },
      ]);

      const finalCards = formattedCards.sort(() => Math.random() - 0.5);
      setCards(finalCards);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleCardClick = (card) => {
    if (flippedCards.includes(card.id) || flippedCards.length >= 2 || gameOver) return;

    setFlippedCards((prev) => [...prev, card.id]);

    if (flippedCards.length === 1) {
      const firstCardId = flippedCards[0];
      const firstCard = cards.find(c => c.id === firstCardId);

      if (firstCard.questionId === card.questionId && firstCard.type !== card.type) {
        setMatchedPairs((prev) => [...prev, firstCardId, card.id]);
        setFlippedCards([]);

        if (matchedPairs.length + 2 === cards.length) {
          clearInterval(timerRef.current);
          setGameOver(true);
          setShowReplayPrompt(true);
          saveGameHistory(true); // Save game history if all pairs matched
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleExit = () => {
    navigate('/home');
  };

  const handleReplay = () => {
    // Reset all states to start a new game
    setFlippedCards([]);
    setMatchedPairs([]);
    setTimeRemaining(60);
    setGameOver(false);
    setShowReplayPrompt(false);
    fetchQuestions();

    // Clear previous timer and restart
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          setShowReplayPrompt(true);
          saveGameHistory(false); // Save game history if game is over
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const saveGameHistory = async (completed) => {
    const score = matchedPairs.length / 2; // Calculate score based on matched pairs
    const timeTaken = 60 - timeRemaining; // Time taken to complete the game

    console.log('Saving game history:', gameHistory); // Log gameHistory

    if (!gameHistory.userId) {
      console.error('User ID is missing. Cannot save game history.');
      return;
    }

    try {
      await axios.post('http://localhost:8081/saveGameHistory', {
        userId: gameHistory.userId,
        score: score,
        timeTaken: timeTaken,
        completed: completed,
      }, { withCredentials: true });

      console.log('Game history saved successfully.');
    } catch (error) {
      console.error('Error saving game history:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <audio ref={audioRef} src="./audio/bgm2.mp3" preload="auto" /> {/* Add your audio file path here */}
      
      {/* Overlay when game is over */}
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
          zIndex: 2, // Ensure it appears on top of other elements
        }}></div>
      )}
  
      <header className="d-flex justify-content-between align-items-center text-white"
        style={{
          height: '7vh',
          paddingLeft: '2%',
          paddingRight: '2%',
          background: 'linear-gradient(90deg, rgba(120,67,230,1) 0%, rgba(254,158,255,1) 100%)'
        }}>
        <div style={{fontFamily: "FuturaExtraBold",}} className="d-flex align-items-center position-relative">
          <img src="/images/checked.png" alt="Profile Icon" className="rounded-circle" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
          SCORE: {matchedPairs.length / 2} / {cards.length / 2}
        </div>
        <div style={{fontFamily: "FuturaExtraBold",}} className="d-flex align-items-center position-relative">
          <img src="/images/stopwatch.png" alt="Profile Icon" className="rounded-circle" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
          TIME LEFT: {timeRemaining}s
        </div>
        <button style={{fontFamily: "FuturaExtraBold",}} onClick={handleExit} className="btn btn-outline-light">EXIT</button>
      </header>
  
      <div className='d-flex justify-content-center align-items-center'
        style={{
          height: '93vh',
          background: 'radial-gradient(circle, rgba(254,255,0,1) 0%, rgba(252,97,50,1) 100%)'
        }}>
        
        <div className='rounded login-container position-relative' style={{ width: '100%', height: '100%' }}>
          <img
            src="/images/ard-removebg-preview.png"
            alt="Logo"
            className='img-fluid logo-blur'
            style={{
              maxHeight: '50vh',
              width: '50vh',
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              zIndex: 1
            }}
          />
        </div>
  
        <div className="card-grid" style={{ position: 'absolute', top: '50%', right: '50%', transform: 'translate(-15%, -50%)', zIndex: 2 }}>
          {cards.map(card => (
            <div className="card" 
                 key={card.id} 
                 onClick={() => handleCardClick(card)} 
                 style={{ 
                   backgroundColor: matchedPairs.includes(card.id) ? 'lightgreen' : flippedCards.includes(card.id) ? 'lightyellow' : '#fe9eff',
                   cursor: 'pointer',
                   fontFamily:'FuturaExtraBold',
                   fontSize:'1rem'
                 }}>
              {flippedCards.includes(card.id) || matchedPairs.includes(card.id) ? card.content : <img
                src="/images/ard-removebg-preview.png"
                alt="Logo"
                className='img-fluid'
                style={{
                  maxHeight: '10vh',
                  width: '10vh',
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  zIndex: 1
                }}
              />}
            </div>
          ))}
        </div>
  
        {/* Footer Section */}
        <footer className="footer" style={{ fontSize:'0.7rem',textAlign: 'center', padding: '10px', fontWeight:'bold', position:'absolute', bottom:'0%'}}>
            <span style={{fontFamily: "FuturaExtraBold",}} className="text-muted">&copy; {new Date().getFullYear()} All Rights Reserved. Sponsored by @APU</span>
        </footer>
  
        {showReplayPrompt && (
        <div
          className="replay-prompt"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            zIndex: 3,
            fontFamily: 'FuturaExtraBold',
            textAlign: 'center',
          }}
        >
          <h2>{timeRemaining > 0 ? 'Congratulations!' : 'Game Over!'}</h2>
          <p>{timeRemaining > 0 ? 'You matched all pairs!' : 'Time is up!'}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button onClick={handleReplay} className="btn btn-primary">
              Play Again
            </button>
            <button onClick={handleExit} className="btn btn-danger">
              EXIT
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  );
  
}

export default Game4;
