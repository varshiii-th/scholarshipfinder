import React, { useContext, useState, useEffect } from 'react';
import styles from './Profile.module.css';
import axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';

const Profile = () => {
  const { isAuthenticated, userLogin } = useAuthContext();
  const [CGPA, setCGPA] = useState('');
  const [dateOfBirth, setdateOfBirth] = useState('');
  const [Branch, setBranch] = useState('');
  const [Course, setCourse] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userLogin?.result?._id) {
      fetchUserData(userLogin.result._id);
    } else {
      setLoading(false);
      setError('User not logged in');
    }
  }, [userLogin]);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8008/user/${userId}`);
      const user = response.data;
      setCGPA(user.CGPA || 'Not set');
      setdateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set');
      setCourse(user.Course || 'Not set');
      setBranch(user.Branch || 'Not set');
      setCountry(user.country || 'Not set');
      setMessage('');
      setError(null);
    } catch (error) {
      setError('Error fetching user data');
      setMessage('Error fetching user data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditdateOfBirth = async (newdateOfBirth) => {
    try {
      const parsedDate = new Date(newdateOfBirth);
      if (!isNaN(parsedDate.getTime())) {
        const isoDate = parsedDate.toISOString();
        await axios.put(`http://localhost:8008/user/${userLogin.result._id}/dateOfBirth`, { dateOfBirth: isoDate });
        setdateOfBirth(parsedDate.toLocaleDateString());
        setMessage('Date of Birth updated successfully');
      } else {
        setMessage('Invalid date format (use YYYY-MM-DD)');
      }
    } catch (error) {
      setMessage('Error updating Date of Birth');
    }
  };

  const handleEditCGPA = async (newcgpa) => {
    try {
      const cgpaValue = Number(newcgpa);
      if (!isNaN(cgpaValue) && cgpaValue >= 0 && cgpaValue <= 10) {
        await axios.put(`http://localhost:8008/user/${userLogin.result._id}/CGPA`, { CGPA: cgpaValue });
        setCGPA(cgpaValue);
        setMessage('CGPA updated successfully');
      } else {
        setMessage('Invalid CGPA (must be a number between 0 and 10)');
      }
    } catch (error) {
      setMessage('Error updating CGPA');
    }
  };

  const handleEditBranch = async (newbranch) => {
    try {
      if (newbranch.trim()) {
        await axios.put(`http://localhost:8008/user/${userLogin.result._id}/Branch`, { Branch: newbranch.trim() });
        setBranch(newbranch.trim());
        setMessage('Branch updated successfully');
      } else {
        setMessage('Branch cannot be empty');
      }
    } catch (error) {
      setMessage('Error updating Branch');
    }
  };

  const handleEditCourse = async (newcourse) => {
    try {
      if (newcourse.trim()) {
        await axios.put(`http://localhost:8008/user/${userLogin.result._id}/Course`, { Course: newcourse.trim() });
        setCourse(newcourse.trim());
        setMessage('Course updated successfully');
      } else {
        setMessage('Course cannot be empty');
      }
    } catch (error) {
      setMessage('Error updating Course');
    }
  };

  const handleEditCountry = async (newcountry) => {
    try {
      if (newcountry.trim() && ['India', 'Abroad'].includes(newcountry.trim())) {
        await axios.put(`http://localhost:8008/user/${userLogin.result._id}/country`, { country: newcountry.trim() });
        setCountry(newcountry.trim());
        setMessage('Country updated successfully');
      } else {
        setMessage('Country must be either "India" or "Abroad"');
      }
    } catch (error) {
      setMessage('Error updating Country');
    }
  };

  return (
    <>
      <h1 className={styles.title}>User Profile</h1>
      <div className={styles.Appp}>
        {loading && <p className={styles.loading}>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {userLogin && !loading && (
          <>
            <div className={styles.profile}>
              <div className={styles['user-info']}>
                <div className={styles.userInfo}>
                  <p>Username:</p>
                  <p>{userLogin.result.username || 'Not set'}</p>
                </div>
                <div className={styles.userInfo}>
                  <p>Email:</p>
                  <p>{userLogin.result.email || 'Not set'}</p>
                </div>
              </div>

              <div className={styles.techContainer}>
                <h2>CGPA: {CGPA}</h2>
                <button
                  onClick={() => {
                    const newcgpa = prompt('Edit CGPA (0-10):', CGPA);
                    if (newcgpa !== null) handleEditCGPA(newcgpa);
                  }}
                >
                  Edit
                </button>
              </div>
              <div className={styles.techContainer}>
                <h2>Branch: {Branch}</h2>
                <button
                  onClick={() => {
                    const newbranch = prompt('Edit Branch:', Branch);
                    if (newbranch !== null) handleEditBranch(newbranch);
                  }}
                >
                  Edit
                </button>
              </div>
              <div className={styles.techContainer}>
                <h2>Course: {Course}</h2>
                <button
                  onClick={() => {
                    const newcourse = prompt('Edit Course:', Course);
                    if (newcourse !== null) handleEditCourse(newcourse);
                  }}
                >
                  Edit
                </button>
              </div>
              <div className={styles.techContainer}>
                <h2>Date of Birth: {dateOfBirth}</h2>
                <button
                  onClick={() => {
                    const newdateOfBirth = prompt('Enter Date of Birth (YYYY-MM-DD):', dateOfBirth);
                    if (newdateOfBirth !== null) handleEditdateOfBirth(newdateOfBirth);
                  }}
                >
                  Edit
                </button>
              </div>
              <div className={styles.techContainer}>
                <h2>Country: {country}</h2>
                <button
                  onClick={() => {
                    const newcountry = prompt('Edit Country (India or Abroad):', country);
                    if (newcountry !== null) handleEditCountry(newcountry);
                  }}
                >
                  Edit
                </button>
              </div>
              {message && <p className={styles.message}>{message}</p>}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Profile;