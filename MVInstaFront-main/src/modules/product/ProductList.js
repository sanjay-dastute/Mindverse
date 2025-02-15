import React, { useEffect, useState, lazy, memo } from "react";
import { Spin, Table, message, Button, Modal, Checkbox, List } from "antd";
import { PlusCircleOutlined, MenuOutlined, ShopOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import {
  getProductDetails,
  addProduct,
  // deleteProduct,
  updateProduct,
  // mediaCount,
  saveTagMedia,
  getProductTaggedMedia,
} from "../../services/productService";
// import { getPostDetails } from "../../services/userService";
import { /* EditOutlined, DeleteOutlined, */ TagOutlined, AppstoreOutlined } from "@ant-design/icons";
import TabsCard from "../../components/common/TabsCard";
import useTableColumnSearch from "../../utils/useTableColumnSearch";
import "../../reducers/dashboardReducer";
import { useSelector } from "react-redux";
import ListView from "../../components/common/ListView";

// const { Title } = Typography;
const AddProductModal = lazy(() => import('../../components/product/AddProductModal'))

const ProductList = memo(({ refreshNotifications }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  // const [allMedia, setAllMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [taggingProductId, setTaggingProductId] = useState(null);
  // const [pageSize, setPageSize] = useState(10);
  // const [currentPage, setCurrentPage] = useState(1);
  const [tagTabKey, setTagTabKey] = useState('1');
  const [productTaggedMedia, setProductTaggedMedia] = useState([]);
  const [productId, setProductId] = useState('');
  const [keyTab, setKeyTab] = useState('1');
  // const [globalSearchValue, setGlobalSearchValue] = useState('');
  const { screenSize } = useSelector(({ dashboardReducer }) => dashboardReducer);

  const { getColumnSearchProps } = useTableColumnSearch();

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getProductDetails();
      // const productsWithMediaCount = await Promise.all(
      //   data.map(async (product) => {
      //     const mediaCountValue = await mediaCount(product.id);
      //     return { ...product, mediaCount: mediaCountValue.mediaCount };
      //   })
      // );
      setProducts(data);
    } catch (error) {
      setError(error);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductTagMedia = async (productId, key = '1') => {
    try {
      let productTaggedMedia = [];
      if (key === '1') productTaggedMedia = await getProductTaggedMedia(productId, "tagged");
      else productTaggedMedia = await getProductTaggedMedia(productId, "untagged");
      setProductTaggedMedia(productTaggedMedia);
    }
    catch {
      setError(error);
      message.error("Failed to load data");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async (newProduct) => {
    if (editingProduct) {
      try {
        await updateProduct({
          ...newProduct,
          productId: editingProduct.id,
        });
        message.success("Product updated successfully");
        setEditingProduct(null);
        fetchData();
      } catch (error) {
        message.error("Failed to update product");
      }
    } else {
      try {
        await addProduct(newProduct);
        message.success("Product added successfully");
        fetchData();
      } catch (error) {
        message.error("Failed to add product");
      }
    }
    setIsModalVisible(false);
    refreshNotifications();
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    setIsModalVisible(true);
  };


  const handleTagMedia = async (productId) => {
    setProductId(productId);
    setTaggingProductId(productId);
    setSelectedMedia([]);
    setIsTagModalVisible(true);
    fetchProductTagMedia(productId);
  };

  const handleTagMediaSubmit = async () => {
    try {
      // const organizationId = sessionStorage.getItem("organizationId");
      const organizationId = Cookies.get('organizationId');
      await saveTagMedia({
        organizationId,
        tagRequests: selectedMedia.map(mediaId => ({
          postId: mediaId,
          productId: taggingProductId
        }))
      });
      message.success("Media tagged successfully");
      setIsTagModalVisible(false);
      fetchData();
      // refreshNotifications();
    } catch (error) {
      console.error("Error tagging media:", error);
      message.error("Failed to tag media");
    }
  };

  const renderMedia = (record) => {
    const mediaStyle = {
      width: 150,  // Set the desired width
      height: 150, // Set the desired height
      objectFit: 'cover', // Ensures the image covers the entire area without distortion
    };

    if (record.media_type === "VIDEO") {
      return (
        <img src={record.thumbnail_url} alt="Media" style={mediaStyle} />
      );
    } else if (record.media_type) {
      return (
        <img src={record.media_url} alt="Media" style={mediaStyle} />
      );
    } else {
      return <span>Unsupported media type</span>;
    }
  };


  const handleTabKey = (key) => {
    setKeyTab(key);
  }
  const handleTagTabKey = (key) => {
    setTagTabKey(key);
    fetchProductTagMedia(productId, key);
  }

  if (loading) return <Spin size="large" />;
  if (error) return <p>Error: {error.message}</p>;

  const columns = [
    // {
    //   title: "Product ID",
    //   dataIndex: "id",
    //   key: "id",
    // },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      width: '15%',
      ...getColumnSearchProps('name'),
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={record.imageUrl || "https://ninja-application.s3.ap-southeast-2.amazonaws.com/1723153121006.png"}
            alt="product"
            style={{ width: 30, height: 30, marginRight: 8 }} // Adjust size as needed
          />
          <a onClick={() => {

            handleEdit(record)
          }}><span>{text}</span></a>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: "10%",
      ...getColumnSearchProps('price'),
      render: (price) => `₹${price}`,
    },
    {
      title: "Buying Link",
      dataIndex: "buying_link",
      key: "buying_link",
      width: "15%",
      ...getColumnSearchProps('buying_link'),
      render: (text) => <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>,
    },
    {
      title: "Payment Link",
      dataIndex: "payment_link",
      key: "payment_link",
      width: "15%",
      ...getColumnSearchProps('payment_link'),
      render: (text) => <div style={{ whiteSpace: "pre-wrap" }}>{text}</div>,
    },
    {
      title: "Tag",
      key: "tag",
      width: "10%",
      // ...getColumnSearchProps('tag'),
      render: (text, record) => (
        <Button
          icon={<TagOutlined />}
          onClick={() => handleTagMedia(record.id)}
        >
          Tag Media
        </Button>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: "15%",
      // ...getColumnSearchProps('payment_link'),
      render: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
      }
    },
    {
      title: "Modified Date",
      dataIndex: "modifiedDate",
      key: "modifiedDate",
      width: "15%",
      // ...getColumnSearchProps('payment_link'),
      render: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        });
      }
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   width: '5%',
    //   // ...getColumnSearchProps('action'),
    //   render: (text, record) => (
    //     <span>
    //       <EditOutlined className="text-gray text-md"
    //         style={{ marginRight: 8 }}
    //         onClick={() => handleEdit(record)}
    //       />
    //       <DeleteOutlined className="text-pink text-md"
    //         onClick={() => handleDelete(record)}
    //       />
    //     </span>
    //   ),
    // },
  ];
  //
  const tabLabelIcons = [
    {
      id: '1',
      name: screenSize < 576 ? "" : "All",
      icon: <AppstoreOutlined />,
      component: screenSize < 576 ? <ListView
        dataSource={products}
        title={"Product Name"}
        description={"Price"}
        extraButtonDesc={"Know More"}
        fromPage={"product"}
        handleEdit={handleEdit}
        mainTitle={"Products List"}
        searchArea={true}
      /> : <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        size="small"
      />
    },
    {
      id: '2',
      name: screenSize < 576 ? "" : "Manual",
      icon: <MenuOutlined />,
      component: <Table
        dataSource={products}
        columns={screenSize < 576 ? columns.filter((item) => {
          if (item.title === "Product Name" || item.title === "Price" || item.title === "Tag") return item
        }) : columns}
        rowKey="id"
        size="small"
      />
    },
    {
      id: '3',
      name: screenSize < 576 ? "" : "Shopify",
      icon: <ShopOutlined />,
      component: <Table
        dataSource={products}
        columns={screenSize < 576 ? columns.filter((item) => {
          if (item.title === "Product Name" || item.title === "Price" || item.title === "Tag") return item
        }) : columns}
        rowKey="id"
        size="small"
      />
    },
  ];

  const tagTabLabelIcons = [
    {
      id: '1',
      name: "Tagged",
      icon: <AppstoreOutlined />,
      component: <List
        // dataSource={allMedia.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        // dataSource={productTaggedMedia.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        dataSource={productTaggedMedia}
        grid={{
          gutter: 16, // Space between grid items
          column: 3,  // Number of columns
        }}
        renderItem={item => (
          <List.Item>
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedMedia([...selectedMedia, item.id]);
                } else {
                  setSelectedMedia(selectedMedia.filter(id => id !== item.id));
                }
              }}
              checked={selectedMedia.includes(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div className="taggedMediaItem">
                  {renderMedia(item)}
                </div>
                {/* <div style={{ flex: 1 }}>
                  <div style={{
                    maxWidth: '450px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {item.caption ? item.caption : 'No caption'}
                  </div>
                </div> */}
              </div>
            </Checkbox>
          </List.Item>
        )}
        // pagination={{
        //   current: currentPage,
        //   pageSize: pageSize,
        //   total: allMedia.length,
        //   onChange: (page, pageSize) => {
        //     setCurrentPage(page);
        //     setPageSize(pageSize);
        //   },
        //   onShowSizeChange: (current, size) => {
        //     setPageSize(size);
        //     setCurrentPage(1);
        //   },
        //   showSizeChanger: true,
        //   pageSizeOptions: ['10', '20'],
        // }}
        style={{ maxHeight: '400px', overflowY: 'auto' }}
      />
    },
    {
      id: '2',
      name: "Untagged",
      icon: <MenuOutlined />,
      component: <List
        // dataSource={allMedia.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
        dataSource={productTaggedMedia}
        renderItem={item => (
          <List.Item>
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedMedia([...selectedMedia, item.id]);
                } else {
                  setSelectedMedia(selectedMedia.filter(id => id !== item.id));
                }
              }}
              checked={selectedMedia.includes(item.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div style={{ marginRight: '16px' }}>
                  {renderMedia(item)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    maxWidth: '450px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}>
                    {item.caption ? item.caption : 'No caption'}
                  </div>
                </div>
              </div>
            </Checkbox>
          </List.Item>
        )}
        // pagination={{
        //   current: currentPage,
        //   pageSize: pageSize,
        //   total: allMedia.length,
        //   onChange: (page, pageSize) => {
        //     setCurrentPage(page);
        //     setPageSize(pageSize);
        //   },
        //   onShowSizeChange: (current, size) => {
        //     setPageSize(size);
        //     setCurrentPage(1);
        //   },
        //   showSizeChanger: true,
        //   pageSizeOptions: ['10', '20'],
        // }}
        style={{ maxHeight: '400px', overflowY: 'auto' }}
      />
    },
  ];

  const tabBarExtraContent = {
    // left: (
    // <Input
    //   placeholder="search"
    //   prefix={<SearchOutlined style={{color: '#bfbfbf'}} />}
    //   size='small'
    //   style={{ marginBottom: 6 }} // Space between search and tab labels
    //   value={searchText}
    //   onChange={(e) => handleSearch([e.target.value])}
    //   // onClick={(e) => console.log(e.target.value)}
    // />
    // ),
    right: <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => setIsModalVisible(true)} style={{ marginBottom: 6 }}>
      {screenSize < 576 ? '' : "Add"}
    </Button>,
  };


  return (
    <div>
      {/* <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        {columns.map((column) => (
          <Col key={column.key} span={column.width}>
            <Input size="small"
              placeholder={`Search ${column.title}`}
              // value={searchValues[column.dataIndex] || ""}
              // onChange={(e) => handleSearch(e.target.value, column.dataIndex)}
            />
          </Col>
        ))}
      </Row> */}
      <TabsCard
        activeKey={keyTab}
        handleTabKey={handleTabKey}
        tabLabelIcons={tabLabelIcons}
        tabBarExtraContent={tabBarExtraContent}
      />

      {/* <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        size="small"
      /> */}
      <AddProductModal
        visible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingProduct(null);
          fetchData();
        }}
        onAddProduct={handleAddProduct}
        initialValues={editingProduct}
        refreshNotifications={refreshNotifications}
      />
      <Modal
        title="Tag Media"
        open={isTagModalVisible}
        onCancel={() => {
          setIsTagModalVisible(false);
          setTagTabKey('1');
          setProductId('');
        }}
        onOk={handleTagMediaSubmit}
        width={800}
      >
        <TabsCard
          activeKey={tagTabKey}
          handleTabKey={handleTagTabKey}
          tabLabelIcons={tagTabLabelIcons}
        />
        {/* <List
          dataSource={allMedia.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          renderItem={item => (
            <List.Item>
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMedia([...selectedMedia, item.id]);
                  } else {
                    setSelectedMedia(selectedMedia.filter(id => id !== item.id));
                  }
                }}
                checked={selectedMedia.includes(item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <div style={{ marginRight: '16px' }}>
                    {renderMedia(item)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      maxWidth: '450px',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}>
                      {item.caption ? item.caption : 'No caption'}
                    </div>
                  </div>
                </div>
              </Checkbox>
            </List.Item>
          )}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: allMedia.length,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20'],
          }}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
        /> */}
      </Modal>
    </div>
  );
});

export default ProductList;
