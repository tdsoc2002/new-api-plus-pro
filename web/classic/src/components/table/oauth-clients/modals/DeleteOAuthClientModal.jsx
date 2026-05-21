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

import React, { useState } from 'react';
import { Modal, Typography } from '@douyinfe/semi-ui';
import { IconAlertTriangle } from '@douyinfe/semi-icons';

const { Text } = Typography;

const DeleteOAuthClientModal = ({
  visible,
  onCancel,
  client,
  deleteClient,
  refresh,
  t,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!client) return;
    setLoading(true);
    await deleteClient(client.id);
    setLoading(false);
    onCancel();
  };

  return (
    <Modal
      title={
        <div className='flex items-center'>
          <IconAlertTriangle className='mr-2 text-red-500' />
          {t('确认删除')}
        </div>
      }
      visible={visible}
      onOk={handleConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={t('删除')}
      cancelText={t('取消')}
      okButtonProps={{ type: 'danger' }}
    >
      <div className='space-y-3'>
        <Text>
          {t('确定要删除以下 OAuth 客户端吗？此操作无法撤销。')}
        </Text>
        {client && (
          <div className='bg-gray-50 dark:bg-gray-800 rounded p-3 space-y-2'>
            <div>
              <Text strong>{t('名称')}:</Text> {client.name}
            </div>
            <div>
              <Text strong>Client ID:</Text>{' '}
              <code className='text-xs'>{client.client_id}</code>
            </div>
            {client.description && (
              <div>
                <Text strong>{t('描述')}:</Text> {client.description}
              </div>
            )}
          </div>
        )}
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3'>
          <Text className='text-red-700 dark:text-red-300 text-sm'>
            ⚠️ {t('删除后，使用此客户端的所有应用将无法继续授权。')}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteOAuthClientModal;
