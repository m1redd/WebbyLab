import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = process.env.REACT_APP_API_MOVIES;

const getAuthHeader = () => ({
  headers: {
    Authorization: localStorage.getItem("token"),
  },
});

export const fetchMovies = createAsyncThunk("movies/fetchMovies", async () => {
  const response = await axios.get(
    `${API}?sort=title&order=ASC&limit=1000&offset=0`,
    getAuthHeader()
  );
  return response.data?.data || [];
});

export const fetchMovieDetails = createAsyncThunk(
  "movies/fetchMovieDetails",
  async (id) => {
    const response = await axios.get(`${API}/${id}`, getAuthHeader());
    return response.data.data;
  }
);

export const deleteMovie = createAsyncThunk(
  "movies/deleteMovie",
  async (id, { dispatch }) => {
    await axios.delete(`${API}/${id}`, getAuthHeader());
    dispatch(fetchMovies());
    return id;
  }
);

export const addMovie = createAsyncThunk(
  "movies/addMovie",
  async (movieData, { dispatch }) => {
    const actorList = movieData.actors
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const formattedData = {
      title: movieData.title.trim(),
      year: parseInt(movieData.year),
      format: movieData.format.trim(),
      actors: actorList,
    };

    await axios.post(API, formattedData, getAuthHeader());
    dispatch(fetchMovies());
    return formattedData;
  }
);

const moviesSlice = createSlice({
  name: "movies",
  initialState: {
    list: [],
    selectedMovie: null,
    search: "",
    newMovie: {
      title: "",
      year: "",
      format: "",
      actors: "",
    },
    status: "idle",
    error: null,
  },
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    },
    setNewMovie: (state, action) => {
      state.newMovie = { ...state.newMovie, ...action.payload };
    },
    resetNewMovie: (state) => {
      state.newMovie = {
        title: "",
        year: "",
        format: "",
        actors: "",
      };
    },
    clearSelectedMovie: (state) => {
      state.selectedMovie = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.list = [];
      })
      .addCase(fetchMovieDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedMovie = action.payload;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setSearch, setNewMovie, resetNewMovie, clearSelectedMovie } =
  moviesSlice.actions;

export default moviesSlice.reducer;
