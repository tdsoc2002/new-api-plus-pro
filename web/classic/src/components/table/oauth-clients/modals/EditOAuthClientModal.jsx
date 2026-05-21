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

import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../../../helpers';
import { useIsMobile } from '../../../../hooks/common/useIsMobile';
import {
  Button,
  SideSheet,
  Space,
  Spin,
  Typography,
  Card,
  Tag,
  Form,
  Avatar,
  Row,
  Col,
  Switch,
  TextArea,
  Modal,
} from '@douyinfe/semi-ui';
import {
  IconSave,
  IconClose,
  IconKey,
  IconSetting,
  IconCopy,
} from '@douyinfe/semi-icons';

const { Text, Title } = Typography;

const EditOAuthClientModal = (props) => {
  const { t } = useTranslation();
  const clientId = props.editingClient?.id;
  const [loading, setLoading] = useState(false);
  const [newClientSecret, setNewClientSecret] = useState(null);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const isMobile = useIsMobile();
  const formApiRef = useRef(null);

  const isEdit = Boolean(clientId);

  const getInitValues = () => ({
    name: '',
    description: '',
    redirect_uris: '',
    scopes: 'openai',
    enabled: true,
    require_https: true,
  });

  const handleCancel = () => {
    props.handleClose();
    setNewClientSecret(null);
  };

  const loadClient = async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/oauth-clients/${clientId}`);
      const { success, message, data } = res.data;
      if (success) {
        formApiRef.current?.setValues(data);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (props.visible) {
      if (isEdit) {
        loadClient();
      } else {
        formApiRef.current?.setValues(getInitValues());
      }
    }
  }, [props.visible, clientId]);

  const submit = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values };
      const url = isEdit ? `/api/oauth-clients/${clientId}` : '/api/oauth-clients';
      const method = isEdit ? 'put' : 'post';
      const res = await API[method](url, payload);
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(t(isEdit ? '更新成功' : '创建成功'));
        if (!isEdit && data.client_secret) {
          // Show the client secret only once for new clients
          setNewClientSecret(data.client_secret);
          setShowSecretModal(true);
        }
        props.refresh();
        if (isEdit) {
          props.handleClose();
        }
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

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

  const handleSecretModalClose = () => {
    setShowSecretModal(false);
    setNewClientSecret(null);
    props.handleClose();
  };

  return (
    <>
      <SideSheet
        placement='right'
        title={
          <Space>
            <Tag color='blue' shape='circle'>
              {t(isEdit ? '编辑' : '新建')}
            </Tag>
            <Title heading={4} className='m-0'>
              {isEdit ? t('编辑 OAuth 客户端') : t('创建 OAuth 客户端')}
            </Title>
          </Space>
        }
        bodyStyle={{ padding: 0 }}
        visible={props.visible}
        width={isMobile ? '100%' : 600}
        footer={
          <div className='flex justify-end bg-white'>
            <Space>
              <Button
                theme='solid'
                onClick={() => formApiRef.current?.submitForm()}
                icon={<IconSave />}
                loading={loading}
              >
                {t('提交')}
              </Button>
              <Button
                theme='light'
                type='primary'
                onClick={handleCancel}
                icon={<IconClose />}
              >
                {t('取消')}
              </Button>
            </Space>
          </div>
        }
        closeIcon={null}
        onCancel={handleCancel}
      >
        <Spin spinning={loading}>
          <Form
            initValues={getInitValues()}
            getFormApi={(api) => (formApiRef.current = api)}
            onSubmit={submit}
          >
            {({ values }) => (
              <div className='p-2 space-y-3'>
                {/* 基本信息 */}
                <Card className='!rounded-2xl shadow-sm border-0'>
                  <div className='flex items-center mb-2'>
                    <Avatar
                      size='small'
                      color='blue'
                      className='mr-2 shadow-md'
                    >
                      <IconKey size={16} />
                    </Avatar>
                    <div>
                      <Text className='text-lg font-medium'>
                        {t('基本信息')}
                      </Text>
                      <div className='text-xs text-gray-600'>
                        {t('客户端的基本配置信息')}
                      </div>
                    </div>
                  </div>

                  <Row gutter={12}>
                    <Col span={24}>
                      <Form.Input
                        field='name'
                        label={t('名称')}
                        placeholder={t('请输入客户端名称')}
                        rules={[{ required: true, message: t('请输入名称') }]}
                        showClear
                      />
                    </Col>

                    <Col span={24}>
                      <Form.TextArea
                        field='description'
                        label={t('描述')}
                        placeholder={t('请输入客户端描述（可选）')}
                        autosize={{ minRows: 2, maxRows: 4 }}
                        showClear
                      />
                    </Col>
                  </Row>
                </Card>

                {/* OAuth 配置 */}
                <Card className='!rounded-2xl shadow-sm border-0'>
                  <div className='flex items-center mb-2'>
                    <Avatar
                      size='small'
                      color='green'
                      className='mr-2 shadow-md'
                    >
                      <IconSetting size={16} />
                    </Avatar>
                    <div>
                      <Text className='text-lg font-medium'>
                        {t('OAuth 配置')}
                      </Text>
                      <div className='text-xs text-gray-600'>
                        {t('授权和访问控制配置')}
                      </div>
                    </div>
                  </div>

                  <Row gutter={12}>
                    <Col span={24}>
                      <Form.TextArea
                        field='redirect_uris'
                        label={t('重定向 URI')}
                        placeholder={t('每行一个 URI，例如：\nhttps://example.com/callback\nhttps://app.example.com/oauth/callback')}
                        rules={[{ required: true, message: t('请输入至少一个重定向 URI') }]}
                        autosize={{ minRows: 3, maxRows: 6 }}
                        showClear
                      />
                      <Text size='small' type='tertiary' className='block mt-1'>
                        {t('授权后重定向的 URL，每行一个')}
                      </Text>
                    </Col>

                    <Col span={24}>
                      <Form.Input
                        field='scopes'
                        label={t('作用域')}
                        placeholder={t('例如：openai chat completions')}
                        rules={[{ required: true, message: t('请输入作用域') }]}
                        showClear
                      />
                      <Text size='small' type='tertiary' className='block mt-1'>
                        {t('空格分隔的作用域列表')}
                      </Text>
                    </Col>

                    <Col span={12}>
                      <Form.Slot label={t('启用状态')}>
                        <Form.Switch field='enabled' />
                      </Form.Slot>
                    </Col>

                    <Col span={12}>
                      <Form.Slot label={t('要求 HTTPS')}>
                        <Form.Switch field='require_https' />
                      </Form.Slot>
                    </Col>
                  </Row>
                </Card>
              </div>
            )}
          </Form>
        </Spin>
      </SideSheet>

      {/* Client Secret 显示模态框 */}
      <Modal
        title={
          <div className='flex items-center'>
            <IconKey className='mr-2' />
            {t('客户端密钥')}
          </div>
        }
        visible={showSecretModal}
        onOk={handleSecretModalClose}
        onCancel={handleSecretModalClose}
        closable={false}
        footer={
          <Button type='primary' onClick={handleSecretModalClose}>
            {t('我已保存密钥')}
          </Button>
        }
      >
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
                {newClientSecret}
              </code>
              <Button
                icon={<IconCopy />}
                onClick={() => copyToClipboard(newClientSecret, 'Client Secret')}
              >
                {t('复制')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditOAuthClientModal;
