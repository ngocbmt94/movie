import { useEffect, useRef, useState } from "react";
import StarsRating from "./StarsRating";
import { useFectchMovie } from "./useFectchMovie";
import { useKeyEvent } from "./useKeyEvent";
import { useLocalStorageState } from "./useLocalStorageState";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + Number(cur) / arr.length, 0).toFixed(2);
const KEY = "46ca4c39";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const { movies, isLoading, error } = useFectchMovie(query);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  useEffect(
    function () {
      handleCloseMovie();
    },
    [query]
  );

  useKeyEvent("keydown", "escape", handleCloseMovie);

  function handleSelectedID(id) {
    setSelectedID((selectedID) => (id === selectedID ? null : id));
  }

  function handleCloseMovie() {
    setSelectedID(null);
  }

  function handleAddMovie(newMovie) {
    if (watched.every((el) => el.imdbID !== newMovie.imdbID)) {
      setWatched((watched) => [...watched, newMovie]);
    } else {
      setWatched((watched) => watched.map((el) => (el.imdbID === newMovie.imdbID && el.userRating !== newMovie.userRating ? { ...el, userRating: newMovie.userRating } : el)));
    }

    handleCloseMovie(); // to back list watched
  }

  function handleDeletMovie(id) {
    setWatched((watched) => watched.filter((el) => el.imdbID !== id));
  }

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} onSetQuery={setQuery} />
        <NumbeResult movies={movies} />
      </Navbar>

      <main className="main">
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorBlock error={error} />}
          {!error && !isLoading && <ListMovies movies={movies} onSetSelectedID={handleSelectedID} />}
        </Box>

        <Box>
          {selectedID ? (
            <SelectedMovieDetail selectedID={selectedID} onCloseMovie={handleCloseMovie} onAddMovie={handleAddMovie} watched={watched} />
          ) : (
            <>
              <SummaryWatched watched={watched} />
              <ListWatched watched={watched} onDeleteMovie={handleDeletMovie} />
            </>
          )}
        </Box>
      </main>
    </>
  );
}

function ErrorBlock({ error }) {
  return <p className="error">{error}</p>;
}
function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, onSetQuery }) {
  const inputEl = useRef(null);

  function enterToFocus() {
    if (document.activeElement === inputEl.current) return;

    onSetQuery("");
    inputEl.current.focus();
  }
  useKeyEvent("keydown", "enter", enterToFocus);

  return <input className="search" type="text" placeholder="Search movies..." value={query} onChange={(e) => onSetQuery(e.target.value)} ref={inputEl} />;
}

function NumbeResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length}</strong> results
    </p>
  );
}

function Button({ isOpenBtn, onIsOpenBtn }) {
  return (
    <button className="btn-toggle" onClick={() => onIsOpenBtn((open) => !open)}>
      {isOpenBtn ? "–" : "+"}
    </button>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}
function ListMovies({ movies, onSetSelectedID }) {
  return (
    <ul className="list list-movies">
      {movies.map((movie) => (
        <ItemMovie key={movie.imdbID} movie={movie} onSetSelectedID={onSetSelectedID} />
      ))}
    </ul>
  );
}
function ItemMovie({ movie, onSetSelectedID }) {
  return (
    <li onClick={() => onSetSelectedID(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>

      <p>🗓 {movie.Year}</p>
    </li>
  );
}

function ListWatched({ watched, onDeleteMovie }) {
  return (
    <ul className="list list-watched">
      {watched.map((movie) => (
        <ItemWatched key={movie.title} movie={movie} onDeleteMovie={onDeleteMovie} />
      ))}
    </ul>
  );
}
function ItemWatched({ movie, onDeleteMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <button className="btn-delete" onClick={() => onDeleteMovie(movie.imdbID)}>
        x
      </button>
      <p>
        <span>🗓 {movie.year}</span>
        <span>⭐️{movie.imdbRating}</span>
        <span>🌟{movie.userRating}</span>
        <span>⏳{movie.runtime} min</span>
      </p>
    </li>
  );
}

function SummaryWatched({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));

  const avgUserRating = average(watched.map((movie) => movie.userRating));

  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <span>#️⃣ {watched.length} movies</span>
        <span>⭐️{avgImdbRating}</span>
        <span>🌟{avgUserRating}</span>
        <span>⏳{avgRuntime} min</span>
      </div>
    </div>
  );
}

function Box({ children }) {
  const [isOpenBtn, setIsOpenBtn] = useState(true);
  return (
    <div className="box">
      <Button isOpenBtn={isOpenBtn} onIsOpenBtn={setIsOpenBtn} />
      {isOpenBtn && children}
    </div>
  );
}

function SelectedMovieDetail({ selectedID, onCloseMovie, onAddMovie, watched }) {
  const [detailMovieSelected, setDetailMovieSelected] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const { Title: title, Year: year, Poster: poster, Runtime: runtime, imdbRating, Plot: plot, Released: released, Actors: actors, Director: director, Genre: genre } = detailMovieSelected;

  const isIncludeWatchedList = watched.some((el) => el.imdbID === selectedID);
  const infoWatchedMovie = {
    title,
    year,
    poster,
    imdbRating,
    runtime: parseInt(runtime),
    imdbID: selectedID,
    userRating,
  };

  useEffect(() => {
    setUserRating(watched.find((el) => el.imdbID === selectedID)?.userRating); // set userRating based on property userRating of ID in watched list
  }, [selectedID, watched]);

  useEffect(
    function () {
      const fectchDetailMovie = async function () {
        try {
          setIsLoading(true);
          const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`);

          if (!res.ok) {
            throw new Error("Some thing wrong with fectch movie detail..");
          }
          const data = await res.json();

          // display new error if not found movies with selectedID
          if (data.Response === "False") throw new Error(`${data.Error} with ${selectedID}`);

          setDetailMovieSelected(data);
          setError("");
        } catch (err) {
          console.error(err.message);

          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fectchDetailMovie();
    },
    [selectedID]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "usePopcorn";
        //console.log(`clean up ${title}`);
      };
    },
    [title]
  );

  return (
    <>
      {!isLoading && !error && (
        <div className="details">
          <div className="header">
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${detailMovieSelected}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </div>
          <section>
            <div className="rating">
              <StarsRating maxRating={10} sizeStar={24} onSetExternalRating={setUserRating} defaulRating={userRating} />
              {userRating > 0 && (
                <button className="btn-add" onClick={() => onAddMovie(infoWatchedMovie)}>
                  {isIncludeWatchedList ? "+ Add new rating to your list" : "+ Add to list"}
                </button>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </div>
      )}
      {isLoading && <Loader />}
      {error && <ErrorBlock error={error} />}
    </>
  );
}
