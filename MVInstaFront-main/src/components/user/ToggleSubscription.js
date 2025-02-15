// src/components/ToggleSubscription.js
import React, { memo, useEffect, useState, useCallback } from 'react';
import { Switch, message, Spin } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../../reducers/dashboardReducer';
import { useSelector } from 'react-redux';

const SubscriptionToggle = memo(() => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useSelector(({ dashboardReducer }) => dashboardReducer);

  const getToken = useCallback(() => Cookies.get("token"), []);
  const getOrganizationId = useCallback(() => Cookies.get("organizationId"), []);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const token = getToken();
      const organizationId = getOrganizationId();
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/users/subscribe/${organizationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsSubscribed(response.data.isSubscriptionEnabled);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      message.error('Failed to fetch subscription status');
    } finally {
      setLoading(false);
    }
  }, [getToken, getOrganizationId]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [getToken, getOrganizationId]);

  const handleToggle = async (checked) => {
    setLoading(true);
    try {
      const token = getToken();
      const organizationId = getOrganizationId();
      const method = checked ? 'post' : 'delete';

      await axios({
        method,
        url: `${process.env.REACT_APP_API_BASE_URL}/users/subscribe/${organizationId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      message.success(`Successfully ${checked ? 'subscribed' : 'unsubscribed'}`);
      // await fetchSubscriptionStatus();
      setIsSubscribed(checked);
    } catch (error) {
      console.error('Error toggling subscription:', error);
      message.error('Failed to toggle subscription');
      setIsSubscribed(!checked); // Revert the toggle if the API call fails
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin />;
  }

  return (
    <div style={{padding: '3px',}}> {/* marginLeft: screenSize < 576 ? "" : '8%'*/}
      <span style={{ marginRight: '10px', color: darkMode ? 'white' : '' }}>{isSubscribed ? 'Active' : 'Inactive'} :</span>
    <Switch
      checked={isSubscribed}
      onChange={handleToggle}
      loading={loading}
    />
      <div style={{ color: isSubscribed ? 'green' : 'red'}}>{isSubscribed ? "" : <b>AUTOMATIC RESPONSES ARE TURNED OFF</b>}</div>
    </div>
  );
});

export default SubscriptionToggle;