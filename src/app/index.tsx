import { useCallback, useEffect, useState } from "react";

function App() {
  const [url, setUrl] = useState<string>("");
  const [audioOnly, setAudioOnly] = useState<boolean>(true);
  const [cobaltEndpoint, setCobaltEndpoint] = useState<string>(
    "http://localhost:9000/api/json"
  );

  useEffect(() => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (tab.url) {
        setUrl(tab.url);
      }
    });
  }, []);

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

      const res = await fetch(cobaltEndpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (res.status === 400) {
        throw Error("Error 400: Incorrect payload for request.", {
          cause: res,
        });
      }

      const data = await res.json();

      if (data.url) {
        window.open(data.url);
      } else {
        throw Error("Error ???: URL was not returned from server.");
      }
    } catch (error) {
      console.error(error as any);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error ???: Something went wrong...");
      }
    }
  }, [url, audioOnly]);

  return (
    <div className="w-[400px] m-2">
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

        <div className="form-control"></div>

        <button className="w-full bg-black text-white p-2" type="submit">
          🔗
        </button>
      </form>
    </div>
  );
}

export default App;
