import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
  fetchMoviesByActor,
} from "../features/movies/moviesSlice";
import DeleteConfirmation from "../utils/confirmDelete";

const MOVIE_FORMATS = ["VHS", "DVD", "Blu-Ray"];

const Movies = () => {
  const dispatch = useDispatch();
  const {
    list: movies = [],
    actorSearchResults = [],
    selectedMovie,
    search,
    newMovie,
    status,
    error,
  } = useSelector((state) => state.movies);

  const [movieToDelete, setMovieToDelete] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const containerRef = useRef(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMovieId, setExpandedMovieId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    year: "",
    actors: "",
    format: "",
    duplicate: "",
  });

  const moviesPerPage = 5;

  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;

  const handleDeleteClick = (id) => {
    setMovieToDelete(id);
  };

  const handleCancelDelete = () => {
    setMovieToDelete(null);
  };

  const validateTitle = (title) => {
    return (
      /^[a-zA-Z0-9]+(?: [a-zA-Z0-9]+)*$/.test(title) && title.trim().length > 0
    );
  };
  const validateYear = (year) => {
    const yearNum = parseInt(year, 10);
    return /^\d+$/.test(year) && yearNum >= 1900 && yearNum <= 2025;
  };
  const validateActors = (actors) => {
    return /^[a-zA-Z\s,.&-]+$/.test(actors) && actors.trim().length > 0;
  };
  const checkDuplicateTitle = (title) =>
    movies.some((movie) => movie.title.toLowerCase() === title.toLowerCase());

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredMovies.length / moviesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // const filteredMovies = useMemo(() => {
  //   if (!search.trim()) return movies;

  //   const searchTerm = search.toLowerCase();
  //   const filteredByTitle = movies.filter(movie =>
  //     movie?.title?.toLowerCase().includes(searchTerm)
  //   );

  //   return [...filteredByTitle, ...actorSearchResults];
  // }, [movies, actorSearchResults, search]);

  const filteredMovies = useMemo(() => {
    if (!search.trim()) return movies;

    const searchTerm = search.toLowerCase();
    const filteredByTitle = movies.filter((movie) =>
      movie?.title?.toLowerCase().includes(searchTerm)
    );
    const uniqueApiResults = actorSearchResults.filter(
      (apiMovie) => !filteredByTitle.some((m) => m.id === apiMovie.id)
    );
    return [...filteredByTitle, ...uniqueApiResults];
  }, [movies, actorSearchResults, search]);

  const currentMovies = useMemo(() => {
    return filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  }, [filteredMovies, indexOfFirstMovie, indexOfLastMovie]);

  useEffect(() => {
    const loadData = async () => {
      await dispatch(fetchMovies());
      setIsInitialLoad(false);
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.opacity = "1";
          containerRef.current.style.transition = "opacity 300ms ease-out";
        }
      }, 50);
    };

    if (isInitialLoad) {
      if (containerRef.current) {
        containerRef.current.style.opacity = "0.5";
      }
      loadData();
    }
  }, [dispatch, isInitialLoad]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    dispatch(setSearch(value));
    if (searchTimeout) clearTimeout(searchTimeout);

    setSearchTimeout(
      setTimeout(() => {
        if (value.trim() !== "") {
          dispatch(fetchMoviesByActor(value));
        } else {
          dispatch(fetchMovies());
        }
      }, 250)
    );
  };

  const handleNewMovieChange = (e) => {
    const { name, value } = e.target;
    setValidationErrors({
      ...validationErrors,
      [name]: "",
      duplicate: name === "title" ? "" : validationErrors.duplicate,
    });
    if (value !== "") {
      if (name === "title") {
        if (!validateTitle(value)) {
          setValidationErrors((prev) => ({
            ...prev,
            title: "Only letters and numbers allowed",
          }));
        } else if (checkDuplicateTitle(value)) {
          setValidationErrors((prev) => ({
            ...prev,
            duplicate: "Movie with this title already exists",
          }));
        }
      } else if (name === "year" && !validateYear(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          year: "Year must be between 1900 and 2021",
        }));
      } else if (name === "actors" && !validateActors(value)) {
        setValidationErrors((prev) => ({
          ...prev,
          actors: "Only letters and commas allowed",
        }));
      }
    }

    dispatch(setNewMovie({ [name]: value }));
  };

  const handleAddMovie = () => {
    const errors = {
      title:
        newMovie.title === ""
          ? "Title is required"
          : !validateTitle(newMovie.title)
          ? "Only letters and numbers allowed"
          : checkDuplicateTitle(newMovie.title)
          ? "Movie with this title already exists"
          : "",
      year:
        newMovie.year === ""
          ? "Year is required"
          : !validateYear(newMovie.year)
          ? "Only numbers allowed"
          : "",
      actors:
        newMovie.actors === ""
          ? "Actors are required"
          : !validateActors(newMovie.actors)
          ? "Only letters and commas allowed"
          : "",
      format: newMovie.format === "" ? "Please select a format" : "",
    };

    setValidationErrors(errors);

    if (Object.values(errors).some((error) => error !== "")) {
      return;
    }

    dispatch(addMovie(newMovie)).then(() => {
      dispatch(resetNewMovie());
      setValidationErrors({
        title: "",
        year: "",
        actors: "",
        format: "",
        duplicate: "",
      });
    });
  };

  const handleShowDetails = (id) => {
    if (expandedMovieId === id) {
      setExpandedMovieId(null);
    } else {
      dispatch(fetchMovieDetails(id));
      setExpandedMovieId(id);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        opacity: isInitialLoad ? 0.5 : 1,
        transition: "opacity 300ms ease-out",
        padding: 20,
      }}
    >
      <h1>Movie Manager</h1>
      <h2>Add Movie</h2>
      <div>
        <input
          name="title"
          placeholder="Title"
          type="text"
          value={newMovie.title}
          onChange={handleNewMovieChange}
        />
        {validationErrors.title && (
          <p style={{ color: "red", margin: "5px 0 0 0", fontSize: "0.8em" }}>
            {validationErrors.title}
          </p>
        )}
        {validationErrors.duplicate && !validationErrors.title && (
          <p style={{ color: "red", margin: "5px 0 0 0", fontSize: "0.8em" }}>
            {validationErrors.duplicate}
          </p>
        )}
      </div>
      <br />
      <div>
        <input
          name="year"
          placeholder="Year"
          type="number"
          value={newMovie.year}
          onChange={handleNewMovieChange}
        />
        {validationErrors.year && (
          <p style={{ color: "red", margin: "5px 0 0 0", fontSize: "0.8em" }}>
            {validationErrors.year}
          </p>
        )}
      </div>
      <br />
      <div>
        <select
          name="format"
          value={newMovie.format}
          onChange={handleNewMovieChange}
          style={{ padding: "5px", margin: "5px 0" }}
        >
          <option value="">Select format...</option>
          {MOVIE_FORMATS.map((format) => (
            <option key={format} value={format}>
              {format}
            </option>
          ))}
        </select>
        {validationErrors.format && (
          <p style={{ color: "red", margin: "5px 0 0 0", fontSize: "0.8em" }}>
            {validationErrors.format}
          </p>
        )}
      </div>
      <br />
      <div>
        <input
          name="actors"
          placeholder="Actors (comma separated)"
          type="text"
          value={newMovie.actors}
          onChange={handleNewMovieChange}
        />
        {validationErrors.actors && (
          <p style={{ color: "red", margin: "5px 0 0 0", fontSize: "0.8em" }}>
            {validationErrors.actors}
          </p>
        )}
      </div>
      <br />
      <button onClick={handleAddMovie} disabled={status === "loading"}>
        Add Movie
      </button>
      <hr />
      <h2>Search</h2>
      <input
        placeholder="You can search, go on :)"
        value={search}
        type="text"
        onChange={handleSearchChange}
      />
      <p style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
        You can search by movie title or actor name
      </p>

      <h2>Movie List</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div className="movie-list-container">
        {filteredMovies.length === 0 && search.trim() !== "" ? (
          <div className="no-results-message">
            Oops, no movies found with that title
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {currentMovies.map((movie) => (
              <li
                key={`${movie.id}-${
                  actorSearchResults.some((m) => m.id === movie.id)
                    ? "api"
                    : "local"
                }`}
                style={{
                  marginBottom: "15px",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "12px",
                  backgroundColor: "#1e1e1e",
                  display: "flex",
                  flexDirection: "row",
                  gap: "20px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#bb86fc" }}>
                        {movie.title}
                      </strong>
                      <span style={{ marginLeft: "8px", color: "#9e9e9e" }}>
                        ({movie.year})
                      </span>
                      <span style={{ marginLeft: "8px", color: "#9e9e9e" }}>
                        {movie.format}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#9e9e9e",
                      fontSize: "0.8rem",
                      marginTop: "4px",
                    }}
                  >
                    ID: {movie.id}
                  </div>
                </div>
                {expandedMovieId === movie.id && selectedMovie && (
                  <div
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderLeft: "1px solid #333",
                      color: "#e0e0e0",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                    }}
                  >
                    <div
                      style={{
                        color: "#bb86fc",
                        fontSize: "1rem",
                        fontWeight: "600",
                        marginBottom: "8px",
                        paddingBottom: "4px",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      Movie Details
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "80px 1fr",
                        gap: "8px 4px",
                      }}
                    >
                      <span style={{ color: "#9e9e9e" }}>Title:</span>
                      <span>{selectedMovie.title}</span>

                      <span style={{ color: "#9e9e9e" }}>Year:</span>
                      <span>{selectedMovie.year}</span>

                      <span style={{ color: "#9e9e9e" }}>Format:</span>
                      <span>{selectedMovie.format}</span>

                      <span style={{ color: "#9e9e9e", alignSelf: "start" }}>
                        Actors:
                      </span>
                      <ul
                        style={{
                          margin: 0,
                          listStyleType: "none",
                        }}
                      >
                        {selectedMovie.actors?.map((actor) => (
                          <li
                            key={actor.id}
                            style={{
                              position: "relative",
                              paddingLeft: "12px",
                              fontSize: "0.85rem",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                left: 0,
                                color: "#bb86fc",
                              }}
                            >
                              •
                            </span>
                            {actor.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                <div>
                  <button
                    onClick={() => handleShowDetails(movie.id)}
                    style={{
                      marginRight: "5px",
                      padding: "6px 12px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {expandedMovieId === movie.id ? "Hide" : "Show"}
                  </button>
                  <button
                    onClick={() => handleDeleteClick(movie.id)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.9rem",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          style={{ marginRight: "10px" }}
        >
          Previous
        </button>

        {Array.from({
          length: Math.ceil(filteredMovies.length / moviesPerPage),
        }).map((_, index) => (
          <button key={index} onClick={() => paginate(index + 1)}>
            {index + 1}
          </button>
        ))}

        <button
          onClick={nextPage}
          disabled={
            currentPage === Math.ceil(filteredMovies.length / moviesPerPage)
          }
        >
          Next
        </button>
      </div>
      {movieToDelete && (
        <DeleteConfirmation
          movieId={movieToDelete}
          onClose={handleCancelDelete}
        />
      )}
      {filteredMovies.length === 0 && !status === "loading" && (
        <p>No movies found matching your search.</p>
      )}

      <div
        style={{
          position: "fixed",
          left: "13px",
          bottom: "13px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "4px",
          fontSize: "0.8em",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span>You can drag and drop .txt file anywhere</span>
        <span
          style={{
            marginLeft: "8px",
            backgroundColor: "#4CAF50",
            borderRadius: "3px",
            padding: "2px 6px",
            fontSize: "0.7em",
          }}
        >
          New
        </span>
      </div>
    </div>
  );
};

export default Movies;
