import { useEffect, useState } from 'react';
import { serverWaking } from '../services/api';

export default function useServerWaking() {
  const [waking, setWaking] = useState(serverWaking);

  useEffect(() => {
    const onChange = (e) => setWaking(e.detail);
    window.addEventListener('veloop:waking', onChange);
    return () => window.removeEventListener('veloop:waking', onChange);
  }, []);

  return waking;
}
