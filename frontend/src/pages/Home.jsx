import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [search, setSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState('all'); // 'all', 'title', 'author'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [borrowingGoogle, setBorrowingGoogle] = useState({});
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const navigate = useNavigate();
  const [googleTrending, setGoogleTrending] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Predefined genre suggestions
  const genreSuggestions = [
    'Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 
    'Romance', 'Young Adult', 'History', 'Self-Help', 'Business', 
    'Technology', 'Biography', 'Poetry', 'Horror', 'Adventure'
  ];

  useEffect(() => {
    const fetchAllBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/books');
        setAllBooks(res.data.books || []);
        setFilteredBooks(res.data.books || []);
        
        // Extract unique genres from all books
        const genreSet = new Set();
        (res.data.books || []).forEach(book => {
          if (book.genre) genreSet.add(book.genre);
        });
        setGenres(['All', ...Array.from(genreSet).sort()]);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllBooks();
  }, []);

  // Fetch trending books on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('/api/books/trending');
        // Trending books come as { trending: [ { bookId, borrowCount, Book: {...} } ] }
        setTrendingBooks((res.data.trending || []).map(item => ({
          ...item.Book,
          borrowCount: item.borrowCount,
          // Mock rating: 3-5 stars randomly for demo
          rating: Math.floor(Math.random() * 3) + 3
        })));
      } catch (err) {
        setTrendingBooks([]);
      }
    };
    fetchTrending();
  }, []);

  // Filter books based on search and genre
  useEffect(() => {
    let filtered = allBooks;

    // Filter by genre
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    // Filter by search
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(book => {
        switch (searchFilter) {
          case 'title':
            return book.title.toLowerCase().includes(searchTerm);
          case 'author':
            return book.author.toLowerCase().includes(searchTerm);
          case 'all':
          default:
            return (
              book.title.toLowerCase().includes(searchTerm) ||
              book.author.toLowerCase().includes(searchTerm) ||
              (book.description && book.description.toLowerCase().includes(searchTerm))
            );
        }
      });
    }

    setFilteredBooks(filtered);
  }, [allBooks, selectedGenre, search, searchFilter]);

  // Fetch Google Books when search changes
  useEffect(() => {
    if (!search.trim()) {
      setGoogleBooks([]);
      return;
    }
    let cancel = false;
    setGoogleLoading(true);
    const fetchGoogleBooks = async () => {
      try {
        const q = encodeURIComponent(search);
        const res = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=8`);
        if (!cancel) {
          setGoogleBooks(
            (res.data.items || []).map(item => ({
              id: item.id,
              title: item.volumeInfo.title,
              author: (item.volumeInfo.authors || []).join(', '),
              image: item.volumeInfo.imageLinks?.thumbnail || '',
              genre: (item.volumeInfo.categories && item.volumeInfo.categories[0]) || 'Unknown',
              description: item.volumeInfo.description || '',
              source: 'google',
              infoLink: item.volumeInfo.infoLink || '#',
            }))
          );
        }
      } catch (err) {
        if (!cancel) setGoogleBooks([]);
      } finally {
        if (!cancel) setGoogleLoading(false);
      }
    };
    const timeout = setTimeout(fetchGoogleBooks, 400); // debounce
    return () => { cancel = true; clearTimeout(timeout); };
  }, [search]);

  // Restore: Google Books trending useEffect
  useEffect(() => {
    const fetchGoogleTrending = async () => {
      try {
        const res = await axios.get('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=8');
        setGoogleTrending(
          (res.data.items || []).map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            author: (item.volumeInfo.authors || []).join(', '),
            image: item.volumeInfo.imageLinks?.thumbnail || '',
            genre: (item.volumeInfo.categories && item.volumeInfo.categories[0]) || 'Unknown',
            description: item.volumeInfo.description || '',
            source: 'google',
            infoLink: item.volumeInfo.infoLink || '#',
          }))
        );
      } catch (err) {
        setGoogleTrending([]);
      }
    };
    fetchGoogleTrending();
  }, []);

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    setSearch(''); // Clear search when changing genre
  };

  const handleSearchSuggestion = (suggestion) => {
    setSearch(suggestion);
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setSelectedGenre('All');
    setSearch('');
    setSearchFilter('all');
  };

  const getSearchPlaceholder = () => {
    switch (searchFilter) {
      case 'title':
        return 'Search by book title...';
      case 'author':
        return 'Search by author name...';
      case 'all':
      default:
        return 'Search by title, author, or description...';
    }
  };

  // Helper: Check if a Google Book is already borrowed (by title+author)
  const isGoogleBookBorrowed = (googleBook) => {
    return allBooks.some(b => b.title === googleBook.title && b.author === googleBook.author && !b.available);
  };

  // Helper: Borrow Google Book
  const handleBorrowGoogleBook = async (googleBook) => {
    setBorrowingGoogle(bg => ({ ...bg, [googleBook.id]: true }));
    try {
      // Import to local DB
      const res = await axios.post('/api/books/import-google', {
        googleId: googleBook.id,
        title: googleBook.title,
        author: googleBook.author,
        genre: googleBook.genre,
        description: googleBook.description,
        image: googleBook.image
      }, { withCredentials: true });
      const localBook = res.data.book;
      // Borrow as usual
      await axios.post('/api/borrowings', { bookId: localBook.id }, { withCredentials: true });
      // Refresh local books
      const booksRes = await axios.get('/api/books');
      setAllBooks(booksRes.data.books || []);
      setFilteredBooks(booksRes.data.books || []);
      setBorrowingGoogle(bg => ({ ...bg, [googleBook.id]: false }));
    } catch (err) {
      setBorrowingGoogle(bg => ({ ...bg, [googleBook.id]: false }));
      alert('Failed to borrow Google Book.');
    }
  };

  // Helper: Open Google Book as local BookDetail
  const handleOpenGoogleBook = async (googleBook) => {
    try {
      // Try to find in local books first
      let localBook = allBooks.find(b => b.title === googleBook.title && b.author === googleBook.author);
      if (!localBook) {
        // Import to local DB
        const res = await axios.post('/api/books/import-google', {
          googleId: googleBook.id,
          title: googleBook.title,
          author: googleBook.author,
          genre: googleBook.genre,
          description: googleBook.description,
          image: googleBook.image
        }, { withCredentials: true });
        localBook = res.data.book;
        // Optionally refresh local books
        const booksRes = await axios.get('/api/books');
        setAllBooks(booksRes.data.books || []);
        setFilteredBooks(booksRes.data.books || []);
      }
      navigate(`/book/${localBook.id}`);
    } catch (err) {
      alert('Failed to open Google Book.');
    }
  };

  // Add a function to fetch books by search
  const fetchBooksBySearch = async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/books?search=${encodeURIComponent(searchTerm)}`);
      setAllBooks(res.data.books || []);
      setFilteredBooks(res.data.books || []);
    } catch (err) {
      setError('Failed to load books.');
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => { setCurrentPage(1); }, [search, selectedGenre, filteredBooks.length]);

  // Add this useEffect after the handleGenreClick definition
  useEffect(() => {
    if (selectedGenre === 'All') {
      setGoogleBooks([]);
      return;
    }
    let cancel = false;
    setGoogleLoading(true);
    const fetchGoogleBooksByGenre = async () => {
      try {
        const q = encodeURIComponent(`subject:${selectedGenre}`);
        const res = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=8`);
        if (!cancel) {
          setGoogleBooks(
            (res.data.items || []).map(item => ({
              id: item.id,
              title: item.volumeInfo.title,
              author: (item.volumeInfo.authors || []).join(', '),
              image: item.volumeInfo.imageLinks?.thumbnail || '',
              genre: (item.volumeInfo.categories && item.volumeInfo.categories[0]) || selectedGenre,
              description: item.volumeInfo.description || '',
              source: 'google',
              infoLink: item.volumeInfo.infoLink || '#',
            }))
          );
        }
      } catch (err) {
        if (!cancel) setGoogleBooks([]);
      } finally {
        if (!cancel) setGoogleLoading(false);
      }
    };
    fetchGoogleBooksByGenre();
    return () => { cancel = true; };
  }, [selectedGenre]);

  // Deduplicate Google Books: filter out Google Books that match a local book (by title+author, case-insensitive)
  const dedupedGoogleBooks = selectedGenre !== 'All' ? googleBooks.filter(gb => !filteredBooks.some(lb => lb.title.toLowerCase() === gb.title.toLowerCase() && lb.author.toLowerCase() === gb.author.toLowerCase())) : [];

  // Compute merged books for pagination
  const mergedBooks = [
    ...filteredBooks,
    ...(selectedGenre !== 'All' ? dedupedGoogleBooks : [])
  ];
  const totalPages = Math.ceil(mergedBooks.length / pageSize);
  const pagedBooks = mergedBooks.slice((currentPage-1)*pageSize, currentPage*pageSize);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-light via-glass to-accent-teal pb-20">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-8 flex flex-col md:flex-row items-center gap-10 animate-fadeIn">
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-2 tracking-tight drop-shadow-glow">
            Discover Your Next <span className="text-accent-gold">Great Read</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-4 max-w-xl">
            Explore trending books, search by title or author, and filter by genre. Borrow, rate, and track your reading journey—all in one beautiful library hub.
          </p>
          <form
            onSubmit={e => { e.preventDefault(); fetchBooksBySearch(search); setShowSuggestions(false); }}
            className="flex gap-2 w-full max-w-lg relative"
            autoComplete="off"
          >
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search books by title or author..."
              aria-label="Search books by title or author"
              className="flex-1 px-5 py-3 rounded-xl bg-glass dark:bg-darkglass shadow-card border-none focus:ring-2 focus:ring-primary outline-none text-lg transition-all"
            />
            <button
              type="submit"
              aria-label="Search"
              className="px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-glow hover:bg-accent-teal transition-colors text-lg"
            >
              Search
            </button>
            {showSuggestions && search.trim() && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-darkglass rounded-xl shadow-card z-50 max-h-80 overflow-y-auto border border-primary-light">
                {googleLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
                  </div>
                )}
                {/* Local book suggestions */}
                {filteredBooks.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())).slice(0, 5).map(book => (
                  <div
                    key={book.id}
                    className="px-4 py-2 hover:bg-accent-teal hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                    onMouseDown={() => { setSearch(book.title); setShowSuggestions(false); navigate(`/book/${book.id}`); }}
                  >
                    <span className="w-8 h-10 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {book.image ? <img src={book.image} alt={book.title} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs">No Cover</span>}
                    </span>
                    <span className="flex-1">
                      <span className="font-semibold">{book.title}</span>
                      <span className="block text-xs text-gray-500">by {book.author}</span>
                    </span>
                    <span className="text-xs bg-gradient-primary text-white rounded-full px-2 py-1">Local</span>
                  </div>
                ))}
                {/* Google Books suggestions */}
                {dedupedGoogleBooks.slice(0, 5).map(book => (
                  <div
                    key={book.id}
                    className="px-4 py-2 hover:bg-accent-teal hover:text-white cursor-pointer transition-colors flex items-center gap-2"
                    onMouseDown={() => { setSearch(book.title); setShowSuggestions(false); handleOpenGoogleBook(book); }}
                  >
                    <span className="w-8 h-10 flex-shrink-0 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {book.image ? <img src={book.image} alt={book.title} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs">No Cover</span>}
                    </span>
                    <span className="flex-1">
                      <span className="font-semibold">{book.title}</span>
                      <span className="block text-xs text-gray-500">by {book.author}</span>
                    </span>
                    <span className="text-xs bg-gradient-secondary text-white rounded-full px-2 py-1">Google</span>
                  </div>
                ))}
                {/* No suggestions */}
                {!googleLoading && filteredBooks.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())).length === 0 &&
                  dedupedGoogleBooks.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                  <div className="px-4 py-3 text-gray-500 text-center">No suggestions found.</div>
                )}
              </div>
            )}
          </form>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <img src="/reading-hero.svg" alt="Reading" className="w-80 h-80 object-contain drop-shadow-glow hidden md:block" />
        </div>
      </section>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4 animate-fadeIn">
        {/* Genre Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0 mb-6 md:mb-0">
          <div className="glass p-6 rounded-2xl shadow-card flex flex-col gap-3 sticky top-28">
            <h2 className="text-lg font-bold text-primary-dark mb-2 flex items-center gap-2">
              <span className="text-accent-gold">🎨</span> Genres
            </h2>
            <div className="flex flex-wrap gap-2">
              {genreSuggestions.map(genre => (
                <button
                  key={genre}
                  className={`px-4 py-2 rounded-full font-semibold text-sm shadow-card border border-primary-light hover:bg-accent-teal hover:text-white transition-colors ${selectedGenre === genre ? 'bg-primary text-white' : 'bg-glass dark:bg-darkglass text-primary-dark'}`}
                  onClick={() => handleGenreClick(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col gap-10">
          {/* Trending Books Grid (4 per row desktop, 2 tablet, 1 mobile, no scroll) */}
          {googleTrending.some(book => book.image) && (
            <div className="mb-10">
              <h2 className="heading-2 mb-4 flex items-center gap-2">
                <span role="img" aria-label="trending">🔥</span> Trending Books 
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {googleTrending.filter(book => book.image).map(book => {
                  const borrowed = isGoogleBookBorrowed(book);
                  return (
                    <div
                      key={'google-trending-' + book.id}
                      className="glass rounded-2xl shadow-glow border-gradient dark:border-gradient-dark p-3 flex flex-col hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer animate-pop"
                      onClick={() => handleOpenGoogleBook(book)}
                    >
                      <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center mb-2">
                        <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-base text-gray-800 dark:text-white mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 line-clamp-1">by {book.author}</p>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={'text-gray-300 dark:text-gray-600'}>★</span>
                          ))}
                        </div>
                        <span className="inline-block px-2 py-1 text-xs bg-gradient-primary text-white rounded-full font-medium w-fit mb-1">{book.genre}</span>
                        {isLoggedIn && (
                          borrowed ? (
                            <button
                              className="w-full btn-success py-2 rounded-xl font-semibold shadow-glow cursor-not-allowed opacity-70 mt-2"
                              disabled
                              onClick={e => e.stopPropagation()}
                            >
                              Borrowed
                            </button>
                          ) : (
                            <button
                              className="w-full btn-primary py-2 rounded-xl font-semibold shadow-glow hover-lift transition-all duration-200 mt-2"
                              onClick={e => { e.stopPropagation(); handleBorrowGoogleBook(book); }}
                              disabled={borrowingGoogle[book.id]}
                            >
                              {borrowingGoogle[book.id] ? 'Borrowing...' : 'Borrow'}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Book Grid (locked columns, no layout shift, with loading skeleton) */}
          <div className="w-full px-2 sm:px-4 lg:px-8 min-h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {pagedBooks.map(book => (
                  book.source === 'google' ? (
                    <div
                      key={book.id}
                      className="glass rounded-2xl shadow-card p-4 flex flex-col items-center hover:scale-105 hover:shadow-glow transition-all duration-300 cursor-pointer animate-pop min-h-[400px] max-h-[440px] border-2 border-accent-teal"
                      onClick={() => handleOpenGoogleBook(book)}
                      style={{ minHeight: '400px', maxHeight: '440px', margin: '0 auto' }}
                    >
                      <div className="w-full aspect-[3/4] max-h-60 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center mb-2">
                        {book.image ? (
                          <img src={book.image} alt={book.title} className="w-full h-full object-cover" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        ) : (
                          <span className="text-gray-400 text-lg">No Cover</span>
                        )}
                      </div>
                      <div className="flex-1 w-full flex flex-col justify-between">
                        <h3 className="font-bold text-base text-gray-800 dark:text-white mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 line-clamp-1">by {book.author}</p>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={'text-gray-300 dark:text-gray-600'}>★</span>
                          ))}
                        </div>
                        <span className="inline-block px-2 py-1 text-xs bg-gradient-secondary text-white rounded-full font-medium w-fit mb-1">{book.genre}</span>
                        <span className="inline-block px-2 py-1 text-xs bg-accent-teal text-white rounded-full font-medium w-fit mb-1">Google</span>
                        {isLoggedIn && (
                          isGoogleBookBorrowed(book) ? (
                            <button
                              className="w-full btn-success py-2 rounded-xl font-semibold shadow-glow cursor-not-allowed opacity-70 mt-2"
                              disabled
                              onClick={e => e.stopPropagation()}
                            >
                              Borrowed
                            </button>
                          ) : (
                            <button
                              className="w-full btn-primary py-2 rounded-xl font-semibold shadow-glow hover-lift transition-all duration-200 mt-2"
                              onClick={e => { e.stopPropagation(); handleBorrowGoogleBook(book); }}
                              disabled={borrowingGoogle[book.id]}
                            >
                              {borrowingGoogle[book.id] ? 'Borrowing...' : 'Borrow'}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={book.id}
                      className="glass rounded-2xl shadow-card p-4 flex flex-col items-center hover:scale-105 hover:shadow-glow transition-all duration-300 cursor-pointer animate-pop min-h-[400px] max-h-[440px]"
                      onClick={() => navigate(`/book/${book.id}`)}
                      style={{ minHeight: '400px', maxHeight: '440px', margin: '0 auto' }}
                    >
                      <div className="w-full aspect-[3/4] max-h-60 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center mb-2">
                        {book.image ? (
                          <img src={book.image} alt={book.title} className="w-full h-full object-cover" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        ) : (
                          <span className="text-gray-400 text-lg">No Cover</span>
                        )}
                      </div>
                      <div className="flex-1 w-full flex flex-col justify-between">
                        <h3 className="font-bold text-base text-gray-800 dark:text-white mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-xs mb-1 line-clamp-1">by {book.author}</p>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < (book.rating || 0) ? 'text-accent-gold' : 'text-gray-300 dark:text-gray-600'}>★</span>
                          ))}
                        </div>
                        <span className="inline-block px-2 py-1 text-xs bg-gradient-primary text-white rounded-full font-medium w-fit mb-1">{book.genre}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
            {/* Pagination controls */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-card hover:bg-accent-teal transition-colors disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="px-4 py-2 font-bold text-primary-dark">Page {currentPage} of {totalPages}</span>
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-white font-semibold shadow-card hover:bg-accent-teal transition-colors disabled:opacity-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home; 