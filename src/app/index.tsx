import { useCallback, useEffect, useMemo, useState } from "react";
import isUrlSupported from "../utils/isUrlSupported";

function App() {
  const [url, setUrl] = useState<string>("");
  const isUrlValid = useMemo<boolean>(() => isUrlSupported(url), [url]);
  const [audioOnly, setAudioOnly] = useState<boolean>(true);
  const [cobaltEndpoint, setCobaltEndpoint] = useState<string>(
    "https://localhost:9000"
  );
  const ready = useMemo<boolean>(
    () => url.length > 0 && cobaltEndpoint.length > 0,
    [url, cobaltEndpoint]
  );

  useEffect(() => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (tab.url) {
        setUrl(tab.url);
      }
    });
    chrome.storage.local.get(["options"]).then((result) => {
      setAudioOnly(result.options.audioOnly ?? false);
      setCobaltEndpoint(result.options.cobaltEndpoint ?? "");
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ options: { cobaltEndpoint, audioOnly } });
  }, [cobaltEndpoint, audioOnly]);

  const handleSubmit = useCallback(async () => {
    try {
      if (!url) return;

      const payload = {
        url: encodeURIComponent(url),
        dubLang: false,
        isAudioOnly: audioOnly,
        isNoTTWatermark: true,
      };

      console.log(payload);

      const res = await fetch(`${cobaltEndpoint}/api/json`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      switch (data.status) {
        case "stream": {
          window.open(data.url, "_blank");
          break;
        }
        case "redirect": {
          window.open(data.url, "_blank");
          break;
        }
        case "picker": {
          alert("TODO: Implement Picker");
          break;
        }
        case "error": {
          throw Error(data.text, {
            cause: res,
          });
        }
        default: {
          throw Error("Error ???: Unexpected response from server", {
            cause: res,
          });
        }
      }
    } catch (error) {
      console.error(error as any);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error ???: Something went wrong...");
      }
    }
  }, [url, audioOnly, cobaltEndpoint]);

  return (
    <div className="w-[400px] m-3">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-lg font-black">Cobalt Portal</h1>
        <label className="label cursor-pointer">
          <span className="label-text mr-2">Audio Only?</span>
          <input
            type="checkbox"
            className="toggle"
            onChange={(e) => {
              setAudioOnly(!audioOnly);
            }}
            checked={audioOnly}
          />
        </label>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!ready) return;
          handleSubmit();
        }}
      >
        <input
          className="w-full mb-2 input input-sm input-bordered"
          type="text"
          name="url"
          id="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
          }}
          required
        />

        <button
          className="btn-block btn-sm btn mb-2"
          type="submit"
          disabled={!ready}
          title={!ready || isUrlValid ? "" : "This URL may not be supported!"}
        >
          download {!ready || isUrlValid ? <></> : <>⚠️</>}
        </button>

        <label className="flex items-center gap-4">
          <span
            className="label-text font-xs"
            title="Instance of Cobalt to connect to (i.e. https://co.arks.cafe)"
          >
            Cobalt URL
          </span>
          <input
            className="flex-auto input input-xs input-bordered"
            type="text"
            name="url"
            id="url"
            value={cobaltEndpoint}
            onChange={(e) => {
              setCobaltEndpoint(e.target.value);
            }}
            required
          />
        </label>
      </form>
    </div>
  );
}

export default App;
