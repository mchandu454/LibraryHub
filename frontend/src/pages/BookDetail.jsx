import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowLoading, setBorrowLoading] = useState(false);
  // TODO: Replace with real user auth state
  const isLoggedIn = true;

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/books/${id}`);
        setBook(res.data.book);
        // Check if book is in favourites
        const favs = JSON.parse(localStorage.getItem('favourites') || '[]');
        setIsFavourite(favs.includes(Number(id)));
      } catch (err) {
        setError('Failed to load book details.');
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
        setRelatedBooks([]);
      }
    };
    fetchRelated();
  }, [book, id]);

  const handleAddFavourite = () => {
    const favs = JSON.parse(localStorage.getItem('favourites') || '[]');
    if (!favs.includes(Number(id))) {
      favs.push(Number(id));
      localStorage.setItem('favourites', JSON.stringify(favs));
      setIsFavourite(true);
    }
  };

  const handleRemoveFavourite = () => {
    let favs = JSON.parse(localStorage.getItem('favourites') || '[]');
    favs = favs.filter(favId => favId !== Number(id));
    localStorage.setItem('favourites', JSON.stringify(favs));
    setIsFavourite(false);
  };

  const handleBorrow = async () => {
    setBorrowLoading(true);
    try {
      await axios.post('/api/borrow', { bookId: Number(id) }, { withCredentials: true });
      toast.success('Book borrowed successfully!');
      // Optionally, refresh book details to update availability
      const res = await axios.get(`/api/books/${id}`);
      setBook(res.data.book);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to borrow book. Please try again.'
      );
    } finally {
      setBorrowLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!book) return <div className="text-center py-10">Book not found.</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Book Cover */}
        <div className="flex-shrink-0 w-full md:w-1/3 flex justify-center">
          <div className="w-48 h-64 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center overflow-hidden">
            {book.image ? (
              <img src={book.image} alt={book.title} className="w-full h-full object-cover rounded" />
            ) : (
              <span className="text-gray-400">No Cover</span>
            )}
          </div>
        </div>
        {/* Book Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">by {book.author}</p>
          <p className="mb-2"><span className="font-semibold">Genre:</span> {book.genre}</p>
          <div className="mb-2 text-yellow-500">★ {book.rating || '-'}</div>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{book.description}</p>
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${book.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {book.available ? 'Available' : 'Not Available'}
            </span>
          </div>
          <div className="flex gap-4 mb-4">
            {isLoggedIn && book.available && (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                onClick={handleBorrow}
                disabled={borrowLoading}
              >
                {borrowLoading ? 'Borrowing...' : 'Borrow'}
              </button>
            )}
            {isFavourite ? (
              <button
                className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
                onClick={handleRemoveFavourite}
              >
                Remove from Favourites
              </button>
            ) : (
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                onClick={handleAddFavourite}
              >
                Add to Favourites
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Related Books */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Related Books</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedBooks.map(rb => (
            <div key={rb.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
              <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center overflow-hidden">
                {rb.image ? (
                  <img src={rb.image} alt={rb.title} className="w-full h-full object-cover rounded" />
                ) : (
                  <span className="text-gray-400">No Cover</span>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-md">{rb.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{rb.author}</p>
                <div className="mt-1 text-yellow-500">★ {rb.rating || '-'}</div>
              </div>
            </div>
          ))}
          {relatedBooks.length === 0 && (
            <div className="col-span-full text-center text-gray-500">No related books found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookDetail; 