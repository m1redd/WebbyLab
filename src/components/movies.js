import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMovies,
  fetchMovieDetails,
  deleteMovie,
  addMovie,
  setSearch,
  setNewMovie,
  resetNewMovie,
  clearSelectedMovie,
} from "../features/movies/moviesSlice";

const MOVIE_FORMATS = ['VHS', 'DVD', 'Blu-Ray'];
const MOVIES_PER_PAGE = 10;

const Movies = () => {
  const dispatch = useDispatch();
  const {
    list: movies = [],
    selectedMovie,
    search,
    newMovie,
    status,
    error,
  } = useSelector((state) => state.movies);

  const [visibleMovies, setVisibleMovies] = useState(MOVIES_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const filteredMovies = movies.filter(movie => {
    if (!movie) return false;
    
    const searchTerm = search.toLowerCase();
    const titleMatch = movie.title?.toLowerCase().includes(searchTerm) ?? false;
    
    const actorsMatch = Array.isArray(movie.actors) && 
      movie.actors.some(actor => 
        actor?.name?.toLowerCase().includes(searchTerm)
      );
    
    return titleMatch || actorsMatch;
  });

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop !== 
      document.documentElement.offsetHeight ||
      isLoadingMore ||
      visibleMovies >= filteredMovies.length
    ) {
      return;
    }
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleMovies(prev => prev + MOVIES_PER_PAGE);
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, visibleMovies, filteredMovies.length]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    dispatch(setSearch(e.target.value));
    setVisibleMovies(MOVIES_PER_PAGE);
  };

  const handleNewMovieChange = (e) => {
    dispatch(setNewMovie({ [e.target.name]: e.target.value }));
  };

  const handleAddMovie = () => {
    if (!MOVIE_FORMATS.includes(newMovie.format)) {
      alert(`Please select a valid format: ${MOVIE_FORMATS.join(', ')}`);
      return;
    }
    
    dispatch(addMovie(newMovie)).then(() => {
      dispatch(resetNewMovie());
    });
  };

  const handleDeleteMovie = (id) => {
    dispatch(deleteMovie(id));
  };

  const handleShowDetails = (id) => {
    dispatch(fetchMovieDetails(id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Movie Manager</h1>
      <h2>Add Movie</h2>
      <input
        name="title"
        placeholder="Title"
        type="text"
        value={newMovie.title}
        onChange={handleNewMovieChange}
      />
      <br />
      <input
        name="year"
        placeholder="Year"
        type="number"
        value={newMovie.year}
        onChange={handleNewMovieChange}
      />
      <br />
      <select
        name="format"
        value={newMovie.format}
        onChange={handleNewMovieChange}
        style={{ padding: '5px', margin: '5px 0' }}
      >
        <option value="">Select format...</option>
        {MOVIE_FORMATS.map(format => (
          <option key={format} value={format}>{format}</option>
        ))}
      </select>
      <br />
      <input
        name="actors"
        placeholder="Actors (comma separated)"
        type="text"
        value={newMovie.actors}
        onChange={handleNewMovieChange}
      />
      <br />
      <button onClick={handleAddMovie} disabled={status === "loading"}>
        {status === "loading" ? "Adding..." : "Add Movie"}
      </button>

      <hr />
      <h2>Search</h2>
      <input
        placeholder="You can search, go on :)"
        value={search}
        type="text"
        onChange={handleSearchChange}
      />
      <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
        You can search by movie title or actor name
      </p>
      
      <h2>Movie List</h2>
      {status === "loading" && <p>Loading initial movies...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      
      <ul>
        {filteredMovies.slice(0, visibleMovies).map((movie) => (
          <li key={movie.id} style={{ marginBottom: '15px' }}>
            {movie.id} <strong>{movie.title}</strong> ({movie.year}) - {movie.format}
            <br />
            <button onClick={() => handleShowDetails(movie.id)}>
              Show Details
            </button>
            <button 
              onClick={() => handleDeleteMovie(movie.id)}
              style={{ marginLeft: '5px' }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {visibleMovies < filteredMovies.length && (
        <button 
          onClick={() => setVisibleMovies(prev => prev + MOVIES_PER_PAGE)}
          disabled={isLoadingMore}
          style={{ marginTop: '10px' }}
        >
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}

      {filteredMovies.length === 0 && !status === "loading" && (
        <p>No movies found matching your search.</p>
      )}

      {selectedMovie && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
          <h2>Movie Details</h2>
          <p>
            <strong>Title:</strong> {selectedMovie.title}
          </p>
          <p>
            <strong>Year:</strong> {selectedMovie.year}
          </p>
          <p>
            <strong>Format:</strong> {selectedMovie.format}
          </p>
          <p>
            <strong>Actors:</strong>
          </p>
          <ul>
            {selectedMovie.actors?.map((actor) => (
              <li key={actor.id}>{actor.name}</li>
            ))}
          </ul>
          <button onClick={() => dispatch(clearSelectedMovie())}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Movies;