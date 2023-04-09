import { useCallback, useEffect, useMemo, useState } from 'react';
import checkIsUrlSupported from '../lib/utils/checkIrUrlSupported';
import checkIsUrlRegex from '../lib/utils/checkIsUrlRegex';

function App() {
  const [url, setUrl] = useState<string>('');
  const [tabUrl, setTabUrl] = useState<string>('');

  const isUrlSupported = useMemo<boolean>(
    () => (url ? checkIsUrlSupported(url) : false),
    [url]
  );
  const isUrlSame = useMemo<boolean>(() => url === tabUrl, [url, tabUrl]);

  const [audioOnly, setAudioOnly] = useState<boolean>(true);

  const [cobaltEndpoint, setCobaltEndpoint] = useState<string>(
    'https://co.wukko.me'
  );

  const checkIfCorsIsEnabled = useCallback(async () => {
    try {
      const res = await fetch(cobaltEndpoint);
    } catch (error) {
      console.error(error);
      alert(
        'CORS is not enabled on the Cobalt instance you are trying to connect to.'
      );
    }
  }, [cobaltEndpoint]);

  const ready = useMemo<boolean>(
    () => url.length > 0 && checkIsUrlRegex(url) && cobaltEndpoint.length > 0,
    [url, cobaltEndpoint]
  );

  useEffect(() => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
      if (tab.url) {
        /** Save tab.url to state since it can't be accessed in future query calls for some reason .3. */
        setTabUrl(tab.url);
        setUrl(tab.url);
      }
    });
    chrome.storage.local.get(['options']).then((result) => {
      setAudioOnly(result.options.audioOnly ?? false);
      setCobaltEndpoint(result.options.cobaltEndpoint ?? '');
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
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      switch (data.status) {
        case 'stream': {
          window.open(data.url, '_blank');
          break;
        }
        case 'redirect': {
          window.open(data.url, '_blank');
          break;
        }
        case 'picker': {
          // TODO: Implement Picker
          alert('TODO: Implement Picker');
          break;
        }
        case 'error': {
          throw Error(data.text, {
            cause: res,
          });
        }
        default: {
          throw Error('Error ???: Unexpected response from server', {
            cause: res,
          });
        }
      }
    } catch (error) {
      console.error(error as any);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Error ???: Something went wrong...');
      }
    }
  }, [url, audioOnly, cobaltEndpoint]);

  return (
    <div className="w-[400px] p-3 bg-main-300 text-main-content">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-black">Cobalt Portal</h1>
          <label className="cursor-pointer">
            <span className="mr-2">Audio Only?</span>
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

        <div className="flex mb-4">
          <input
            className="w-full input"
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
            className="btn px-2"
            type="button"
            disabled={isUrlSame}
            title="reset link input"
            onClick={(e) => {
              setUrl(tabUrl);
            }}
          >
            🔄️
          </button>
        </div>

        <button
          className="btn p-2 mb-2 w-full"
          type="submit"
          disabled={!ready}
          title={
            !ready || isUrlSupported ? '' : 'this link may not be supported!'
          }
        >
          download {!ready || isUrlSupported ? <></> : <>⚠️</>}
        </button>

        <label className="flex items-center gap-4">
          <span
            className="font-xs"
            title="Instance of Cobalt to connect to (i.e. https://co.arks.cafe)"
          >
            Cobalt URL
          </span>
          <input
            className="flex-auto font-xs input"
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
