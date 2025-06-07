import { useNavigate } from 'react-router-dom';
import styles from './Verification.module.css';
import { useState } from 'react';
import axios from 'axios';

const Verification = () => {
    const navigate = useNavigate();
    const [verifi, setVerifi] = useState({
        email: '',
        otp: '',
        error: ''
    });

    const handleInput = (e) => {
    const { name, value } = e.target;
    setVerifi({ ...verifi, [name]: value.trim(), error: '' });
    };

   const handleVerifi = async (e) => {
    e.preventDefault();
    const { email, otp } = verifi;

    if (!/^\d+$/.test(otp)) {
        setVerifi({ ...verifi, error: 'OTP must be numeric' });
        return;
    }

    try {
        console.log('Sending verification request:', { email, otp });
        const response = await axios.post('/user/verify', {
            email: email.trim().toLowerCase(),
            otp: otp.trim()
        });
        console.log('Verification response:', response.data);
        const { status, message } = response.data;
        if (status === 'Success') {
            alert('Email verified successfully!');
            console.log('Navigating to /login');
            navigate('/signin');
        } else {
            setVerifi({ ...verifi, error: message });
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || 'An error occurred during verification.';
        console.error('Verification error:', errorMsg, error);
        setVerifi({ ...verifi, error: errorMsg });
    }
};

    return (
        <section className={styles.sectionForm}>
            <div className={styles.wrapper}>
                <h1>Verification</h1>
                <form onSubmit={handleVerifi}>
                    <div className={styles.inputBox}>
                        <label>Email</label>
                        <input
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={verifi.email}
                            onChange={handleInput}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <label>OTP</label>
                        <input
                            type='text'
                            name='otp'
                            placeholder='OTP'
                            value={verifi.otp}
                            onChange={handleInput}
                            className={styles.input}
                            required
                        />
                    </div>
                    <button type='submit'>Submit</button>
                    {verifi.error && <div className={styles.error}>{verifi.error}</div>}
                </form>
            </div>
        </section>
    );
};

export default Verification;