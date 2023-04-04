export interface CobaltRequestBody {
  url: string;
  vCodec?: 'h264' | 'av1' | 'vp9';
  vQuality?: '144' | '360' | '480' | '720' | '1080' | '1440' | '2160' | 'max';
  aFormat?: 'best' | 'mp3' | 'ogg' | 'wav' | 'opus';
  isAudioOnly?: boolean;
  isNoTTWaterMark?: boolean;
  isTTFullAudio?: boolean;
  isAudioMuted?: boolean;
  dubLang?: boolean;
}

export type PickerItem = {
  url: string;
};

export type PickerItemVideo = {
  type: 'video';
  url: string;
  thumb: string;
};

/** @see https://github.com/wukko/cobalt/blob/cf6dcfe7a6528acbd1dc45af6a60fd112d2769a6/src/modules/sub/utils.js#L12-L41 */
export type CobaltResponseBody =
  | {
      status: 'error' | 'rate-limit';
      text: string;
    }
  | {
      status: 'redirect' | 'stream';
      url: string;
    }
  | {
      status: 'success';
      text: string;
    }
  | {
      status: 'picker';
      text: string;
      pickerType: 'images';
      picker: PickerItem[];
      audio: string;
    }
  | {
      status: 'picker';
      text: string;
      pickerType: 'various';
      picker: (PickerItem | PickerItemVideo)[];
      audio: false;
    };

export interface AppSettings {
  cobaltSettings: CobaltRequestBody;
  cobaltEndpoint: string;
}
