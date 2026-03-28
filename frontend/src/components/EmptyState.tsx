import React from 'react';
import { Empty, Button, Space, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface EmptyStateProps {
  /** 空状态类型 */
  type?: 'products' | 'orders' | 'customers' | 'messages' | 'categories' | 'brands' | 'custom';
  /** 自定义标题 */
  title?: string;
  /** 自定义描述 */
  description?: string;
  /** 自定义图标 */
  icon?: React.ReactNode;
  /** 主操作按钮 */
  onPrimaryAction?: () => void;
  /** 主操作按钮文本 */
  primaryActionText?: string;
  /** 次要操作按钮 */
  onSecondaryAction?: () => void;
  /** 次要操作按钮文本 */
  secondaryActionText?: string;
  /** 是否显示刷新按钮 */
  showRefresh?: boolean;
  /** 自定义额外内容 */
  extra?: React.ReactNode;
}

const defaultContent: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  products: {
    title: '暂无商品',
    description: '开始添加您的第一个商品，开启销售之旅',
    icon: <span style={{ fontSize: 64 }}>📦</span>,
  },
  orders: {
    title: '暂无订单',
    description: '当有客户下单时，订单会显示在这里',
    icon: <span style={{ fontSize: 64 }}>🛒</span>,
  },
  customers: {
    title: '暂无客户',
    description: '当有客户注册时，会显示在这里',
    icon: <span style={{ fontSize: 64 }}>👥</span>,
  },
  messages: {
    title: '暂无消息',
    description: '暂时没有新的询价或联系请求',
    icon: <span style={{ fontSize: 64 }}>📧</span>,
  },
  categories: {
    title: '暂无分类',
    description: '创建第一个商品分类，组织您的商品',
    icon: <span style={{ fontSize: 64 }}>📁</span>,
  },
  brands: {
    title: '暂无品牌',
    description: '添加第一个品牌，丰富商品库',
    icon: <span style={{ fontSize: 64 }}>🏷️</span>,
  },
  custom: {
    title: '暂无数据',
    description: '数据为空',
    icon: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ fontSize: 64 }} />,
  },
};

/**
 * 空状态组件
 * 
 * 用于列表页、数据展示页为空时显示
 * 提供友好的引导和操作建议
 */
export default function EmptyState({
  type = 'custom',
  title,
  description,
  icon,
  onPrimaryAction,
  primaryActionText,
  onSecondaryAction,
  secondaryActionText,
  showRefresh = false,
  extra,
}: EmptyStateProps) {
  const content = defaultContent[type] || defaultContent.custom;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      textAlign: 'center',
    }}>
      {/* 图标 */}
      <div style={{ 
        marginBottom: 24,
        color: '#d9d9d9',
        fontSize: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon || content.icon}
      </div>
      
      {/* 标题 */}
      {title && (
        <div style={{
          fontSize: 16,
          fontWeight: 500,
          color: '#595959',
          marginBottom: 8,
        }}>
          {title}
        </div>
      )}
      
      {/* 描述 */}
      {description && (
        <Text type="secondary" style={{
          fontSize: 14,
          marginBottom: 24,
          maxWidth: 400,
        }}>
          {description}
        </Text>
      )}
      
      {/* 操作按钮 */}
      <Space size="middle" wrap>
        {onPrimaryAction && primaryActionText && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onPrimaryAction}
            size="large"
          >
            {primaryActionText}
          </Button>
        )}
        
        {onSecondaryAction && secondaryActionText && (
          <Button 
            onClick={onSecondaryAction}
            size="large"
          >
            {secondaryActionText}
          </Button>
        )}
        
        {showRefresh && (
          <Button 
            icon={<ReloadOutlined />} 
            onClick={() => window.location.reload()}
            size="large"
          >
            刷新
          </Button>
        )}
        
        {extra}
      </Space>
    </div>
  );
}

/**
 * 使用示例:
 * 
 * // 基础用法
 * <EmptyState type="products" />
 * 
 * // 自定义操作
 * <EmptyState
 *   type="products"
 *   onPrimaryAction={() => navigate('/products/new')}
 *   primaryActionText="添加商品"
 *   onSecondaryAction={() => navigate('/categories')}
 *   secondaryActionText="管理分类"
 * />
 * 
 * // 完全自定义
 * <EmptyState
 *   title="没有找到相关商品"
 *   description="尝试调整搜索条件或筛选器"
 *   icon={<SearchOutlined style={{ fontSize: 64 }} />}
 *   onPrimaryAction={resetFilters}
 *   primaryActionText="重置筛选"
 *   showRefresh
 * />
 */
