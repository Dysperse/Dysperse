import { useEffect } from "react";
import { Workbox } from "workbox-window";

export function WorkboxInitializer() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const wb = new Workbox("/sw.js");
      wb.register();

      window.workbox = wb;
    }
  }, []);

  return null;
}
