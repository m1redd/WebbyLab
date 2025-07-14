import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchMovies } from "../features/movies/moviesSlice";

const API = process.env.REACT_APP_API_MOVIES;

const getAuthHeader = () => ({
  headers: {
    Authorization: localStorage.getItem("token"),
  },
});

const parseMovies = (text) => {
  text = text.replace(/^\uFEFF/, "").trim();
  const blocks = text.split(/\n\s*\n+/);
  const movies = [];

  for (const block of blocks) {
    const lines = block
      .trim()
      .split("\n")
      .map((line) => line.trim());
    const titleLine = lines.find((l) => l.startsWith("Title:"));
    const yearLine = lines.find((l) => l.startsWith("Release Year:"));
    const formatLine = lines.find((l) => l.startsWith("Format:"));
    const starsLine = lines.find((l) => l.startsWith("Stars:"));

    if (!titleLine || !yearLine || !formatLine || !starsLine) continue;

    const title = titleLine.replace("Title:", "").trim();
    const year = parseInt(yearLine.replace("Release Year:", "").trim());
    const format = formatLine.replace("Format:", "").trim();
    const actors = starsLine
      .replace("Stars:", "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    if (title && !isNaN(year) && format && actors.length > 0) {
      movies.push({ title, year, format, actors });
    }
  }

  return movies;
};

const FileDropzone = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleDrop = async (e) => {
      e.preventDefault();

      const file = e.dataTransfer.files[0];
      if (!file || !file.name.endsWith(".txt")) return;

      const text = await file.text();
      const movies = parseMovies(text);

      console.log(`Parsed ${movies.length} movies from file.`);

      if (movies.length === 0) {
        alert("No valid movies found in file.");
        return;
      }

      try {
        await Promise.all(
          movies.map(async (movie) => {
            await axios.post(API, movie, getAuthHeader());
            console.log(`Added: ${movie.title}`);
          })
        );
        dispatch(fetchMovies());
      } catch (err) {
        console.error("Error adding movies:", err);
        alert("Failed to add movies.");
      }
    };

    const handleDragOver = (e) => e.preventDefault();

    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragover", handleDragOver);

    return () => {
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragover", handleDragOver);
    };
  }, [dispatch]);

  return null;
};

export default FileDropzone;
