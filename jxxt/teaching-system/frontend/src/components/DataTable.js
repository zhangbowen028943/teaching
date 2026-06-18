import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

/**
 * 通用分页表格组件
 * 封装 antd Table，内置分页器、搜索框、刷新按钮
 *
 * Props:
 *  - columns: 表格列定义
 *  - fetchData: (params) => Promise<{ data: [], pagination: { current, pageSize, total } }>  数据获取函数
 *  - searchPlaceholder: 搜索框占位文字
 *  - searchFields: 用于搜索的字段名数组，默认 ['keyword']
 *  - extra: 渲染在搜索栏右侧的额外元素
 *  - rowKey: 行唯一标识，默认 '_id'
 *  - defaultPageSize: 默认每页条数，默认 10
 */
const DataTable = ({
  columns,
  fetchData,
  searchPlaceholder = '请输入搜索关键词',
  searchFields = ['keyword'],
  extra,
  rowKey = '_id',
  defaultPageSize = 10,
  ...restProps
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: defaultPageSize,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const fetchIdRef = useRef(0);

  const loadData = useCallback(
    async (page = 1, pageSize = defaultPageSize, search = '') => {
      const fetchId = ++fetchIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const params = { page, pageSize };
        if (search && searchFields.length > 0) {
          searchFields.forEach((field) => {
            params[field] = search;
          });
        }

        const res = await fetchData(params);

        // 防止竞态：只有最新的请求结果才生效
        if (fetchId !== fetchIdRef.current) return;

        if (res && res.data) {
          setData(res.data);
          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize,
            total: res.pagination?.total ?? res.data.length,
          }));
        } else {
          setData([]);
          setPagination((prev) => ({ ...prev, current: page, pageSize, total: 0 }));
        }
      } catch (err) {
        if (fetchId !== fetchIdRef.current) return;
        setError(err?.response?.data?.message || err?.message || '数据加载失败');
        setData([]);
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchData, searchFields, defaultPageSize]
  );

  useEffect(() => {
    loadData(1, defaultPageSize, '');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTableChange = (pag) => {
    loadData(pag.current, pag.pageSize, searchText);
  };

  const handleSearch = () => {
    loadData(1, pagination.pageSize, searchText);
  };

  const handleRefresh = () => {
    setSearchText('');
    loadData(1, defaultPageSize, '');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 错误状态展示
  if (error && data.length === 0 && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Empty
          description={
            <span style={{ color: '#ff4d4f' }}>
              加载失败：{error}
            </span>
          }
        >
          <Button type="primary" onClick={handleRefresh}>
            重新加载
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      {/* 搜索栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Space>
          <Input
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: 260 }}
            allowClear
            prefix={<SearchOutlined />}
            onClear={() => {
              setSearchText('');
              loadData(1, pagination.pageSize, '');
            }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </Space>
        {extra && <div>{extra}</div>}
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey={rowKey}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
        onChange={handleTableChange}
        locale={{
          emptyText: <Empty description="暂无数据" />,
        }}
        {...restProps}
      />
    </div>
  );
};

export default DataTable;