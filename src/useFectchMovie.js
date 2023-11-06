import { useEffect, useState } from "react";

const KEY = "46ca4c39";
export function useFectchMovie(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController(); // use CONTROLLER ABORT to cancel all the HTTP request unnescessary(stop current request before next new request is started)

      const fectMovies = async function () {
        try {
          setIsLoading(true); // staring fectching data and display Loading
          setError("");
          const response = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal });
          if (!response.ok) {
            throw new Error("Some thing wrong with fectch movies..");
          }
          const data = await response.json();

          // display new error if not found movies with query valid
          if (data.Response === "False") throw new Error(`${data.Error} with ${query}`);

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message); // ignore error from Abort dont show on UI( this error happen when the HTTP REQUETS is canceled by using cotroller abort)
            console.error(err.message);
          }
        } finally {
          setIsLoading(false); // awlays reset state when fectching data sucess or reject
        }
      };

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      //handleCloseMovie(); // close selected detail movie before feching data
      fectMovies();
      return () => controller.abort(); // cancel these the HTTP request unnescessary
    },
    [query]
  );

  return { movies, isLoading, error };
}
