/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Button, Popover, Tag, Tooltip } from '@douyinfe/semi-ui';
import { IconMore, IconEdit, IconDelete, IconRefresh, IconCopy } from '@douyinfe/semi-icons';
import { showSuccess, showError } from '../../../helpers';

export const getOAuthClientsColumns = ({
  t,
  setEditingClient,
  setShowEditClient,
  showDeleteModal,
  showRegenerateSecretModal,
}) => {
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showSuccess(t(`${label}已复制到剪贴板`));
      },
      () => {
        showError(t('复制失败'));
      }
    );
  };

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: t('名称'),
      dataIndex: 'name',
      width: 150,
      render: (text, record) => (
        <div className='flex flex-col'>
          <span className='font-medium'>{text}</span>
          {record.description && (
            <span className='text-xs text-gray-500'>{record.description}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Client ID',
      dataIndex: 'client_id',
      width: 200,
      render: (text) => (
        <div className='flex items-center gap-2'>
          <code className='text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
            {text}
          </code>
          <Tooltip content={t('复制')}>
            <Button
              icon={<IconCopy />}
              type='tertiary'
              size='small'
              onClick={() => copyToClipboard(text, 'Client ID')}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: t('重定向 URI'),
      dataIndex: 'redirect_uris',
      width: 250,
      render: (text) => {
        if (!text) return '-';
        const uris = text.split(',').filter(uri => uri.trim());
        if (uris.length === 0) return '-';
        if (uris.length === 1) {
          return <code className='text-xs'>{uris[0]}</code>;
        }
        return (
          <Popover
            content={
              <div className='flex flex-col gap-1 max-w-md'>
                {uris.map((uri, idx) => (
                  <code key={idx} className='text-xs block'>
                    {uri}
                  </code>
                ))}
              </div>
            }
            trigger='hover'
          >
            <span className='cursor-pointer text-blue-600 hover:underline'>
              {uris.length} {t('个 URI')}
            </span>
          </Popover>
        );
      },
    },
    {
      title: t('作用域'),
      dataIndex: 'scopes',
      width: 200,
      render: (text) => {
        if (!text) return '-';
        const scopes = text.split(' ').filter(s => s.trim());
        if (scopes.length === 0) return '-';
        return (
          <div className='flex flex-wrap gap-1'>
            {scopes.slice(0, 3).map((scope, idx) => (
              <Tag key={idx} size='small'>{scope}</Tag>
            ))}
            {scopes.length > 3 && (
              <Popover
                content={
                  <div className='flex flex-wrap gap-1 max-w-md'>
                    {scopes.slice(3).map((scope, idx) => (
                      <Tag key={idx} size='small'>{scope}</Tag>
                    ))}
                  </div>
                }
                trigger='hover'
              >
                <Tag size='small' className='cursor-pointer'>
                  +{scopes.length - 3}
                </Tag>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      title: t('状态'),
      dataIndex: 'enabled',
      width: 100,
      render: (enabled) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? t('已启用') : t('已禁用')}
        </Tag>
      ),
    },
    {
      title: t('HTTPS'),
      dataIndex: 'require_https',
      width: 100,
      render: (requireHttps) => (
        <Tag color={requireHttps ? 'blue' : 'grey'}>
          {requireHttps ? t('必需') : t('可选')}
        </Tag>
      ),
    },
    {
      title: t('创建时间'),
      dataIndex: 'created_at',
      width: 180,
      render: (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp * 1000).toLocaleString('zh-CN');
      },
    },
    {
      title: t('操作'),
      dataIndex: 'operate',
      fixed: 'right',
      width: 200,
      render: (text, record) => (
        <div className='flex gap-2'>
          <Button
            theme='borderless'
            type='primary'
            size='small'
            icon={<IconEdit />}
            onClick={() => {
              setEditingClient(record);
              setShowEditClient(true);
            }}
          >
            {t('编辑')}
          </Button>
          <Popover
            content={
              <div className='flex flex-col gap-2 p-2'>
                <Button
                  theme='borderless'
                  type='warning'
                  size='small'
                  icon={<IconRefresh />}
                  onClick={() => showRegenerateSecretModal(record)}
                  block
                >
                  {t('重新生成密钥')}
                </Button>
                <Button
                  theme='borderless'
                  type='danger'
                  size='small'
                  icon={<IconDelete />}
                  onClick={() => showDeleteModal(record)}
                  block
                >
                  {t('删除')}
                </Button>
              </div>
            }
            trigger='click'
            position='bottomRight'
          >
            <Button
              theme='borderless'
              type='tertiary'
              size='small'
              icon={<IconMore />}
            />
          </Popover>
        </div>
      ),
    },
  ];
};
