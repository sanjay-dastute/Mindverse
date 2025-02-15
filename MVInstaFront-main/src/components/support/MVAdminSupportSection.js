import React, { useState, useEffect } from 'react';
import { Table, Spin, notification } from 'antd';
import { useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { getAllSupportRequests } from '../../services/supportService';
import MVAdminChatModal from './MVAdminChatModal';
import useTableColumnSearch from '../../utils/useTableColumnSearch';
import '../../reducers/dashboardReducer';
import ListView from '../common/ListView';


const MVAdminSupportSection = () => {
  const [allSupportRequests, setAllSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const { screenSize } = useSelector(({dashboardReducer}) => dashboardReducer);
  const { getColumnSearchProps } = useTableColumnSearch()

  useEffect(() => {
    // const otherUserId = sessionStorage.getItem('otherUserId');
    const otherUserId = Cookies.get('otherUserId');
    fetchAllSupportRequests(otherUserId);
  }, []);

  const fetchAllSupportRequests = async () => {
    try {
      setLoading(true);
      // const otherUserId = sessionStorage.getItem('otherUserId');
      // const token = sessionStorage.getItem('token');
      const otherUserId = Cookies.get('otherUserId');
      const token = Cookies.get('token');
      const requests = await getAllSupportRequests(otherUserId, token);
      const flattenedRequests = requests.flatMap(org => org.supportRequests.map(request => ({
        ...request,
        organizationId: org.organizationId,
        instagramUserName: org.instagramUserName,
      })));
      const requestsWithKeys = flattenedRequests.map((request, index) => ({
        ...request,
        key: index.toString(),
      }));
      const sortedRequests = requestsWithKeys.sort((a, b) => {
        if (a.status === 'Resolved' && b.status !== 'Resolved') {
          return 1;
        } else if (a.status !== 'Resolved' && b.status === 'Resolved') {
          return -1;
        } else {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
      });
      setAllSupportRequests(sortedRequests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all support requests:', error);
      setLoading(false);
    }
  };

  const handleChatModalClose = () => {
    setShowChatModal(false);
    fetchAllSupportRequests();
  };

  const handleInstagramUserNameClick = (requestId, organizationId) => {
    const selectedRequest = allSupportRequests.find((request) => request.requestId === requestId);
    if (selectedRequest.status === 'Resolved') {
      // notification.warning({
      //   message: 'Request Already Resolved',
      //   description: 'The selected support request has already been resolved.',
      // });
    }
    setSelectedRequestId(requestId);
    setSelectedOrganizationId(organizationId);
    setShowChatModal(true);
  };

  const columns = [
    {
      title: 'User Id',
      dataIndex: 'instagramUserName',
      key: 'instagramUserName',
      ...getColumnSearchProps('instagramUserName'),
      render: (text, record) => <a onClick={() => handleInstagramUserNameClick(record.requestId, record.organizationId)}>{text}</a>
    },
    // { title: 'Organization ID', dataIndex: 'organizationId', key: 'organizationId', ...getColumnSearchProps('organizationId'), },
    // { title: 'Request ID', dataIndex: 'requestId', key: 'requestId', ...getColumnSearchProps('requestId'), },
    { title: 'Type', dataIndex: 'type', key: 'type', ...getColumnSearchProps('type'), },
    { title: 'Query', dataIndex: 'query', key: 'query', ...getColumnSearchProps('query'), },
    {
      title: 'Request Created Date', dataIndex: 'createdAt', key: 'createdAt', render: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
      }
    },
    { title: 'Status', dataIndex: 'status', key: 'status', ...getColumnSearchProps('status'), },
  ];

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        screenSize < 576 ?
          <ListView
            dataSource={allSupportRequests}
            title={"User Id"}
            description={"Type"}
            extraButtonDesc={"Know More"}
            fromPage={"mvadminSupport"}
            searchArea={true}
            mainTitle={"Support"}
            handleEdit={handleInstagramUserNameClick}
          />
          :
          <Table
            dataSource={allSupportRequests}
            columns={columns}
            pagination={false}
          />
      )}
      <MVAdminChatModal
        visible={showChatModal}
        onClose={handleChatModalClose}
        requestId={selectedRequestId}
        organizationId={selectedOrganizationId}
        isResolved={allSupportRequests.find(q => q.requestId === selectedRequestId)?.status === 'Resolved'}
      />
    </div>
  );
};

export default MVAdminSupportSection;