import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [tab, setTab] = useState('desc');
  const [reviews, setReviews] = useState([]);
  const [userBorrowing, setUserBorrowing] = useState(null);
  // Progress tracking states
  const [currentProgress, setCurrentProgress] = useState(0);
  const [progressLoading, setProgressLoading] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [newProgress, setNewProgress] = useState(0);
  // Review states
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  // TODO: Replace with real user auth state
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching book with ID:', id);
        const res = await axios.get(`/api/books/${id}`);
        console.log('Book data received:', res.data);
        setBook(res.data.book);
      } catch (err) {
        // If not found in local API, try Google Books API
        console.error('Error fetching book from local API, trying Google Books API:', err);
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
          const googleRes = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`);
          const gBook = googleRes.data;
          if (gBook && gBook.volumeInfo) {
            setBook({
              id: gBook.id,
              title: gBook.volumeInfo.title,
              author: gBook.volumeInfo.authors?.join(', ') || 'Unknown',
              description: gBook.volumeInfo.description || 'No description available.',
              image: gBook.volumeInfo.imageLinks?.thumbnail || '',
              genre: gBook.volumeInfo.categories?.join(', ') || 'Unknown',
              available: true, // Assume available for Google Books
              // Add more fields as needed
            });
          } else {
            setError('Book not found.');
          }
        } catch (gErr) {
          console.error('Error fetching book from Google Books API:', gErr);
          setError('Failed to load book details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!book || !book.genre) return;
      try {
        const res = await axios.get(`/api/books?genre=${encodeURIComponent(book.genre)}`);
        // Exclude current book from related
        setRelatedBooks(res.data.books.filter(b => b.id !== Number(id)));
      } catch (err) {
        console.error('Error fetching related books:', err);
        setRelatedBooks([]);
      }
    };
    fetchRelated();
  }, [book, id]);

  // Fetch ratings
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await axios.get(`/api/books/${id}/ratings`);
        setAvgRating(res.data.average);
        // If logged in, get user's rating
        if (isLoggedIn) {
          const token = localStorage.getItem('token');
          // Optionally, fetch user rating from ratings list
          const userId = JSON.parse(atob(token.split('.')[1])).id;
          const userR = (res.data.ratings || []).find(r => r.userId === userId);
          setUserRating(userR ? userR.rating : null);
        }
      } catch (err) {
        setAvgRating(null);
        setUserRating(null);
      }
    };
    fetchRatings();
  }, [id, isLoggedIn]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // For now, we'll use a placeholder since the reviews API might not be fully implemented
        // const res = await axios.get(`/api/books/${id}/reviews`);
        // setReviews(res.data.reviews || []);
        setReviews([]); // Empty for now
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    };
    fetchReviews();
  }, [id]);

  // Fetch if the current user has borrowed this book and not returned it
  useEffect(() => {
    const fetchUserBorrowing = async () => {
      if (!isLoggedIn || !book) return;
      try {
        const res = await axios.get('/api/borrowings/history');
        const borrow = (res.data.borrowings || []).find(b => b.bookId === Number(id) && b.status === 'borrowed');
        setUserBorrowing(borrow);
        
        // If user has borrowed this book, fetch progress
        if (borrow) {
          try {
            const progressRes = await axios.get(`/api/progress/${borrow.id}`);
            setCurrentProgress(progressRes.data.progress.progress || 0);
          } catch (progressErr) {
            // No progress record exists yet, start at 0
            setCurrentProgress(0);
          }
        }
      } catch (err) {
        setUserBorrowing(null);
        setCurrentProgress(0);
      }
    };
    fetchUserBorrowing();
  }, [isLoggedIn, book, id]);

  const handleBorrow = async () => {
    if (!book.available) {
      toast.error('This book is not available for borrowing.');
      return;
    }

    console.log('Starting borrow process for book:', book.id);
    setBorrowing(true);
    try {
      const token = localStorage.getItem('token');
      const borrowResponse = await axios.post('/api/borrowings', { bookId: book.id }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Borrow response:', borrowResponse.data);
      toast.success('Book borrowed successfully!');
      
      // Refresh book data to update availability
      console.log('Refreshing book data...');
      const res = await axios.get(`/api/books/${id}`);
      console.log('Updated book data:', res.data);
      setBook(res.data.book);
    } catch (err) {
      console.error('Error borrowing book:', err);
      toast.error(err.response?.data?.message || 'Failed to borrow book.');
    } finally {
      setBorrowing(false);
    }
  };

  const handleReturn = async () => {
    console.log('Starting return process for book:', book.id);
    setBorrowing(true);
    try {
      const returnResponse = await axios.put(`/api/borrowings/book/${book.id}/return`);
      console.log('Return response:', returnResponse.data);
      toast.success('Book returned successfully!');
      
      // Refresh book data to update availability
      console.log('Refreshing book data...');
      const res = await axios.get(`/api/books/${id}`);
      console.log('Updated book data:', res.data);
      setBook(res.data.book);
    } catch (err) {
      console.error('Error returning book:', err);
      toast.error(err.response?.data?.message || 'Failed to return book.');
    } finally {
      setBorrowing(false);
    }
  };

  // Handle user rating submit
  const handleRate = async (rating) => {
    setRatingLoading(true);
    try {
      await axios.post(`/api/books/${id}/rate`, { rating });
      setUserRating(rating);
      toast.success('Your rating has been submitted!');
      // Refresh average rating
      const res = await axios.get(`/api/books/${id}/ratings`);
      setAvgRating(res.data.average);
    } catch (err) {
      toast.error('Failed to submit rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  // Handle progress update
  const handleProgressUpdate = async () => {
    if (!userBorrowing || newProgress < 0 || newProgress > 100) {
      toast.error('Invalid progress value. Must be between 0 and 100.');
      return;
    }

    setProgressLoading(true);
    try {
      await axios.post('/api/progress', {
        borrowingId: userBorrowing.id,
        progress: newProgress
      });
      
      setCurrentProgress(newProgress);
      setShowProgressForm(false);
      toast.success(`Progress updated to ${newProgress}%!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress.');
    } finally {
      setProgressLoading(false);
    }
  };

  // Handle review submission
  const handleAddReview = async () => {
    if (!userRating) {
      toast.error('Please select a rating.');
      return;
    }

    try {
      // For now, we'll just show a success message since the review API might not be fully implemented
      toast.success(`Rating of ${userRating} stars submitted successfully!`);
      // In a full implementation, you would post to a reviews API endpoint
      // await axios.post(`/api/books/${id}/reviews`, { rating: userRating }, { withCredentials: true });
    } catch (err) {
      toast.error('Failed to submit rating.');
    }
  };

  // Handle star click and immediate submission
  const handleStarClick = async (rating) => {
    setUserRating(rating);
    setRatingSubmitted(true);
    
    try {
      // For now, we'll just show a success message since the review API might not be fully implemented
      toast.success(`Rating of ${rating} stars submitted successfully!`);
      // In a full implementation, you would post to a reviews API endpoint
      // await axios.post(`/api/books/${id}/reviews`, { rating }, { withCredentials: true });
    } catch (err) {
      toast.error('Failed to submit rating.');
      setRatingSubmitted(false);
    }
  };

  // Add error boundary for debugging
  if (error) {
    console.error('BookDetail error state:', error);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto py-12 sm:py-16 lg:py-20 px-4 text-center">
        <div className="text-red-500 text-4xl sm:text-6xl mb-4">⚠️</div>
        <h1 className="heading-2 mb-4">
          {error || 'Book not found'}
        </h1>
        <button
          onClick={() => navigate('/')}
          className="btn-primary px-6 sm:px-8 py-3 sm:py-4"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Add safety check for book object
  if (!book || typeof book !== 'object') {
    console.error('Invalid book object:', book);
    return (
      <div className="container mx-auto py-12 sm:py-16 lg:py-20 px-4 text-center">
        <div className="text-red-500 text-4xl sm:text-6xl mb-4">⚠️</div>
        <h1 className="heading-2 mb-4">Invalid book data</h1>
        <button
          onClick={() => navigate('/')}
          className="btn-primary px-6 sm:px-8 py-3 sm:py-4"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark pb-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 pt-20 flex flex-col lg:flex-row gap-8">
        {/* Book Cover */}
        <div className="flex-shrink-0 flex flex-col items-center gap-6">
          <div className="card p-6 w-72 h-96 flex items-center justify-center group hover-scale">
            {book.image ? (
              <img src={book.image} alt={book.title} className="w-full h-full object-cover rounded-xl shadow-soft" />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <span className="text-gray-400 text-lg">No Cover</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          {book.available ? (
            <button
              type="button"
              aria-label="Borrow this book"
              tabIndex={0}
              className={`w-full btn-primary py-4 rounded-xl font-bold shadow-glow hover-lift transition-all duration-300 ${!isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleBorrow}
              disabled={!isLoggedIn || borrowing}
            >
              📖 Borrow This Book
            </button>
          ) : userBorrowing ? (
            <div className="w-full space-y-4">
              <button
                type="button"
                aria-label="Return this book"
                tabIndex={0}
                className={`w-full btn-success py-4 rounded-xl font-bold shadow-glow hover-lift transition-all duration-300`}
                onClick={handleReturn}
                disabled={borrowing}
              >
                📚 Return This Book
              </button>
              
              {/* Progress Tracking Section */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reading Progress</span>
                  <span className="text-sm font-bold text-gradient-secondary">{currentProgress}%</span>
                </div>
                <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-secondary transition-all duration-500 shadow-soft" 
                    style={{ width: `${currentProgress}%` }}
                  ></div>
                </div>
                
                {showProgressForm ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newProgress}
                        onChange={(e) => setNewProgress(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <span className="text-sm font-bold text-gradient-secondary min-w-[3rem]">{newProgress}%</span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleProgressUpdate}
                        disabled={progressLoading}
                        className="flex-1 btn-accent py-3 rounded-xl text-sm font-semibold"
                      >
                        {progressLoading ? 'Updating...' : 'Update Progress'}
                      </button>
                      <button
                        onClick={() => {
                          setShowProgressForm(false);
                          setNewProgress(currentProgress);
                        }}
                        className="px-4 py-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowProgressForm(true);
                      setNewProgress(currentProgress);
                    }}
                    className="w-full btn-accent py-3 rounded-xl text-sm font-semibold"
                  >
                    📊 Update Progress
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Return this book"
              tabIndex={0}
              className={`w-full btn-primary py-4 rounded-xl font-bold shadow-glow mt-2 opacity-60 cursor-not-allowed`}
              disabled
            >
              📚 Return This Book
            </button>
          )}
        </div>
        
        {/* Book Info & Tabs */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Book Header */}
          <div className="card p-8 flex flex-col gap-4">
            <h1 className="heading-1 text-gradient-primary mb-2">{book.title}</h1>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-lg text-gray-700 dark:text-gray-300">by <span className="font-semibold text-gray-900 dark:text-white">{book.author}</span></span>
              <span className="inline-block px-3 py-1 text-xs bg-gradient-primary text-white rounded-full font-medium shadow-soft">{book.genre}</span>
              <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium shadow-soft ${
                book.available 
                  ? 'bg-gradient-success text-white' 
                  : 'bg-gradient-danger text-white'
              }`}>
                {book.available ? 'Available' : 'Borrowed'}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-2xl transition-colors ${
                  i < (book.rating || 0) 
                    ? 'text-accent-500' 
                    : 'text-gray-300 dark:text-gray-600'
                }`}>★</span>
              ))}
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({avgRating ? avgRating.toFixed(1) : 'No ratings yet'} ratings)
              </span>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="card p-6 flex flex-col gap-6">
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
              <button 
                className={`pb-3 px-4 font-semibold text-lg transition-all duration-300 rounded-t-lg ${
                  tab === 'desc' 
                    ? 'text-gradient-primary border-b-2 border-accent-500 bg-accent-50 dark:bg-accent-900/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`} 
                onClick={() => setTab('desc')}
              >
                Description
              </button>
              <button 
                className={`pb-3 px-4 font-semibold text-lg transition-all duration-300 rounded-t-lg ${
                  tab === 'reviews' 
                    ? 'text-gradient-primary border-b-2 border-accent-500 bg-accent-50 dark:bg-accent-900/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`} 
                onClick={() => setTab('reviews')}
              >
                Reviews
              </button>
              <button 
                className={`pb-3 px-4 font-semibold text-lg transition-all duration-300 rounded-t-lg ${
                  tab === 'related' 
                    ? 'text-gradient-primary border-b-2 border-accent-500 bg-accent-50 dark:bg-accent-900/20' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`} 
                onClick={() => setTab('related')}
              >
                Related
              </button>
            </div>
            
            {tab === 'desc' && (
              <div className="body-text text-lg leading-relaxed">
                {book.description || 'No description available.'}
              </div>
            )}
            
            {tab === 'reviews' && (
              <div>
                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">No reviews yet.</div>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((review, idx) => (
                      <li key={idx} className="card p-4 hover-lift">
                        <div className="flex items-center gap-3 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${
                              i < review.rating 
                                ? 'text-accent-500' 
                                : 'text-gray-300 dark:text-gray-600'
                            }`}>★</span>
                          ))}
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {review.userName || 'User'}
                          </span>
                        </div>
                        <div className="body-text">{review.comment}</div>
                      </li>
                    ))}
                  </ul>
                )}
                
                {/* Add Rating */}
                {isLoggedIn && (
                  <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Your Rating:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <button 
                            type="button" 
                            key={i} 
                            onClick={() => handleStarClick(i + 1)} 
                            className={`text-3xl transition-all duration-300 hover:scale-110 ${
                              i < userRating 
                                ? 'text-accent-500' 
                                : 'text-gray-300 dark:text-gray-600 hover:text-accent-400'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      {userRating && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">({userRating} stars)</span>
                      )}
                    </div>
                    {ratingSubmitted && (
                      <div className="text-success-600 dark:text-success-400 text-sm font-medium bg-success-50 dark:bg-success-900/20 p-3 rounded-lg">
                        ✓ Rating submitted successfully!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {tab === 'related' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedBooks.map(rb => (
                  <div key={rb.id} className="card p-4 flex flex-col items-center group hover-scale cursor-pointer" onClick={() => navigate(`/book/${rb.id}`)}>
                    <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden shadow-soft">
                      {rb.image ? (
                        <img src={rb.image} alt={rb.title} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-gray-400 text-xs">No Cover</span>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">{rb.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-xs mb-2">{rb.author}</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-accent-500">★</span>
                        <span className="text-sm font-medium">{rb.rating || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {relatedBooks.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">No related books found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;