import { useCallback, useEffect, useMemo, useState } from 'react';
import checkIsUrlSupported from '../lib/utils/checkIrUrlSupported';
import checkIsUrlRegex from '../lib/checkIsUrlRegex';

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
    <div className="w-[400px] m-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
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

        <div className="form-control">
          <div className="input-group input-group-sm">
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
              className="btn btn-square btn-sm"
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
        </div>

        <button
          className="btn-block btn-sm btn mb-2"
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
