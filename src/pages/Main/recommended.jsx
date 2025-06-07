import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthContext } from '../../hooks/useAuthContext';
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

const getAwardValue = (award, periodicity) => {
  if (award === "full") return Infinity; 
  if (award === "variable") return -Infinity; 
  if (award == null || isNaN(parseFloat(award))) return 0; 
  const numericAward = parseFloat(award);
  return periodicity === "monthly" ? numericAward * 12 : numericAward;
};

const RecommendedScholarships = () => {
  const { isAuthenticated, userLogin } = useAuthContext();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    deadline: '',
    minAmount: '',
    showFull: false,
    showVariable: false,
    country: ''
  });
  const [sortCriteria, setSortCriteria] = useState({
    sortBy: '',
    order: 'asc',
  });
  
  const username = userLogin?.result?.username;

  useEffect(() => {
    if (!username) {
      setError('Please log in to view recommended scholarships.');
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:8008/recommendedscholarships/${username}`)
      .then(response => {
        setScholarships(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching recommended scholarships:', error);
        setError('Failed to load recommended scholarships.');
        setLoading(false);
      });
  }, [username]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilterCriteria(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSortCriteria(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilterCriteria({
      deadline: '',
      minAmount: '',
      showFull: false,
      showVariable: false,
      country: ''
    });
    setShowFilter(false);
  };

  const clearSort = () => {
    setSortCriteria({
      sortBy: '',
      order: 'asc',
    });
    setShowSort(false);
  };

  const filteredScholarships = scholarships.filter(sch => {
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch = (
      sch.title.toLowerCase().includes(searchLower) ||
      formatAward(sch.award_amount, sch.periodicity).toLowerCase().includes(searchLower) ||
      (sch.country?.toLowerCase() || '').includes(searchLower)
    );

    const matchesDeadline = !filterCriteria.deadline || 
      sch.deadline === 'NA' || sch.deadline === 'N/A' ||
      (sch.deadline !== 'NA' && sch.deadline !== 'N/A' && 
       new Date(sch.deadline).toString() !== 'Invalid Date' && 
       new Date(sch.deadline) >= new Date(filterCriteria.deadline));

    const matchesAmount = (() => {
      const hasMinAmount = filterCriteria.minAmount !== '';
      const hasFull = filterCriteria.showFull;
      const hasVariable = filterCriteria.showVariable;
      
      if (!hasMinAmount && !hasFull && !hasVariable) {
        return true;
      }
      
      if (hasFull && sch.award_amount === "full") {
        return true;
      }
      
      if (hasVariable && sch.award_amount === "variable") {
        return true;
      }
      
      if (hasMinAmount) {
        const minAmount = parseFloat(filterCriteria.minAmount) || 0;
        if (sch.award_amount === "full" && hasFull) return true;
        if (sch.award_amount === "variable" && hasVariable) return true;
        if (typeof sch.award_amount === "number" || !isNaN(parseFloat(sch.award_amount))) {
          const awardValue = getAwardValue(sch.award_amount, sch.periodicity);
          return awardValue >= minAmount;
        }
        return false;
      }
      
      return false;
    })();

    const matchesCountry = (() => {
      if (!filterCriteria.country) return true;
      const countryTrimmed = sch.country ? sch.country.trim().toLowerCase() : '';
      
      if (filterCriteria.country === 'India') {
        return countryTrimmed === 'india';
      } else if (filterCriteria.country === 'Abroad') {
        return countryTrimmed !== 'india';
      } else if (filterCriteria.country === 'United States') {
        return countryTrimmed === 'united states' || countryTrimmed === 'usa';
      } else if (filterCriteria.country === 'United Kingdom') {
        return countryTrimmed === 'united kingdom' || countryTrimmed === 'uk';
      }
      
      return countryTrimmed === filterCriteria.country.toLowerCase();
    })();

    return matchesSearch && matchesDeadline && matchesAmount && matchesCountry;
  });

  const sortedScholarships = [...filteredScholarships].sort((a, b) => {
    if (!sortCriteria.sortBy) return 0;

    if (sortCriteria.sortBy === 'deadline') {
      const dateA = a.deadline && a.deadline !== 'NA' && a.deadline !== 'N/A' ? new Date(a.deadline) : null;
      const dateB = b.deadline && b.deadline !== 'NA' && b.deadline !== 'N/A' ? new Date(b.deadline) : null;
      
      const valueA = dateA && dateA.toString() !== 'Invalid Date' ? dateA.getTime() : (sortCriteria.order === 'asc' ? Infinity : -Infinity);
      const valueB = dateB && dateB.toString() !== 'Invalid Date' ? dateB.getTime() : (sortCriteria.order === 'asc' ? Infinity : -Infinity);
      
      return sortCriteria.order === 'asc' ? valueA - valueB : valueB - valueA;
    } else if (sortCriteria.sortBy === 'amount') {
      const amountA = getAwardValue(a.award_amount, a.periodicity);
      const amountB = getAwardValue(b.award_amount, b.periodicity);
      return sortCriteria.order === 'asc' ? amountA - amountB : amountB - amountA;
    }
    return 0;
  });

  if (loading) return (
    <div className="loading-container">
      <svg className="loading-spinner" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
      <p className="loading-text">Loading scholarships...</p>
    </div>
  );
  if (error) return <p className="no-results-text">{error}</p>;

  return (
    <div className="scholarship-list-container">
      <h2 className="scholarship-list-heading">Recommended Scholarships</h2>
      <div className="scholarship-search-container">
        <input
          type="text"
          className="scholarship-search-input"
          placeholder="Search scholarships by title, award, or country..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="scholarship-filter-button"
          onClick={() => setShowFilter(!showFilter)}
          title="Toggle filters"
        >
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v2.586l-7 7V20l-2 2-2-2v-6.414l-7-7V4z" />
          </svg>
        </button>
        <button
          className="scholarship-filter-button"
          onClick={() => setShowSort(!showSort)}
          title="Toggle sort options"
        >
          <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
          </svg>
        </button>
      </div>

      {showFilter && (
        <div className="scholarship-filter-panel">
          <h3 className="filter-panel-heading">Filter Scholarships</h3>
          <div className="filter-field">
            <label className="filter-label">Country:</label>
            <select
              name="country"
              value={filterCriteria.country}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">All Countries</option>
              <option value="India">India</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="United States">United States</option>
              <option value="Australia">Australia</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Germany">Germany</option>
              <option value="Ireland">Ireland</option>
              <option value="Malaysia">Malaysia</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="Abroad">Abroad</option>
              <option value="new-zealand">New Zealand</option>
              <option value="Sweden">Sweden</option>
              <option value="Singapore">Singapore</option>
              <option value="hong-kong">Hong Kong</option>
              <option value="uae">United Arab Emirates</option>
              <option value="Italy">Italy</option>
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label">Deadline After:</label>
            <input
              type="date"
              name="deadline"
              value={filterCriteria.deadline}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Award Amount:</label>
            <div className="filter-checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="showFull"
                  checked={filterCriteria.showFull}
                  onChange={handleFilterChange}
                />
                Full Scholarships
              </label>
              <label>
                <input
                  type="checkbox"
                  name="showVariable"
                  checked={filterCriteria.showVariable}
                  onChange={handleFilterChange}
                />
                Variable Amount
              </label>
            </div>
            <label className="filter-label" style={{ marginTop: '10px' }}>Minimum Amount (₹):</label>
            <input
              type="number"
              name="minAmount"
              value={filterCriteria.minAmount}
              onChange={handleFilterChange}
              className="filter-input"
              placeholder="e.g., 50000"
            />
          </div>
          <div className="filter-buttons">
            <button className="filter-apply-button" onClick={() => setShowFilter(false)}>Apply Filters</button>
            <button className="filter-clear-button" onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>
      )}

      {showSort && (
        <div className="scholarship-filter-panel">
          <h3 className="filter-panel-heading">Sort Scholarships</h3>
          <div className="filter-field">
            <label className="filter-label">Sort By:</label>
            <div className="filter-checkbox-group">
              <label>
                <input
                  type="radio"
                  name="sortBy"
                  value="deadline"
                  checked={sortCriteria.sortBy === 'deadline'}
                  onChange={handleSortChange}
                />
                Deadline
              </label>
              <label>
                <input
                  type="radio"
                  name="sortBy"
                  value="amount"
                  checked={sortCriteria.sortBy === 'amount'}
                  onChange={handleSortChange}
                />
                Award Amount
              </label>
            </div>
          </div>
          <div className="filter-field">
            <label className="filter-label">Order:</label>
            <div className="filter-checkbox-group">
              <label>
                <input
                  type="radio"
                  name="order"
                  value="asc"
                  checked={sortCriteria.order === 'asc'}
                  onChange={handleSortChange}
                />
                Ascending
              </label>
              <label>
                <input
                  type="radio"
                  name="order"
                  value="desc"
                  checked={sortCriteria.order === 'desc'}
                  onChange={handleSortChange}
                />
                Descending
              </label>
            </div>
          </div>
          <div className="filter-buttons">
            <button className="filter-apply-button" onClick={() => setShowSort(false)}>Apply Sort</button>
            <button className="filter-clear-button" onClick={clearSort}>Clear Sort</button>
          </div>
        </div>
      )}

      {sortedScholarships.length === 0 ? (
        <p className="no-results-text">No scholarships found for your profile or criteria.</p>
      ) : (
        <ul className="scholarship-list">
          {sortedScholarships.map(scholarship => {
            const graduateLevels = [];
            if (scholarship.undergraduate) graduateLevels.push('Undergraduate');
            if (scholarship.postgraduate) graduateLevels.push('Postgraduate');
            if (scholarship.doctoral) graduateLevels.push('Doctoral');
            const graduateText = graduateLevels.length > 0 ? graduateLevels.join(', ') : 'None';

            return (
              <li key={scholarship._id} className="scholarship-item">
                <Link to={`/scholarship/${scholarship._id}`} className="scholarship-link">{scholarship.title}</Link>
                <div className="scholarship-item-meta">
                  <span className="scholarship-item-label">Country:</span>
                  <span className="scholarship-item-value">{scholarship.country?.trim() || 'Unknown'}</span>
                </div>
                <div className="scholarship-item-meta">  
                  <span className="scholarship-item-label">Award:</span>
                  <span className="scholarship-item-value">{formatAward(scholarship.award_amount, scholarship.periodicity)}</span>
                </div>
                <div className="scholarship-item-meta"> 
                  <span className="scholarship-item-label">Graduate Levels:</span>
                  <span className="scholarship-item-value">{graduateText}</span>
                </div>
                <div className="scholarship-item-meta"> 
                  <span className="scholarship-item-label">Deadline:</span>
                  <span className="scholarship-item-value">{scholarship.deadline}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecommendedScholarships;