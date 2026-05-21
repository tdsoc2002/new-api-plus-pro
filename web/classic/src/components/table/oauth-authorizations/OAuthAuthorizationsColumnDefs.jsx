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
import { Button, Tag, Space, Modal } from '@douyinfe/semi-ui';
import { timestamp2string } from '../../../helpers';

// Render timestamp
function renderTimestamp(timestamp) {
  return timestamp ? timestamp2string(timestamp) : '-';
}

// Render scopes as tags
const renderScopes = (scopes, t) => {
  if (!scopes || scopes.trim() === '') {
    return <Tag color='grey'>{t('无权限')}</Tag>;
  }

  const scopeList = scopes.split(' ').filter(Boolean);

  return (
    <Space wrap>
      {scopeList.map((scope, idx) => (
        <Tag key={idx} color='blue' shape='circle'>
          {scope}
        </Tag>
      ))}
    </Space>
  );
};

// Render operations
const renderOperations = (text, record, handleRevoke, t) => {
  return (
    <Button
      type='danger'
      size='small'
      onClick={() => {
        Modal.confirm({
          title: t('确定撤销授权？'),
          content: t('撤销后，该应用将无法访问您的账户信息'),
          onOk: () => {
            handleRevoke(record.client_id);
          },
        });
      }}
    >
      {t('撤销授权')}
    </Button>
  );
};

export const getOAuthAuthorizationsColumns = ({ t, handleRevoke }) => {
  return [
    {
      title: t('应用名称'),
      dataIndex: 'client_name',
      key: 'client_name',
    },
    {
      title: t('授权范围'),
      dataIndex: 'scopes',
      key: 'scopes',
      render: (text) => renderScopes(text, t),
    },
    {
      title: t('授权时间'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => renderTimestamp(text),
    },
    {
      title: t('最后使用时间'),
      dataIndex: 'last_used_at',
      key: 'last_used_at',
      render: (text) => renderTimestamp(text),
    },
    {
      title: t('操作'),
      dataIndex: 'operate',
      key: 'operate',
      render: (text, record) => renderOperations(text, record, handleRevoke, t),
    },
  ];
};
