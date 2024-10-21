import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validation from './LoginValidation';
import axios from 'axios';
import './App.css';

function Login() {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get('http://localhost:8081/check-auth', { withCredentials: true });
        if (response.data.isAuthenticated) {
          navigate('/home'); // Redirect if already authenticated
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    checkSession();
  }, [navigate]);

  const handleInput = (event) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (Object.values(validationErrors).every(error => error === '')) {
      try {
        const response = await axios.post('http://localhost:8081/login', values, {
          withCredentials: true // Allow sending of cookies
        });

        if (response.data.success) {
          setFeedbackMessage('Login successful! Redirecting...');
          localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data
          setTimeout(() => navigate('/home'), 2000); // Redirect after 2 seconds
        } else {
          setFeedbackMessage('Invalid email or password. Please try again.');
        }
      } catch (error) {
        console.error('Login error:', error);
        setFeedbackMessage('An error occurred during login. Please try again later.');
      }
    } else {
      setFeedbackMessage('Please fix the errors above.');
    }
  };

  return (
    <div className='d-flex justify-content-center align-items-center vh-100'
      style={{
        background: 'radial-gradient(circle, rgba(254,255,0,1) 0%, rgba(252,97,50,1) 100%)'
      }}>
      <div className='rounded-5 login-container'
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          color: 'white',
          // border: '1px solid white',
          padding: '3rem'
        }}>
        <div className='text-center mb-3'>
          <img
            src="/images/ard-removebg-preview.png"
            alt="Logo"
            className='img-fluid'
            style={{
              maxHeight: '25vh',
              width: '25vh'
            }}
          />
        </div>
        <h2 style={{fontFamily: "FuturaExtraBold",}} className='text-center mb-3'>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor="email"><strong>Email</strong></label>
            <input
              type="email"
              placeholder='Enter Email'
              name='email'
              value={values.email}
              onChange={handleInput}
              className='form-control rounded-0'
            />
            {errors.email && <span className='text-danger'>{errors.email}</span>}
          </div>
          <div className='mb-3'>
            <label htmlFor="password"><strong>Password</strong></label>
            <input
              type="password"
              placeholder='Enter Password'
              name='password'
              value={values.password}
              onChange={handleInput}
              className='form-control rounded-0'
            />
            {errors.password && <span className='text-danger'>{errors.password}</span>}
          </div>
          <button style={{fontFamily: "FuturaExtraBold",}} type='submit' className='btn btn-success w-100 rounded-0'>Log In</button>
          <p className='text-center mt-2'>You agree to our terms and policies</p>
          <Link to="/signup" className='btn btn-default border w-100 rounded-0 text-decoration-none custom-button'
            style={{
              backgroundColor: 'rgb(32, 32, 170)',
              color: 'white',
              fontFamily:'FuturaExtraBold'
            }}>Create Account</Link>
          {feedbackMessage && <div className='mt-3 alert alert-info'>{feedbackMessage}</div>}
        </form>
      </div>
      <div
        className='circleContainer'
        style={{
          width: "15vh",
          height: "15vh",
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: "5%",
          right: "calc(37% - 3.5%)",
        }}>
        <div
          className="logoContainer"
          style={{
            position: "absolute",
            top: "8%",
            right: "24%",
            transform: "translate(31%,-18%)",
          }}
        >
          <img src="/images/pythonlogo-removebg-preview.png" alt=""
            style={{
              width: '20vh',
              height: '20vh'
            }} />
        </div>
      </div>
      {/* Footer Section */}
      <footer className="footer" style={{ fontSize:'0.7rem',textAlign: 'center', padding: '10px', fontWeight:'bold', position:'absolute', bottom:'0%'}}>
          <span style={{fontFamily: "FuturaExtraBold",}} className="text-muted">&copy; {new Date().getFullYear()} All Rights Reserved. Sponsored by @APU</span>
      </footer>
    </div>
  );
}

export default Login;




