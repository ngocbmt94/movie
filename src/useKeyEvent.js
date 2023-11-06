import { useEffect } from "react";

export function useKeyEvent(nameEvent, keyCode, action) {
  let key = keyCode[0].toUpperCase() + keyCode.slice(1).toLowerCase();

  useEffect(
    function () {
      const eventCallBack = function (e) {
        if (e.key === key) {
          action?.();
        }
      };

      document.addEventListener(nameEvent, eventCallBack);

      return () => document.removeEventListener(nameEvent, eventCallBack);
    },
    [nameEvent, key, action]
  );
}
