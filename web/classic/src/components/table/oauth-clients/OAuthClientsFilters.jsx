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
import { Form, Button } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';

const OAuthClientsFilters = ({
  formInitValues,
  setFormApi,
  searchClients,
  loadClients,
  activePage,
  pageSize,
  loading,
  searching,
  t,
}) => {
  const handleSubmit = (values) => {
    searchClients(activePage, pageSize, values.searchKeyword, values.searchEnabled);
  };

  const handleReset = () => {
    loadClients(activePage, pageSize);
  };

  return (
    <Form
      layout='horizontal'
      initValues={formInitValues}
      getFormApi={(formApi) => setFormApi(formApi)}
      onSubmit={handleSubmit}
      className='flex flex-col md:flex-row gap-2 items-end'
    >
      <Form.Input
        field='searchKeyword'
        placeholder={t('搜索客户端名称或 Client ID')}
        showClear
        style={{ width: 200 }}
      />
      <Form.Select
        field='searchEnabled'
        placeholder={t('状态')}
        showClear
        style={{ width: 120 }}
      >
        <Form.Select.Option value='true'>{t('已启用')}</Form.Select.Option>
        <Form.Select.Option value='false'>{t('已禁用')}</Form.Select.Option>
      </Form.Select>
      <div className='flex gap-2'>
        <Button
          type='primary'
          htmlType='submit'
          icon={<IconSearch />}
          loading={loading || searching}
        >
          {t('搜索')}
        </Button>
        <Button htmlType='reset' onClick={handleReset} loading={loading}>
          {t('重置')}
        </Button>
      </div>
    </Form>
  );
};

export default OAuthClientsFilters;
