import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/pages/App';
import * as serviceWorker from './serviceWorker';
import { SWUpdateDialog } from './components/organisms/SWUpdateDialog';

ReactDOM.render(<App />, document.getElementById('root'));

if ((module as any).hot) {
  (module as any).hot.accept();
}

serviceWorker.register({
  onSuccess: (registration) => {
    console.log(`'ServiceWorker registration successful with scope: ${registration.scope}`);
  },
  onUpdate: (registration) => {
    if (registration.waiting) {
      ReactDOM.render(<SWUpdateDialog registration={registration} />, document.querySelector('.SW-update-dialog'));
    }
  },
});
