// src/App.js
import React, { lazy } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ConfigProvider } from "antd";
import UserLogin from "./modules/user/UserLogin";
import UserDashboard from "./modules/user/UserDashboard";
// import MVAdminUserDashboard from "./modules/mvadmin/MVAdminUserDashboard";
import Login from "./modules/login/Login";
import PrivateRoute from "./components/PrivateRoute"; // Adjust the path as needed
import { theme } from "./thme";
import { darkTheme } from "./darkTheme";
// import store from "./configureStore";
import './reducers/dashboardReducer';
import Poc from "./modules/poc/Poc";

const FacebookCallback = lazy(() => import('./components/facebook/FacebookCallback'));
const InstagramCallback = lazy(() => import('./components/instagram/InstagramCallback'));
const UserBasicInfo = lazy(() => import('./modules/user/UserBasicInfo'));

const App = () => {
  // <Provider store={store}>
  const { darkMode } = useSelector(({ dashboardReducer }) => dashboardReducer);

  return <ConfigProvider
    theme={darkMode ? darkTheme : theme}
  >
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/fb/callback" element={<FacebookCallback />} />
        <Route path="/instagram/callback" element={<InstagramCallback />} />
        <Route path="/poc" element={<Poc />} />
        <Route
          path="/user_info"
          element={<PrivateRoute element={UserBasicInfo} />}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={UserDashboard} />}
        />
        <Route
          path="/mvadmin/dashboard"
          element={<PrivateRoute element={UserDashboard} />}
        />
        <Route
          path="/user-profile"
          element={<PrivateRoute element={UserDashboard} />} //element was MVAdminUserDashboard
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  </ConfigProvider>
  // </Provider>
};

export default App;
