// UserDashboard.js
import React, { useEffect, useCallback, lazy, useState } from "react";
import UserLayout from "../../layout/UserLayout";
import GetPostList from "../../components/user/GetPostList";
import ResponseTemplate from "../responseTemp/ResponseTemplate";
import ContentSettingForm from "../../components/user/ContentSetting";
import ProductList from "../product/ProductList";
import UserList from "../../components/admin/UserList";
import SupportSection from "../support/SupportSection";
import SettingForm from "../settings/SettingForm";
import ConversationTable from "../conversation/ConversationList";
// import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import { roles, /*menuPermissions,*/ getUserRole } from "../../services/roleService";
import MVAdminSupportSection from "../../components/support/MVAdminSupportSection";
import UniversalContext from "../../components/aiadmin/UniversalContext";
import AIAdmin from "../../components/aiadmin/AiAdmin";
import AccountDetails from "../profile/AccountDetails";
import MainDashboard from "./MainDashboard";
import { setSelectedMenu, setUserRole } from "../../reducers/dashboardReducer";
import MVAdminOrgAi from "../mvadmin/MVAdminOrgAi";
// import { setFacebookState } from "../../reducers/facebookReducer";

// const ResponseTemplate = lazy(() => import("../responseTemp/ResponseTemplate"));
// const ProductList = lazy(() => import("../product/ProductList"));
// const UserList = lazy(() => import("../../components/admin/UserList"));
// const SupportSection = lazy(() => import("../support/SupportSection"));
// const SettingForm = lazy(() => import("../settings/SettingForm"));
// const ConversationTable = lazy(() => import("../conversation/ConversationList"));
// const AccountDetails = lazy(() => import("../profile/AccountDetails"));
// const MVAdminSupportSection = lazy(() => import("../../components/support/MVAdminSupportSection"));
// const AIAdmin = lazy(() => import("../../components/aiadmin/AiAdmin"));
// const UniversalContext = lazy(() => import("../../components/aiadmin/UniversalContext"));

const UserProfilePage = () => {

  const dispatch = useDispatch();
  const { selectedMenu, userRole } = useSelector(({ dashboardReducer }) => dashboardReducer);

  const currentPath = window.location.pathname;

  const handleMenuSelect = (key) => {
    if(key === "14" || key === "15") {
      //do nothing
    }
    else {
      dispatch(setSelectedMenu(key));
    }
  };

  const fetchUserRole = useCallback(async () => {
    const organizationId = Cookies.get('organizationId');
    const otherUserId = Cookies.get('otherUserId');
    const token = Cookies.get('token');

    if (token) {
      try {
        let role;
        if (organizationId && !otherUserId) {
          role = await getUserRole('', organizationId, token);
        } else if (otherUserId && !organizationId) {
          role = await getUserRole(otherUserId, '', token);
        } else if (otherUserId && organizationId) {
          role = currentPath === '/mvadmin/dashboard'
            ? await getUserRole(otherUserId, '', token)
            : await getUserRole('', organizationId, token);
        } else {
          console.log("error no id received with token");
          role = roles.UNAUTHORIZED;
        }
        dispatch(setUserRole(role));
        dispatch(setSelectedMenu(role === roles.MVADMIN ? "4" : "1"));
      } catch (error) {
        console.error("Error fetching user role:", error);
        dispatch(setUserRole(roles.UNAUTHORIZED));
      }
    } else {
      dispatch(setUserRole(roles.UNAUTHORIZED));
    }
  }, [dispatch, currentPath]);

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

  const renderContent = useCallback((refreshNotifications) => {

    switch (userRole) {
      case roles.ADMIN:
        switch (selectedMenu) {
          case "1": return <GetPostList refreshNotifications={refreshNotifications} />;
          case "2": return <ResponseTemplate refreshNotifications={refreshNotifications} />;
          case "3": return <ProductList refreshNotifications={refreshNotifications} />;
          case "4": return <UserList />;
          case "5": return <SupportSection refreshNotifications={refreshNotifications} />;
          case "7": return <ContentSettingForm refreshNotifications={refreshNotifications} />;
          case "8": return <SettingForm refreshNotifications={refreshNotifications} />;
          case "9": return <ConversationTable />;
          case "10": return <AccountDetails />;
          case "11": return <MVAdminOrgAi />;
          case "16": return <MainDashboard dashboard="ADMIN" />

          default: return <GetPostList />;
        }
      case roles.MVADMIN:
        switch (selectedMenu) {
          case "4": return <UserList />;
          case "5": return <MVAdminSupportSection />;
          case "11": return <AIAdmin />;
          case "12": return <UniversalContext />;
          case "16": return <MainDashboard dashboard="MV" />

          default: return <UniversalContext />;
        }
      case roles.UNAUTHORIZED: return null;
      default: return null;
    }
  }, [userRole, selectedMenu]);


  return (
    <UserLayout
      userRole={userRole}
      selectedMenuKey={selectedMenu}
      onMenuSelect={handleMenuSelect}>
      {({ refreshNotifications }) => (
        <div className="user-dashboard">
          {renderContent(refreshNotifications)}
        </div>
      )}
    </UserLayout>
  );
};

export default UserProfilePage;
