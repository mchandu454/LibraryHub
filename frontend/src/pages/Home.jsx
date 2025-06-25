import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [genres, setGenres] = useState(['All']);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/books/trending');
        // trending is an array of { bookId, borrowCount, Book: { ... } }
        const trendingBooks = res.data.trending.map(item => item.Book);
        setBooks(trendingBooks);
        // Extract genres from trending books
        const genreSet = new Set(trendingBooks.map(b => b.genre).filter(Boolean));
        setGenres(['All', ...Array.from(genreSet)]);
      } catch (err) {
        setError('Failed to load trending books.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Filter books by genre and search
  const filteredBooks = books.filter(book =>
    (selectedGenre === 'All' || book.genre === selectedGenre) &&
    (book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Genre Filter Sidebar */}
        <aside className="w-full md:w-1/4 mb-4 md:mb-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Genres</h2>
            <ul className="space-y-2">
              {genres.map(genre => (
                <li key={genre}>
                  <button
                    className={`w-full text-left px-2 py-1 rounded ${selectedGenre === genre ? 'bg-blue-500 text-white' : 'hover:bg-blue-100 dark:hover:bg-gray-700'}`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by title or author..."
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Trending Books Grid */}
          <h2 className="text-xl font-bold mb-4">Trending Books</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map(book => (
                <div key={book.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
                  <div className="w-24 h-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
                    {book.image ? (
                      <img src={book.image} alt={book.title} className="w-full h-full object-cover rounded" />
                    ) : (
                      <span className="text-gray-400">No Cover</span>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{book.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{book.author}</p>
                    <div className="mt-2 text-yellow-500">★ {book.rating || '-'}</div>
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && !loading && (
                <div className="col-span-full text-center text-gray-500">No books found.</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home; 