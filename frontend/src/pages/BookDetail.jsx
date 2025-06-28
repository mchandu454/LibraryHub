import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import axios from 'axios';
import { toast } from 'react-toastify';

const BookDetail = () => {
  const { id } = useParams();
  const location = useLocation();
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
  const [isGoogleSource, setIsGoogleSource] = useState(false);
  const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      // Check if source=google in query string
      const params = new URLSearchParams(location.search);
      const isGoogle = params.get('source') === 'google';
      setIsGoogleSource(isGoogle);
      if (isGoogle) {
        // Always fetch from Google Books API
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
          const googleRes = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}${apiKey ? `?key=${apiKey}` : ''}`);
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
              pageCount: gBook.volumeInfo.pageCount,
              publishedDate: gBook.volumeInfo.publishedDate,
              publisher: gBook.volumeInfo.publisher,
              infoLink: gBook.volumeInfo.infoLink,
            });
          } else {
            setError('Book not found.');
          }
        } catch (gErr) {
          setError('Failed to load book details from Google Books.');
        } finally {
          setLoading(false);
        }
        return;
      }
      // Try local DB first
      try {
        const res = await api.get(`/books/${id}`);
        setBook(res.data.book);
      } catch (err) {
        // If not found in local API, fallback to Google Books API
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
          const googleRes = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}${apiKey ? `?key=${apiKey}` : ''}`);
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
              pageCount: gBook.volumeInfo.pageCount,
              publishedDate: gBook.volumeInfo.publishedDate,
              publisher: gBook.volumeInfo.publisher,
              infoLink: gBook.volumeInfo.infoLink,
            });
            setIsGoogleSource(true);
          } else {
            setError('Book not found.');
          }
        } catch (gErr) {
          setError('Failed to load book details from Google Books.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, location.search]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!book || !book.genre) return;
      try {
        const res = await api.get(`/books?genre=${encodeURIComponent(book.genre)}`);
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
    // Only fetch ratings if we have a local DB book (not just a Google Book)
    if (!book || isGoogleSource) return;
    const fetchRatings = async () => {
      try {
        const res = await api.get(`/books/${book.id}/ratings`);
        setAvgRating(res.data.average);
        if (isLoggedIn) {
          const token = localStorage.getItem('token');
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
  }, [book, isLoggedIn, isGoogleSource]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // For now, we'll use a placeholder since the reviews API might not be fully implemented
        // const res = await api.get(`/books/${id}/reviews`);
        // setReviews(res.data.reviews || []);
        setReviews([]); // Empty for now
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    };
    fetchReviews();
  }, [id]);

  // Fetch all local books for matching
  useEffect(() => {
    if (!isGoogleSource || !isLoggedIn) return;
    const fetchAllBooks = async () => {
      try {
        const res = await api.get('/books');
        setAllBooks(res.data.books || []);
      } catch (err) {
        setAllBooks([]);
      }
    };
    fetchAllBooks();
  }, [isGoogleSource, isLoggedIn]);

  // Check if this Google Book is imported and borrowed
  useEffect(() => {
    if (!isGoogleSource || !isLoggedIn || !book || allBooks.length === 0) return;
    // Find local book by title+author
    const localBook = allBooks.find(b => b.title === book.title && b.author === book.author);
    if (!localBook) {
      setUserBorrowing(null);
      return;
    }
    // Check if user has borrowed this book
    const fetchBorrowing = async () => {
      try {
        const res = await api.get('/borrowings/history');
        const borrow = (res.data.borrowings || []).find(bw => bw.bookId === localBook.id && bw.status === 'borrowed');
        setUserBorrowing(borrow || null);
        if (borrow) {
          // Fetch progress
          try {
            const progressRes = await api.get(`/progress/${borrow.id}`);
            setCurrentProgress(progressRes.data.progress.progress || 0);
          } catch {
            setCurrentProgress(0);
          }
        }
      } catch {
        setUserBorrowing(null);
        setCurrentProgress(0);
      }
    };
    fetchBorrowing();
  }, [isGoogleSource, isLoggedIn, book, allBooks]);

  // Borrow handler for Google Books
  const handleBorrowGoogleBook = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to borrow books.');
      navigate('/login');
      return;
    }
    setBorrowing(true);
    try {
      // Import to local DB
      const res = await api.post('/books/import-google', {
        googleId: book.id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        description: book.description,
        image: book.image
      });
      const localBook = res.data.book;
      // Borrow as usual
      await api.post('/borrowings', { bookId: localBook.id });
      toast.success('Book imported and borrowed!');
      // Refresh local books and borrowing state
      const booksRes = await api.get('/books');
      setAllBooks(booksRes.data.books || []);
    } catch (err) {
      toast.error('Failed to borrow Google Book.');
    } finally {
      setBorrowing(false);
    }
  };

  // Return handler for Google Books
  const handleReturnGoogleBook = async () => {
    if (!userBorrowing) return;
    setBorrowing(true);
    try {
      await api.put(`/borrowings/book/${userBorrowing.bookId}/return`);
      toast.success('Book returned!');
      setUserBorrowing(null);
      setCurrentProgress(0);
    } catch (err) {
      toast.error('Failed to return book.');
    } finally {
      setBorrowing(false);
    }
  };

  // Update progress handler for Google Books
  const handleProgressUpdateGoogleBook = async () => {
    if (!userBorrowing || newProgress < 0 || newProgress > 100) {
      toast.error('Invalid progress value. Must be between 0 and 100.');
      return;
    }
    setProgressLoading(true);
    try {
      await api.post('/progress', {
        borrowingId: userBorrowing.id,
        progress: newProgress
      });
      setCurrentProgress(newProgress);
      setShowProgressForm(false);
      toast.success(`Progress updated to ${newProgress}%!`);
    } catch (err) {
      toast.error('Failed to update progress.');
    } finally {
      setProgressLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to borrow books.');
      navigate('/login');
      return;
    }
    setBorrowing(true);
    try {
      if (isGoogleSource) {
        // For Google Books, create a local record first
        try {
          const createResponse = await api.post('/books/google', {
            googleBookId: book.id,
            title: book.title,
            author: book.author,
            description: book.description,
            image: book.image,
            genre: book.genre,
            pageCount: book.pageCount,
            publishedDate: book.publishedDate,
            publisher: book.publisher,
            isbn: book.isbn
          });
          // Now borrow the newly created local book
          await api.post('/borrowings', {
            bookId: createResponse.data.book.id
          });
          toast.success('Book added to library and borrowed successfully!');
          navigate(`/dashboard`);
        } catch (err) {
          toast.error('Failed to import and borrow Google Book. Please try again.');
        }
      } else {
        if (!book.available) {
          toast.error('This book is not available for borrowing.');
          return;
        }
        await api.post('/borrowings', {
          bookId: book.id
        });
        toast.success('Book borrowed successfully!');
        const res = await api.get(`/books/${id}`);
        setBook(res.data.book);
      }
    } finally {
      setBorrowing(false);
    }
  };

  const handleReturn = async () => {
    console.log('Starting return process for book:', book.id);
    setBorrowing(true);
    try {
      const returnResponse = await api.put(`/borrowings/book/${book.id}/return`);
      console.log('Return response:', returnResponse.data);
      toast.success('Book returned successfully!');
      
      // Refresh book data to update availability
      console.log('Refreshing book data...');
      const res = await api.get(`/books/${id}`);
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
      await api.post(`/books/${id}/rate`, { rating });
      setUserRating(rating);
      toast.success('Your rating has been submitted!');
      // Refresh average rating
      const res = await api.get(`/books/${id}/ratings`);
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
      await api.post('/progress', {
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
      // await api.post(`/books/${id}/reviews`, { rating: userRating }, { withCredentials: true });
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
      // await api.post(`/books/${id}/reviews`, { rating }, { withCredentials: true });
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

  // For Google Books, always show summary, never error
  if (isGoogleSource && book) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark pb-20 animate-fade-in">
        <div className="max-w-4xl mx-auto px-4 pt-20 flex flex-col md:flex-row gap-8">
          {/* Book Card */}
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
            {/* Borrow/Return/Progress Buttons */}
            {isLoggedIn && (
              <div className="w-full mt-6 flex flex-col gap-3">
                {!userBorrowing ? (
                  <button
                    className="btn-primary py-3 rounded-xl font-bold shadow-glow hover-lift transition-all duration-200"
                    onClick={handleBorrowGoogleBook}
                    disabled={borrowing}
                  >
                    {borrowing ? 'Borrowing...' : 'Borrow'}
                  </button>
                ) : (
                  <>
                    <button
                      className="btn-success py-3 rounded-xl font-bold shadow-glow hover-lift transition-all duration-200"
                      onClick={handleReturnGoogleBook}
                      disabled={borrowing}
                    >
                      {borrowing ? 'Returning...' : 'Return'}
                    </button>
                    <div className="card p-4 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reading Progress</span>
                        <span className="text-sm font-bold text-gradient-secondary">{currentProgress}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner mb-2">
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
                              onChange={e => setNewProgress(parseInt(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-sm font-bold text-gradient-secondary min-w-[3rem]">{newProgress}%</span>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={handleProgressUpdateGoogleBook}
                              disabled={progressLoading}
                              className="flex-1 btn-accent py-2 rounded-xl text-sm font-semibold"
                            >
                              {progressLoading ? 'Updating...' : 'Update Progress'}
                            </button>
                            <button
                              onClick={() => {
                                setShowProgressForm(false);
                                setNewProgress(currentProgress);
                              }}
                              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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
                          className="w-full btn-accent py-2 rounded-xl text-sm font-semibold mt-2"
                        >
                          📊 Update Progress
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {/* Book Details */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="heading-1 text-gradient-primary mb-2">{book.title}</h1>
            <div className="flex items-center gap-4 mb-3">
              <span className="text-lg text-gray-700 dark:text-gray-300">by <span className="font-semibold text-gray-900 dark:text-white">{book.author}</span></span>
              <span className="inline-block px-3 py-1 text-xs bg-gradient-primary text-white rounded-full font-medium shadow-soft">{book.genre}</span>
            </div>
            <div className="body-text text-lg leading-relaxed mb-4">
              {book.description || 'No description available.'}
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
              {book.pageCount && <div><b>Pages:</b> {book.pageCount}</div>}
              {book.publishedDate && <div><b>Published:</b> {book.publishedDate}</div>}
              {book.publisher && <div><b>Publisher:</b> {book.publisher}</div>}
              {book.infoLink && <div><a href={book.infoLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">View on Google Books</a></div>}
            </div>
          </div>
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
      {book && isGoogleSource && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
          Imported from Google Books
        </div>
      )}
      {/* Borrow/Return Section */}
      {isLoggedIn && (
        <div className="flex gap-4 mt-4">
          {userBorrowing ? (
            <button
              className="btn-secondary"
              onClick={handleReturn}
              disabled={borrowing}
            >
              {borrowing ? 'Returning...' : 'Return Book'}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleBorrow}
              disabled={borrowing || !book.available}
            >
              {borrowing ? 'Borrowing...' : isGoogleSource ? 'Import & Borrow' : 'Borrow Book'}
            </button>
          )}
        </div>
      )}
      {/* Ratings Section */}
      <div className="mt-6">
        <h3 className="font-bold text-lg mb-2">Ratings</h3>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-500 text-xl">★</span>
          <span className="font-semibold">{avgRating !== null ? avgRating.toFixed(1) : 'N/A'}</span>
          <span className="text-gray-500 text-sm">({book && book.ratingCount ? book.ratingCount : 0} ratings)</span>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-2">
            <span>Your Rating:</span>
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                className={star <= (userRating || 0) ? 'text-yellow-500' : 'text-gray-400'}
                onClick={() => handleRate(star)}
                disabled={ratingLoading}
              >
                ★
              </button>
            ))}
            {ratingLoading && <span className="ml-2 text-xs text-gray-500">Saving...</span>}
          </div>
        )}
      </div>
      {/* Related Books Section */}
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-2">Related Books</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedBooks.length === 0 ? (
            <span className="text-gray-500">No related books found.</span>
          ) : (
            relatedBooks.map(rb => (
              <div key={rb.id} className="p-2 border rounded hover:shadow">
                <img src={rb.image || rb.coverImage} alt={rb.title} className="w-full h-32 object-cover rounded mb-2" />
                <div className="font-semibold text-sm mb-1">{rb.title}</div>
                <div className="text-xs text-gray-500 mb-1">by {rb.author}</div>
                <button
                  className="btn-link text-blue-600 text-xs"
                  onClick={() => navigate(`/books/${rb.id}`)}
                >
                  View Details
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">{error}</div>
      )}
    </div>
  );
};

export default BookDetail;