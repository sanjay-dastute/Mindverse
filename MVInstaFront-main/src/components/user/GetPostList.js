import React, { memo, useCallback, useEffect, useState } from "react";
import { Spin, message, Button, Modal, Form, Row, Col, Typography } from "antd";
import { ReloadOutlined, AppstoreOutlined, TagOutlined, TagsOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { getPostDetails, getRefreshDetails, } from "../../services/userService";
import {
  getProductDetails,
  saveTagMedia,
  // getProductName,
  unTagMedia,
} from "../../services/productService";
import { createNotification } from "../../services/conversationService";
import TagCard from "../../components/tagCard";
import TagProduct from "../../components/tagCard/TagProduct";
import { setLoading } from "../../reducers/dashboardReducer";
import { useDispatch, useSelector } from "react-redux";
import TabsCard from "../common/TabsCard";
import "../../reducers/dashboardReducer";

const { Title } = Typography;

const PostsComponent = ({ posts, handleSelect, handleTagMedia, selectedRowKeys }) => (
  <Row gutter={[6, 6]} style={{ justifyContent: 'center' }}>
    {
      posts?.map((item) => <Col key={item.id} className="gutter-row" xl={7} md={8} sm={8} xs={8}>
        <TagCard alt="test"
          tagProductId={item.tagProductId}
          img={item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url}
          id={item.id} handleTagMedia={handleTagMedia}
          selected={selectedRowKeys}
          onSelect={handleSelect}
        />
      </Col>)
    }
  </Row>
)

const PostList = memo(() => {

  const dispatch = useDispatch();
  const { loading } = useSelector(({ dashboardReducer }) => dashboardReducer);

  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [unTagSinglePostId, setUnTagSinglePostId] = useState('');
  const [keyTab, setKeyTab] = useState('1');
  const [taggingInfo, setTaggingInfo] = useState({
    productId: "",
  });

  var pid = '';

  const { screenSize, darkMode } = useSelector(({dashboardReducer}) => dashboardReducer);

  const fetchData = useCallback(async (refresh, tabKey = '1') => {
    try {
      dispatch(setLoading(true));
      const organizationId = Cookies.get('organizationId');
      if (refresh) await getRefreshDetails(organizationId);
      let postDetails = [];
      if (tabKey === '1') postDetails = await getPostDetails(organizationId);
      else if (tabKey === '2') postDetails = await getPostDetails(organizationId, 'tagged');
      else postDetails = await getPostDetails(organizationId, 'untagged');
      const productDetails = await getProductDetails();

      // const postsWithProductNames = await Promise.all(
      //   postDetails.map(async (post) => {
      //     if (post.tagProductId) {
      //       const productName = await getProductName(post.tagProductId);
      //       return { ...post, productName: productName.productName };
      //     }
      //     return { ...post, productName: 'No Product' };
      //   })
      // );
      setPosts(postDetails);
      setProducts(productDetails);
      dispatch(setLoading(false));

      // try {
      //   const notificationMessage = 'Media Reload Successfully';
      //   await createNotification(notificationMessage);
      // } catch (notificationError) {
      //   console.error('Notification Error:', notificationError);
      // }
    } catch (fetchError) {
      setError(fetchError);
      message.error('Failed to load data');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // const onSelectChange = useCallback((selectedKeys) => {
  //   setSelectedRowKeys(selectedKeys);
  // }, []);

  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: onSelectChange,
  // };

  const handleTagMedia = (postId) => {
    pid = postId;
    setModalVisible(true);
    setUnTagSinglePostId(postId);
  };

  const handleUntagging = async () => {
    const organizationId = Cookies.get('organizationId');
    const data = {
      organizationId: organizationId,
      postId: unTagSinglePostId
    };
    
    try {
      await unTagMedia(data);
      const notificationMessage = `Untagged ${selectedRowKeys.length} media from product ID: ${taggingInfo.productId}`;
      await createNotification(notificationMessage);
      message.success(`Untagged ${selectedRowKeys.length} media successfully`);
      setModalVisible(false);
      fetchData(false, keyTab);
    } catch (error) {
      console.error('Error during untagging:', error);
      message.error('Failed to untag media. Please try again.');
    }
  };
  

  const handleTagging = useCallback(async () => {
    if (!taggingInfo.productId) {
      message.warning("Please select a product to tag.");
      return;
    }

    const organizationId = Cookies.get('organizationId');
    const tagRequests = selectedRowKeys.map(postId => ({
      postId,
      productId: taggingInfo.productId,
    }));

    try {
      await saveTagMedia({ organizationId, tagRequests });

      const notificationMessage = `Tagged ${selectedRowKeys.length} media with product ID: ${taggingInfo.productId}`;
      await createNotification(notificationMessage);

      message.success(`Tagged ${selectedRowKeys.length} media successfully`);
      setModalVisible(false);
      setSelectedRowKeys([]);
      fetchData(false, keyTab); // Reload the data
    } catch (error) {
      console.error("Error tagging media:", error);
      message.error("Failed to tag media");
    }
  }, [taggingInfo.productId, selectedRowKeys, fetchData]);

  if (loading) return <Spin size="large" />;
  if (error) return <p>Error: {error.message}</p>;


  const handleSelect = (item) => {
    if (selectedRowKeys.includes(pid)) {
      setSelectedRowKeys(prev => [...prev]);
    }
    else if (pid && !selectedRowKeys.includes(pid)) {
      setSelectedRowKeys(prev => [...prev, pid]);
    }
    else {
      setSelectedRowKeys(prev => prev.includes(item) ? prev.filter(selected => selected !== item) : [...prev, item]);
    }
    const post = posts.filter(post => post.id === item);
    if (selectedRowKeys.length === 0) {
      post[0].tagProductId ? setTaggingInfo({ productId: post[0].tagProductId }) : setTaggingInfo({ productId: '' });
    }
    else if (selectedRowKeys.length === 1) {
      if (selectedRowKeys[0] === item) {
        setTaggingInfo({ productId: post[0].tagProductId })
      }
      else setTaggingInfo({ productId: '' });
    }
    else {
      setTaggingInfo({ productId: '' });
    }
  }

  const selectProduct = (productId) => {
    setTaggingInfo(prevTaggingInfo => ({
      ...prevTaggingInfo,
      productId: productId !== prevTaggingInfo.productId ? productId : ''
    })
    );
  }

  const handleTabKey = (key) => {
    setKeyTab(key);
    fetchData(false, key);
    setSelectedRowKeys([]);
  }

  const tabLabelIcons = [
    {
      id: '1',
      name: screenSize < 576 ? "" : "All",
      icon: <AppstoreOutlined />,
      component: <PostsComponent
        posts={posts}
        handleSelect={handleSelect}
        handleTagMedia={handleTagMedia}
        selectedRowKeys={selectedRowKeys}
        screenSize={screenSize}
      />
    },
    {
      id: '2',
      name: screenSize < 576 ? "" : "Tagged",
      icon: <TagOutlined />,
      component: <PostsComponent
        posts={posts}
        handleSelect={handleSelect}
        handleTagMedia={handleTagMedia}
        selectedRowKeys={selectedRowKeys}
      />
    },
    {
      id: '3',
      name: screenSize < 576 ? "" : "Untagged",
      icon: <TagsOutlined />,
      component: <PostsComponent
        posts={posts}
        handleSelect={handleSelect}
        handleTagMedia={handleTagMedia}
        selectedRowKeys={selectedRowKeys}
      />
    },
  ];

  return (
    <>
      <TabsCard
        activeKey={keyTab}
        handleTabKey={handleTabKey}
        tabLabelIcons={tabLabelIcons}
        tabBarExtraContent={{
          right: (
            <div style={{
              // width: '120px',
              textAlign: 'right'
              // display: "flex",
              // justifyContent: "space-between",
              // marginLeft:  '-10%'
            }}>
              <Button type="primary" onClick={() => fetchData(true)}>
                <ReloadOutlined />
              </Button>
            </div>
          )
        }}
      />
      <Modal
        centered={true}
        title={<Title level={3} style={{ color: darkMode ? 'black' : ''}} className="text-center m-0">Select One Product</Title>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={750}
        footer={[
          <div className=" text-center" key="modalProduct">
            <Button key="submit" type="primary" size="large" onClick={() => {
              if (!taggingInfo.productId && selectedRowKeys.length === 1) handleUntagging();
              else handleTagging();
            }} disabled={taggingInfo.productId ? false : selectedRowKeys.length > 1 ? true : false}>
              Submit
            </Button>
          </div>
        ]}
      >
        {/* <Title level={4}>Select Product</Title> */}
        <Form layout="vertical">
          <Row gutter={[12, 12]} className="mt-6">
            {products.map((product) => (
              <Col span={6} key={product.id}>
                <TagProduct selectProduct={selectProduct} taggingInfo={taggingInfo} id={product.id} key={product.id} img={product.imageUrl} name={product.name} />
              </Col>
            ))
            }
          </Row>
          {/* <Form.Item label="Select Product">
            <Select
              value={taggingInfo.productId}
              onChange={(value) => setTaggingInfo({ ...taggingInfo, productId: value })}
            >
              {products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
});

export default PostList;