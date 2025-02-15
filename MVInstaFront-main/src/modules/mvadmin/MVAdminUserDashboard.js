import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import UserLayout from "../../layout/UserLayout";
import GetPostList from "../../components/user/GetPostList";
import ResponseTemplate from "../responseTemp/ResponseTemplate";
import ContentSettingForm from "../../components/user/ContentSetting";
import ProductList from "../product/ProductList";
import UserList from "../../components/admin/UserList";
import SupportSection from "../support/SupportSection";
import SettingForm from "../settings/SettingForm";
import ConversationTable from "../conversation/ConversationList";

import { roles, getUserRole } from "../../services/roleService";
import MVAdminUserLayout from "../../layout/MVAdminUserLayout";
import AccountDetails from "../profile/AccountDetails";
import MVAdminOrgAiPage from "./MVAdminOrgAi";

const MVAdminUserProfilePage = () => {
  const [selectedMenuKey, setSelectedMenuKey] = useState("0");
  const [userRole, setUserRole] = useState(roles.UNAUTHORIZED);

  const handleMenuSelect = ({ key }) => {
    setSelectedMenuKey(key);
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const organizationId = urlParams.get("organizationId");

      if (token && organizationId) {
        try {
          const role = await getUserRole('', organizationId, token);
          // sessionStorage.setItem("token", token);
          // sessionStorage.setItem("organizationId", organizationId);
          Cookies.set('organizationId', organizationId, {expires: 3650});
          Cookies.set('token', token, {expires: 3650});
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole(roles.UNAUTHORIZED);
        }
      } else {
        setUserRole(roles.UNAUTHORIZED);
      }
    };

    fetchUserRole();
  }, []);

  const renderContent = () => {
    switch (userRole) {
      case roles.ADMIN:
        switch (selectedMenuKey) {
          case "1":
            return <GetPostList />;
          case "2":
            return <ResponseTemplate />;
          case "3":
            return <ProductList />;
          case "4":
            return <UserList />;
          case "5":
            return <SupportSection />;
          case "7":
            return <ContentSettingForm />;
          case "8":
            return <SettingForm />;
          case "9":
            return <ConversationTable />;
          case "10":
            return <AccountDetails />;
          case "11":
            return <MVAdminOrgAiPage />;
          default:
            return <GetPostList />;
        }
      case roles.UNAUTHORIZED:
        return null; // Or you can render a custom message or component
      default:
        return null;
    }
  };

  return (
    <MVAdminUserLayout
      userRole={userRole}
      selectedMenuKey={selectedMenuKey}
      onMenuSelect={handleMenuSelect}>
      <div
        style={{
          padding: "24px",
          background: "#fff",
          minHeight: "360px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}>
        {renderContent()}
      </div>
    </MVAdminUserLayout>
  );
};

export default MVAdminUserProfilePage;
