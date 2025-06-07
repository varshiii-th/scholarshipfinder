import React from 'react';
import s1 from '../../assets/s1.png';
import s2 from '../../assets/s2.png';
import './Home.css';

const Home = () => {
  return (
    <div className="homepage">
      {/* Header Section with Background Image */}
      <header className="hero-section" style={{ backgroundImage: `url(${s1})` }}>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Scholarship Finder</h1>
          <p className="hero-tagline">
            Discover scholarships tailored to your needs. Scholarship Finder helps you unlock opportunities by matching you with the best funding options for your education.
          </p>
          <a href="/signup" className="join-button">Join for Free</a>
        </div>
      </header>

      <section className="intro-section">
        <div className="intro-content">
          <p>
            Scholarship Finder simplifies the search for educational funding by analyzing the details you provide. Whether it's your academic background, interests, or financial needs, our platform matches you with scholarships that fit your profile. Just fill in your information, and let us do the rest—connecting you with opportunities to support your academic journey.
          </p>
        </div>
      </section>

      {/* Main Content Section with Image on Left and Text on Right */}
      <section className="info-section">
        <div className="info-image">
          <img src={s2} alt="Scholarship Finder Process" />
        </div>
        <div className="info-text">
          <h2>How Scholarship Finder Works</h2>
          <p>
            <strong>1. Create your profile</strong><br />
            After signing up, you'll customize your profile by answering a few questions.<br /><br />
            <strong>2. Get instant scholarship matches</strong><br />
            Using your unique profile, you'll get a list of scholarships you qualify for based upon your strengths, interests, student activities and skills.<br /><br />
            <strong>3. Apply. Get money for college!</strong><br />
            Each time you log in you're greeted with new scholarship matches, and the total value of the scholarships you qualify for! Filter through your list, save those you're interested in and start applying for scholarships.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;