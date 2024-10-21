import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Scanner from './components/Scanner';
import axios from 'axios';
import './App.css';

function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showProfileInfo, setShowProfileInfo] = useState(false);
    const [scanActive, setScanActive] = useState(false);
    const [gameHistory, setGameHistory] = useState([]);
    const [showGameHistoryModal, setShowGameHistoryModal] = useState(false);
    const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [audioVolume, setAudioVolume] = useState(50); // Volume ranges from 0 to 100
    const [showGameRules, setShowGameRules] = useState(false); // State for Game Rules Panel

    const audioElement = new Audio('/audio/bgm.mp3');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setUser(user);
            fetchGameHistory(user.user_id);
        } else {
            navigate('/');
        }

        // Set audio volume when the component mounts
        audioElement.volume = audioVolume / 100; // Convert to 0-1 range
        if (audioEnabled) {
            audioElement.play(); // Play audio if enabled
        }

        // Cleanup function to pause audio on component unmount
        return () => {
            audioElement.pause();
            audioElement.currentTime = 0; // Reset audio to start
        };
    }, [navigate, audioEnabled, audioVolume]);
    
    const fetchGameHistory = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8081/getGameHistory?userId=${userId}`);
            setGameHistory(response.data);
        } catch (error) {
            console.error('Error fetching game history:', error.message);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await axios.get('http://localhost:8081/leaderboard');
            setLeaderboard(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8081/logout', {}, { withCredentials: true });
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleProfileInfo = () => {
        setShowProfileInfo(!showProfileInfo);
    };

    const toggleGameRules = () => {
        setShowGameRules(!showGameRules); // Toggle Game Rules panel
    };

    const toggleGameHistoryModal = () => {
        setShowGameHistoryModal(!showGameHistoryModal);
    };

    const toggleLeaderboardModal = () => {
        setShowLeaderboardModal(!showLeaderboardModal);
        if (!showLeaderboardModal) {
            fetchLeaderboard();
        }
    };

    const toggleSettingModal = () => {
        setShowSettingModal(!showSettingModal);
    };

    const handleScan = (result) => {
        if (result === "http://localhost:3000/game") {
            navigate('/game');
        } else if (result === "http://localhost:3000/game2") {
            navigate('/game2');
        } else if (result === "http://localhost:3000/game3") {
            navigate('/game3');
        } else if (result === "http://localhost:3000/game4") {
            navigate('/game4');
        } else if (result === "http://localhost:3000/game5") {
            navigate('/game5');
        } else {
            alert("Invalid QR Code. Please try again.");
        }
    };

    const handleCancelScan = () => {
        setScanActive(false);
    };

    const getHighScore = () => {
        if (gameHistory.length === 0) return null;
        return gameHistory.reduce((bestGame, currentGame) => {
            return currentGame.time_taken < bestGame.time_taken ? currentGame : bestGame;
        });
    };

    const highScoreGame = getHighScore();

    return (
        <div>
            <header className="d-flex justify-content-between align-items-center text-white" style={{ height: '7vh', paddingLeft: '2%', paddingRight: '2%', background: 'linear-gradient(90deg, rgba(120,67,230,1) 0%, rgba(254,158,255,1) 100%)' }}>
                <div className="d-flex align-items-center" onClick={toggleProfileInfo} style={{ cursor: 'pointer' }}>
                    <img src="/images/user.png" alt="Profile Icon" className="rounded-circle" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
                    {user && <span style={{fontFamily: "FuturaExtraBold",}}>{user.name}</span>}
                </div>

                {/* Arrow Pointer for Game Rules */}
                <div className="d-flex justify-content-center arrow-container" onClick={toggleGameRules} style={{ cursor: 'pointer', position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>
                    <img 
                        src={showGameRules ? '/images/up-arrow.png' : '/images/down-arrow.png'}
                        alt="Arrow"
                        className="arrow-pointer"
                    />
                </div>

                <div className="d-flex"> 
                    <img
                        src="/images/podium.png"
                        alt="Leaderboard"
                        className="leaderboard-icon" 
                        onClick={toggleLeaderboardModal} 
                    />
                    <img
                        src="/images/refresh.png"
                        alt="History"
                        className="history-icon" 
                        onClick={toggleGameHistoryModal} 
                    />
                    <img
                        src="/images/setting.png"
                        alt="Setting"
                        className="setting-icon" 
                        onClick={toggleSettingModal} 
                    />
                    <img
                        src="/images/log-out.png"
                        alt="Logout"
                        className="logout-icon" 
                        onClick={handleLogout} 
                    />
                </div>
            </header>
            

            {/* Game Rules Panel with transition */}
            <div className={`game-rules-panel ${showGameRules ? 'expanded' : ''}`} style={{fontFamily: "FuturaExtraBold", textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{ flex: 1, padding: '100px' }}>
                    <h4>How To Play?</h4>
                    <div style={{height:'2vh'}}></div>
                    
                    {/* Rule 1 */}
                    <p>Scan a QR Code: Click "Scan QR to Play" and scan the code to start a set of questions.</p>
                    
                    {/* Rule 2 */}
                    <p>Answer Questions: Read the questions and choose the correct answer to match the cards.</p>
                    
                    {/* Rule 3 */}
                    <p>Track Your Score: Your score and time will be tracked as you play.</p>
                    
                    <div style={{height:'2vh'}}></div>
                    {/* Social Media Icons Section */}
                    <div style={{ marginTop: '20px' }}>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                            <img className='igicon' src="/images/instagram.png" alt="Instagram" style={{ width: '4vh', margin: '0 40px' }} />
                        </a>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <img className='fbicon' src="/images/facebook.png" alt="Facebook" style={{ width: '4vh', margin: '0 40px' }} />
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                            <img className='twittericon' src="/images/twitter.png" alt="Twitter" style={{ width: '4vh', margin: '0 40px' }} />
                        </a>
                    </div>
                </div>

                <div style={{ flex: 1, textAlign: 'center' }}>
                    <img src="/images/mushroomsnowy.png" alt="Game Instructions" style={{width: 40 * 383 / 322 + 'vh' }} />
                </div>
            </div>

            <div className={`d-flex justify-content-center align-items-center ${showGameRules ? 'background-blur' : ''}`} style={{ height: '93vh', background: 'radial-gradient(circle, rgba(254,255,0,1) 0%, rgba(252,97,50,1) 100%)' }}>
                <div className='leftFlag' style={{position: 'absolute', top: '7%', left: '0', flex: 1}}>
                    <img style={{ width: 12 * 1185 / 210 +'vh'}} src="./images/header.png" alt="" />
                </div>
                <div className='rightFlag' style={{position: 'absolute', top: '7%', right: '0',flex: 1}}>
                    <img style={{ width: 12 * 1185 / 210 +'vh'}} src="./images/header.png" alt="" />
                </div>
                <div className='middleFlag' style={{position: 'absolute', top: '7%',flex: 1}}>
                    <img style={{ width: 12 * 1185 / 210 +'vh'}} src="./images/header.png" alt="" />
                </div>
                <div className='rounded login-container'>
                    <div className='text-center mb-3'>
                        {!scanActive && (
                            <>
                                <img src="/images/ard-removebg-preview.png" alt="Logo" className='img-fluid' style={{ maxHeight: '50vh', width: '50vh' }} />
                                <button onClick={() => setScanActive(true)} className='btn btn-default rounded-5 text-decoration-none custom-button1' style={{ backgroundColor: 'rgb(9, 109, 52)', color: 'white', width: '25vh', fontFamily:'FuturaExtraBold'}}>
                                  SCAN QR TO PLAY
                                </button>
                            </>
                        )}
                        {scanActive && (
                            <div className='text-center'>
                                <h2 style={{ color: 'black' , fontFamily:'FuturaExtraBold'}}>Scan QR Code</h2>
                                <Scanner onScan={handleScan} />
                                <button style={{fontFamily: "FuturaExtraBold",}} onClick={handleCancelScan} className='btn btn-danger mt-3'>Cancel</button>
                            </div>
                        )}
                    </div>
                </div>
                {/* Footer Section */}
                <footer className="footer" style={{ fontSize:'0.7rem',textAlign: 'center', padding: '10px', position:'absolute', bottom:'0%'}}>
                    <span style={{fontFamily: "FuturaExtraBold",}} className="text-muted">&copy; {new Date().getFullYear()} All Rights Reserved. Sponsored by @APU</span>
                </footer>
            </div>

            {/* Game History Modal */}
            {showGameHistoryModal && (
                <div style={{fontFamily: "FuturaExtraBold",}} className="history-modal">
                    <div className="history-modal-content">
                        {highScoreGame && (
                            <div style={{fontFamily: "FuturaExtraBold",}} className="high-score">
                                <h4>High Score</h4>
                                <p><strong>Score:</strong> {highScoreGame.score}</p>
                                <p><strong>Time Taken:</strong> {highScoreGame.time_taken} seconds</p>
                                <p><strong>Completed:</strong> {highScoreGame.completed ? 'Yes' : 'No'}</p>
                                <p><strong>Date:</strong> {new Date(highScoreGame.created_at).toLocaleDateString()}</p>
                                <p>-----------------------------------------------------------</p>
                            </div>
                        )}
                        <h4 className="mt-4">Game History</h4>
                        <div className="game-history-content" style={{ maxHeight: '300px', overflowY: 'scroll' }}>
                            {gameHistory.length > 0 ? (
                                <ul>
                                    {gameHistory.map((game, index) => (
                                        <li key={index} className="game-history-item">
                                            <p><strong>Score:</strong> {game.score}</p>
                                            <p><strong>Time Taken:</strong> {game.time_taken} seconds</p>
                                            <p><strong>Completed:</strong> {game.completed ? 'Yes' : 'No'}</p>
                                            <p><strong>Date:</strong> {new Date(game.created_at).toLocaleDateString()}</p>
                                            <hr />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No game history found.</p>
                            )}
                        </div>
                        <button onClick={toggleGameHistoryModal} className="btn btn-danger mt-3">Close</button>
                    </div>
                </div>
            )}

            {/* Leaderboard Modal */}
            {showLeaderboardModal && (
                <div style={{fontFamily: "FuturaExtraBold",}} className="leaderboard-modal">
                    <div className="leaderboard-modal-content">
                        <h4>Leaderboard</h4>
                        <div className="leaderboard-content" style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                            {leaderboard.length > 0 ? (
                                <ul>
                                    {leaderboard.map((entry, index) => {
                                        const suffix = (index) => {
                                            const rank = index + 1; // Convert to rank (1-based)
                                            if (rank % 10 === 1 && rank % 100 !== 11) return 'st'; // 1st
                                            if (rank % 10 === 2 && rank % 100 !== 12) return 'nd'; // 2nd
                                            if (rank % 10 === 3 && rank % 100 !== 13) return 'rd'; // 3rd
                                            return 'th'; // All others
                                        };

                                        return (
                                            <li key={index} className="leaderboard-item">
                                                <p><strong>{index + 1}{suffix(index)}:</strong> {entry.name} - {entry.time_taken} seconds</p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p>No leaderboard data available.</p>
                            )}
                        </div>
                        <button onClick={toggleLeaderboardModal} className="btn btn-danger mt-3">Close</button>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfileInfo && (
                <div style={{fontFamily: "FuturaExtraBold",}} className="profile-modal">
                    <div className="profile-modal-content">
                        <h4>User Profile</h4>
                        {user && (
                            <div>
                                <p><strong>Name:</strong> {user.name}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                            </div>
                        )}
                        <button onClick={toggleProfileInfo} className="btn btn-danger mt-3">Close</button>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettingModal && (
                <div style={{fontFamily: "FuturaExtraBold",}} className="settings-modal">
                    <div className="settings-modal-content">
                        <h4>Settings</h4>
                        <div className="form-group">
                            <label htmlFor="audioControl">Audio:</label>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={audioEnabled}
                                        onChange={() => setAudioEnabled(!audioEnabled)}
                                    />
                                    {audioEnabled ? 'Mute' : 'Unmute'}
                                </label>
                            </div>
                            <label htmlFor="audioVolume">Volume:</label>
                            <input
                                type="range"
                                id="audioVolume"
                                min="0"
                                max="100"
                                value={audioVolume}
                                onChange={(e) => setAudioVolume(e.target.value)}
                            />
                        </div>
                        <button onClick={toggleSettingModal} className="btn btn-danger mt-3">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
