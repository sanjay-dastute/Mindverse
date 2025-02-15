import React, { useState, useRef } from 'react';
import { Input } from 'antd';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const useTableColumnSearch = () => {
  //Table search component
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  // const handleGlobalSearch = (selectedKey) => {
  //   setSearchText(selectedKey);
  //   setGlobalSearchValue(selectedKey);
  // }
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm({ closeDropdown: false });
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  // const handleReset = (clearFilters) => {
  //   clearFilters();
  //   setSearchText('');
  // };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
          // width: '120px'
          display: "flex",
          justifyContent: "space-between"
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          size="small"
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
            handleSearch([e.target.value], confirm, dataIndex);
          }}
          // onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            // marginBottom: 8,
            // display: 'block',
            marginRight: '6px'
          }}
        />
        <CloseCircleOutlined style={{ fontSize: '15px' }}
          onClick={() => {
            setSelectedKeys([]);
            setSearchText('');
            // close();
            confirm({ closeDropdown: false }); // Apply the filter without closing dropdown
            clearFilters();
          }}

        />
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
          fontSize: '21px'
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  return { getColumnSearchProps, handleSearch };
}

export default useTableColumnSearch;