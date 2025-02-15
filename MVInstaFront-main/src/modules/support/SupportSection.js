// SupportSection.js
import React, { useState, useEffect } from "react";
import { Button, Table, Spin, notification } from "antd";
// import { SearchOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { getSubmittedQueries } from "../../services/supportService";
import ChatModal from "../../components/support/ChatModal";
import CreateRequestModal from "../../components/support/CreateRequestModel";
// import Highlighter from 'react-highlight-words';
import useTableColumnSearch from "../../utils/useTableColumnSearch";
import '../../reducers/dashboardReducer';
import ListView from "../../components/common/ListView";


// const ChatModal = lazy(() => import('../../components/support/ChatModal'));

const SupportSection = ({ refreshNotifications }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submittedQueries, setSubmittedQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const { getColumnSearchProps } = useTableColumnSearch();

  const { screenSize } = useSelector(({ dashboardReducer }) => dashboardReducer);

  useEffect(() => {
    fetchSubmittedQueries();
  }, []);

  const fetchSubmittedQueries = async () => {
    try {
      setLoading(true);
      // const organizationId = sessionStorage.getItem("organizationId");
      // const token = sessionStorage.getItem("token");
      const organizationId = Cookies.get('organizationId');
      const token = Cookies.get('token');
      const queries = await getSubmittedQueries(organizationId, token);
      const queriesWithKeys = queries.map((query, index) => ({
        ...query,
        key: index.toString(),
      }));
      setSubmittedQueries(queriesWithKeys);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching submitted queries:", error);
      setLoading(false);
    }
  };

  const handleCreateRequest = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = (submitted) => {
    setIsModalVisible(false);
    if (submitted) {
      fetchSubmittedQueries();
    }
  };

  const handleChatModalClose = () => {
    setShowChatModal(false);
    fetchSubmittedQueries();
  };

  const handleRequestIdClick = (requestId) => {
    const selectedRequest = submittedQueries.find(
      (request) => request.requestId === requestId
    );
    // if (selectedRequest.status === "Resolved") {
    //   notification.warning({
    //     message: "Request Already Resolved",
    //     description:
    //       "The selected support request has already been resolved. Please create a new request if you have any queries",
    //   });
    // }
    setSelectedRequestId(requestId);
    setShowChatModal(true);
  };

  const columns = [
    {
      title: "Request ID",
      dataIndex: "id",
      key: "id",
      ...getColumnSearchProps('id'),
      render: (text, record) => (
        <a onClick={() => handleRequestIdClick(record.requestId)}>{text}</a>
      ),
    },
    { title: "Type", dataIndex: "type", key: "type", ...getColumnSearchProps('type'), },
    { title: "Query", dataIndex: "query", key: "query", ...getColumnSearchProps('query'), },
    {
      title: "Request Created Date", dataIndex: "createdAt", key: "createdAt", render: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
      }
    },
    { title: "Status", dataIndex: "status", key: "status", ...getColumnSearchProps('status'), },
  ];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <Button type="primary" onClick={handleCreateRequest}>
          Create New Request
        </Button>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" />
        </div>
      ) : (

        screenSize < 576 ?
          <ListView
            dataSource={submittedQueries}
            title={"Request Id"}
            description={"Status"}
            extraButtonDesc={"Know More"}
            fromPage={"support"}
            searchArea={true}
            mainTitle={"Support List"}
            handleEdit={handleRequestIdClick}
          />
          :
          <Table
            dataSource={submittedQueries}
            columns={columns}
            pagination={false}
          />
      )}
      <CreateRequestModal
        visible={isModalVisible}
        onClose={handleModalClose}
        refreshNotifications={refreshNotifications}
      />
      <ChatModal
        visible={showChatModal}
        onClose={handleChatModalClose}
        requestId={selectedRequestId}
        isResolved={
          submittedQueries.find((q) => q.id === selectedRequestId)?.status ===
          "Resolved"
        }
      />
    </div>
  );
};

export default SupportSection;
