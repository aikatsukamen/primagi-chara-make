import React, { useState } from 'react';

export const SWUpdateDialog: React.FC<{ registration: ServiceWorkerRegistration }> = ({ registration }) => {
  const [show, setShow] = useState(!!registration.waiting);
  const style: React.CSSProperties = {
    width: '100%',
    background: 'linear-gradient(180deg, #fe8ad1 0%, #eaa1cd 20%, #7fd6fd 70%, #a4f1e8 100%)',
  };
  const handleUpdate = () => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    setShow(false);
    window.location.reload();
  };

  return show ? (
    <div style={style}>
      <span>更新があります🎉</span>
      <button onClick={handleUpdate}>アップデート</button>
    </div>
  ) : (
    <></>
  );
};
