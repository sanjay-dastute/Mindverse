// index.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Default CSS
import './indexDark.css';
import reportWebVitals from './reportWebVitals';
import { Provider, useSelector } from 'react-redux';
import store from './configureStore'; // Import your Redux store
// import { ThemeContext } from '@emotion/react';

const Root = () => {
  const darkMode = useSelector(({ dashboardReducer }) => dashboardReducer.darkMode);

  useEffect(() => {

    const body = document.body;
    if (darkMode) {
      body.classList.add('dark-mode'); // Add the dark-mode class to the body
      console.log('Dark mode enabled');
    } else {
      body.classList.remove('dark-mode'); // Remove the dark-mode class from the body
      console.log('Dark mode disabled');
    }

  }, [darkMode]);

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      {/* <ThemeContext> */}
        <Root />
      {/* </ThemeContext> */}
    </React.StrictMode>
  </Provider>
);

reportWebVitals();
