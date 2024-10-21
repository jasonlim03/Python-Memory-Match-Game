import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validation from './SignupValidation';
import axios from 'axios';
import './App.css';

function Signup() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const navigate = useNavigate();

  const handleInput = (event) => {
    setValues(prev => ({...prev, [event.target.name]: event.target.value}));
  }

  const checkEmailUniqueness = async (email) => {
    try {
      //Call API
      const response = await axios.get(`http://localhost:8081/check-email?email=${email}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email uniqueness:', error);
      return false; // Assume email is not unique if there is an error
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (Object.values(validationErrors).every(error => error === '')) {
      const emailExists = await checkEmailUniqueness(values.email);
      if (emailExists) {
        setFeedbackMessage('Email is already registered. Please use a different email.');
        return;
      }

      //Call API
      axios.post('http://localhost:8081/signup', values)
        .then(res => {
          setFeedbackMessage('Sign-up successful! Redirecting to login...');
          setTimeout(() => navigate('/'), 2000); // Redirect after 2 seconds
        })
        .catch(err => {
          setFeedbackMessage('Error during sign-up. Please try again.');
          console.error('Error during sign-up:', err);
        });
    } else {
      setFeedbackMessage('Please fix the errors above.');
    }
  }

  return (
    <div className='d-flex justify-content-center align-items-center bg-primary vh-100' 
    style={{
      background: 'radial-gradient(circle, rgba(254,255,0,1) 0%, rgba(252,97,50,1) 100%)'
    }}>
      <div className='rounded-5 login-container' 
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent white background
        color: 'white', // Changes the font color to white
        // border: '1px solid white', // Sets the border color to white
        padding:'3rem'
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
        <h2 style={{fontFamily: "FuturaExtraBold",}} className='text-center mb-3'>Sign-Up</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor="name"><strong>Name</strong></label>
            <input 
              type="text" 
              placeholder='Enter Name' 
              name='name' 
              value={values.name}
              onChange={handleInput} 
              className='form-control rounded-0'
            />
            {errors.name && <span className='text-danger'>{errors.name}</span>}
          </div>
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
          <button style={{fontFamily: "FuturaExtraBold",}} type='submit' className='btn btn-success w-100 rounded-0'>Sign Up</button>
          <p>Your are agree to our terms and policies</p>
          <Link to="/" className='btn btn-default border w-100 rounded-0 text-decoration-none custom-button'
          style={{
            backgroundColor:'rgb(32, 32, 170)',
            color:'white',
            fontFamily:'FuturaExtraBold'
          }}>Login</Link>
          {feedbackMessage && <div className='mt-3 alert alert-info'>{feedbackMessage}</div>}
        </form>
      </div>
      <div 
        className='circleContainer'
        style={{
          width: "15vh" /* Adjust the size as needed */,
          height:
            "15vh" /* Should be equal to the width for a perfect circle */,
          backgroundColor: "white",
          borderRadius: "50%",
          position: "absolute",
          top: "1%",
          right:
            "calc(37% - 3.5%)" /* Adjust the offset based on your design */,
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
            width:'20vh',
            height:'20vh'
          }}/>
        </div>
      </div>
      {/* Footer Section */}
      <footer className="footer" style={{ fontSize:'0.7rem',textAlign: 'center', padding: '10px', fontWeight:'bold', position:'absolute', bottom:'0%'}}>
          <span style={{fontFamily: "FuturaExtraBold",}} className="text-muted">&copy; {new Date().getFullYear()} All Rights Reserved. Sponsored by @APU</span>
      </footer>
    </div>
  );
}

export default Signup;


