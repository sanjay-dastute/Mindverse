import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAccessToken } from "../../services/authService";
import Loading from "../Loading";
// import { setFacebookState } from "../../reducers/facebookReducer";
// import { useDispatch } from "react-redux";
import Cookies from "js-cookie";

const FacebookCallback = () => {
  const location = useLocation();
  // const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get("code");
    if (code) {
      getAccessToken(code)
        .then((data) => {
          if (data.organizationId) {
            if (data.isUserExist) {
              // sessionStorage.setItem("organizationId", data.organizationId);
              // sessionStorage.setItem("token", data.token);
              Cookies.set('organizationId', data.organizationId, {expires: 3650});
              Cookies.set('token', data.token, {expires: 3650});
              // dispatch(setFacebookState({
              //   organizationId: data.organizationId,
              //   token: data.token
              // }))
              navigate("/dashboard");
            } else {
              // sessionStorage.setItem("organizationId", data.organizationId);
              // sessionStorage.setItem("token", data.token);
              // dispatch(setFacebookState({
              //   organizationId: data.organizationId,
              //   token: data.token
              // }))
              Cookies.set('organizationId', data.organizationId, {expires: 3650});
              Cookies.set('token', data.token, {expires: 3650});

              // navigate("/user_info");
              navigate("/dashboard");
            }
          }
          // else if()
        })
        .catch((error) => {
          console.error("Error getting access token:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false); // Handle the case where there is no code in the URL
    }
  }, [location, navigate]);
  return <div>{loading && <Loading />}</div>;
};
export default FacebookCallback;
