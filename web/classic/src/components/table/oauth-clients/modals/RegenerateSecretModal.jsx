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
import { Modal, Typography, Button } from '@douyinfe/semi-ui';
import { IconRefresh, IconCopy, IconKey } from '@douyinfe/semi-icons';
import { showSuccess, showError } from '../../../../helpers';

const { Text } = Typography;

const RegenerateSecretModal = ({
  visible,
  onCancel,
  client,
  regenerateSecret,
  t,
}) => {
  const [loading, setLoading] = useState(false);
  const [newSecret, setNewSecret] = useState(null);
  const [step, setStep] = useState('confirm'); // 'confirm' or 'show'

  const handleConfirm = async () => {
    if (!client) return;
    setLoading(true);
    const secret = await regenerateSecret(client.id);
    setLoading(false);
    if (secret) {
      setNewSecret(secret);
      setStep('show');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setNewSecret(null);
    onCancel();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showSuccess(t('Client Secret 已复制到剪贴板'));
      },
      () => {
        showError(t('复制失败'));
      }
    );
  };

  return (
    <Modal
      title={
        <div className='flex items-center'>
          {step === 'confirm' ? (
            <>
              <IconRefresh className='mr-2 text-orange-500' />
              {t('重新生成密钥')}
            </>
          ) : (
            <>
              <IconKey className='mr-2 text-blue-500' />
              {t('新的客户端密钥')}
            </>
          )}
        </div>
      }
      visible={visible}
      onOk={step === 'confirm' ? handleConfirm : handleClose}
      onCancel={handleClose}
      confirmLoading={loading}
      okText={step === 'confirm' ? t('重新生成') : t('我已保存密钥')}
      cancelText={t('取消')}
      okButtonProps={
        step === 'confirm'
          ? { type: 'warning' }
          : { type: 'primary' }
      }
      closable={false}
    >
      {step === 'confirm' ? (
        <div className='space-y-3'>
          <Text>
            {t('确定要为以下客户端重新生成密钥吗？')}
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
            </div>
          )}
          <div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded p-3'>
            <Text className='text-orange-700 dark:text-orange-300 text-sm'>
              ⚠️ {t('重新生成后，旧密钥将立即失效，使用旧密钥的应用将无法继续授权。')}
            </Text>
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3'>
            <Text strong className='text-yellow-800 dark:text-yellow-200'>
              ⚠️ {t('重要提示')}
            </Text>
            <div className='text-sm text-yellow-700 dark:text-yellow-300 mt-1'>
              {t('请立即保存此密钥，关闭后将无法再次查看！')}
            </div>
          </div>

          <div>
            <Text strong className='block mb-2'>Client Secret:</Text>
            <div className='flex items-center gap-2'>
              <code className='flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-sm break-all'>
                {newSecret}
              </code>
              <Button
                icon={<IconCopy />}
                onClick={() => copyToClipboard(newSecret)}
              >
                {t('复制')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RegenerateSecretModal;
