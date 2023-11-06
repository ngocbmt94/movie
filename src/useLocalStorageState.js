import { useEffect, useState } from "react";

export function useLocalStorageState(initalValue, keyName) {
  const [value, setValue] = useState(function () {
    const getStorage = localStorage.getItem(`${keyName}`);
    return getStorage ? JSON.parse(getStorage) : initalValue;
  });

  useEffect(() => {
    localStorage.setItem(`${keyName}`, JSON.stringify(value));
  }, [value, keyName]);

  return [value, setValue];
}
