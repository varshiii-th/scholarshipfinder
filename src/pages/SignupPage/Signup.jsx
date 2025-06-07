import React, { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import styles from './Signup.module.css';
import axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { dispatch } = useAuthContext();
    const [user, setUser] = useState({
        username: '',
        email: '',
        password: '',
        dateOfBirth: '',
        CGPA: '',
        Course: '',
        Branch: '',
        country: 'India',
    });
    const [error, setError] = useState('');

    const handleInput = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/user/signup', user);
            const data = response.data;

            if (data.status === 'Failed' || data.status === 'Failed_end') {
                setError(data.message);
            } else {
                dispatch({ type: 'signup', payload: data.result });
                setUser({
                    username: '',
                    email: '',
                    password: '',
                    dateOfBirth: '',
                    CGPA: '',
                    Course: '',
                    Branch: '',
                    country: 'India',
                });
                navigate('/verification');
            }
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            setError(error.response?.data?.message || error.response?.data?.error || 'An error occurred during signup. Please try again.');
        }
    };

    return (
        <section className={styles.sectionForm}>
            <div className={styles.signupContent}>
                <h1>Signup</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles.inputBox}>
                        <input
                            name='username'
                            className={styles.input}
                            type='text'
                            placeholder='Username'
                            value={user.username}
                            onChange={handleInput}
                            required
                        />
                        <FaUser className={styles.icon} />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            name='email'
                            className={styles.input}
                            type='email'
                            placeholder='Email'
                            value={user.email}
                            onChange={handleInput}
                            required
                        />
                        <MdEmail className={styles.icon} />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            name='password'
                            className={styles.input}
                            type='password'
                            placeholder='Password'
                            value={user.password}
                            onChange={handleInput}
                            required
                        />
                        <FaLock className={styles.icon} />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            name='dateOfBirth'
                            className={styles.input}
                            type='date'
                            placeholder='Date of Birth'
                            value={user.dateOfBirth}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            name='CGPA'
                            className={styles.input}
                            type='number'
                            step='0.01'
                            placeholder='CGPA (scale to 10)'
                            value={user.CGPA}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <select
                            name='Course'
                            className={styles.input}
                            value={user.Course}
                            onChange={handleInput}
                            required
                        >
                            <option value='' disabled>Select Course</option>
                            <option value='Undergraduate'>Undergraduate</option>
                            <option value='Postgraduate'>Postgraduate</option>
                            <option value='Doctoral'>Doctoral</option>
                        </select>
                    </div>
                    <div className={styles.inputBox}>
                        <input
                            name='Branch'
                            className={styles.input}
                            type='text'
                            placeholder='Branch'
                            value={user.Branch}
                            onChange={handleInput}
                            required
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <select
                            name='country'
                            className={styles.input}
                            value={user.country}
                            onChange={handleInput}
                            required
                        >
                            <option value='India'>India</option>
                            <option value='Abroad'>Abroad</option>
                        </select>
                    </div>
                    <button type='submit' className={styles.signupButton}>
                        Signup
                    </button>
                    {error && <div className={styles.error}>{error}</div>}
                </form>
            </div>
        </section>
    );
};

export default Signup;