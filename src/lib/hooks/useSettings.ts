import { useReducer } from 'react';
import { AppSettings } from '../types';

export default function useAppSettings() {
  const initialSettings: AppSettings = {
    cobaltEndpoint: '',
    cobaltSettings: {
      url: '',
    },
  };

  const reducer = () => {};

  // const [state, dispatch] = useReducer(reducer);
}
