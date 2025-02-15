import React, { useEffect, useState } from "react";
import { Spin, Table, message, Popover } from "antd";
import Cookies from "js-cookie";
import { getAllUsers } from "../../services/adminService";
import '../../reducers/dashboardReducer';
import { useSelector } from "react-redux";
import useTableColumnSearch from "../../utils/useTableColumnSearch";
import ListView from "../common/ListView";

const UserList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const { darkMode, screenSize } = useSelector(({ dashboardReducer }) => dashboardReducer);

  const { getColumnSearchProps } = useTableColumnSearch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        setError(error);
        message.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spin size="large" />;
  if (error) return <p>Error: {error.message}</p>;

  const openProfileInNewTab = (organizationId) => {
    // const token = sessionStorage.getItem("token");
    const token = Cookies.get('token');
    Cookies.set('organizationId', organizationId, { expires: 3650 });
    const url = `/user-profile?token=${encodeURIComponent(token)}&organizationId=${encodeURIComponent(organizationId)}`;
    // const windowFeatures = "incognito";

    window.open(url, "_blank", /*windowFeatures*/);
  };

  const truncateText = (text, wordLimit) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  const columns = [
    {
      title: "User ID",
      dataIndex: "instagramUserName",
      key: "instagramUserName",
      ...getColumnSearchProps('instagramUserName'),
      render: (text, record) => (
        <a href="#" onClick={() => openProfileInNewTab(record.organizationId)}>
          {text}
        </a>
      ),
    },
    // {
    //   title: "Organization ID",
    //   dataIndex: "organizationId",
    //   key: "organizationId",
    //   ...getColumnSearchProps('organizationId'),
    // },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
      ...getColumnSearchProps('contactPerson'),
    },
    {
      title: "Phone Number",
      dataIndex: "contactPhoneNumber",
      key: "contactPhoneNumber",
    },
    {
      title: "Prompt",
      dataIndex: "prompt",
      key: "prompt",
      ...getColumnSearchProps('prompt'),
      render: (text) => (
        <Popover
          content={
            <div style={{ maxHeight: 150, overflowY: 'auto', maxWidth: 400 }}>
              {text}
            </div>
          }
          title="Full Prompt"
          trigger="hover"
          overlayStyle={{ width: 400 }}
          placement="bottom"
        >
          <span>{truncateText(text, 15)}</span>
        </Popover>
      ),
    },
    {
      title: "Last Login",
      dataIndex: "lastLogin",
      key: "lastLogin",
    },
  ];

  return (
    <div>

      {screenSize < 576 ? <ListView
        dataSource={users}
        title={"User Id"}
        description={"Contact Name"}
        extraButtonDesc={"Know More"}
        fromPage={"userList"}
        searchArea={true}
        mainTitle={"List of Users"}
        handleEdit={openProfileInNewTab}
      />
        : <>
          <h2 style={{ color: darkMode ? 'white' : '' }}>List of Users</h2>
          <Table dataSource={users} columns={columns} rowKey="organizationId" />
        </>}

    </div>
  );
};

export default UserList;