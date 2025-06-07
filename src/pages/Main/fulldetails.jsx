import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Main.css';

const formatAward = (award_amount, periodicity) => {
  if (award_amount === "full") return "full";
  if (award_amount === "variable") return "variable";
  
  if (typeof award_amount === "number" || !isNaN(parseFloat(award_amount))) {
    const numericAward = parseFloat(award_amount);
    switch (periodicity) {
      case "annual":
        return `₹${numericAward.toLocaleString()}`;
      case "monthly":
        return `₹${(numericAward * 12).toLocaleString()}`;
      case "full":
        return "full";
      case "variable":
        return "variable";
      default:
        return `₹${numericAward.toLocaleString()}`;
    }
  }
  return award_amount;
};

const parseEligibility = (eligibility) => {
  if (!eligibility) return [];
  if (!eligibility.includes('#')) return [eligibility.trim()];
  const parts = eligibility.split('#');
  if (parts.length < 1) return [];
  const points = parts[1]
    ? parts[1].split('&').map(point => point.trim()).filter(point => point)
    : [];
  return points;
};

function Scholarship() {
  const { id } = useParams();
  const [scholarship, setScholarship] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8008/scdetails/${id}`)
      .then(res => setScholarship(res.data))
      .catch(err => console.error('Error:', err));
  }, [id]);

  if (!scholarship) return <p className="loading-text">Loading...</p>;

  const graduateLevels = [];
  if (scholarship.undergraduate) graduateLevels.push('Undergraduate');
  if (scholarship.postgraduate) graduateLevels.push('Postgraduate');
  if (scholarship.doctorial) graduateLevels.push('Doctoral');
  const graduateText = graduateLevels.length > 0 ? graduateLevels.join(', ') : 'None';

  const eligibilityPoints = parseEligibility(scholarship.eligibility);

  return (
    <div className="scholarship-details-container">
      <div className="scholarship-details-card">
        <div className="scholarship-details-header">
          <h2 className="scholarship-details-heading">{scholarship.title}</h2>
          <div className="scholarship-details-meta">
            <span className="scholarship-details-meta-label">Award:</span>
            <span className="scholarship-details-meta-value">{formatAward(scholarship.award_amount, scholarship.periodicity)}</span>
          </div> 
          <div className="scholarship-details-meta"> 
            <span className="scholarship-details-meta-label">Graduate Levels:</span>
            <span className="scholarship-details-meta-value">{graduateText}</span>
          </div>   
          <div className="scholarship-details-meta"> 
            <span className="scholarship-details-meta-label">Deadline:</span>
            <span className="scholarship-details-meta-value">{scholarship.deadline}</span>
          </div>
        </div>
        <div className="scholarship-details-field">
          <span className="scholarship-details-label">Eligibility:</span>
          <div className="scholarship-details-value">
            {eligibilityPoints.length === 0 ? (
              <span>Not specified</span>
            ) : (
              <ul className="eligibility-list">
                {eligibilityPoints.map((point, index) => (
                  <li key={index}>• {point}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="scholarship-details-field">
          <span className="scholarship-details-label">Country:</span>
          <span className="scholarship-details-value">{scholarship.country}</span>
        </div>
        <a href={scholarship.url} className="scholarship-details-link" target="_blank" rel="noopener">Visit Website</a>
      </div>
    </div>
  );
}

export default Scholarship;