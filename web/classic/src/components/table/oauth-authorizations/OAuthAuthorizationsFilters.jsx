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

const OAuthAuthorizationsFilters = ({
  formInitValues,
  setFormApi,
  searchAuthorizations,
  loading,
  searching,
  t,
}) => {
  return (
    <Form
      layout='horizontal'
      initValues={formInitValues}
      getFormApi={setFormApi}
      onSubmit={searchAuthorizations}
      className='w-full'
    >
      <div className='flex flex-col md:flex-row gap-2 w-full'>
        <Form.Input
          field='keyword'
          placeholder={t('搜索应用名称')}
          showClear
          className='flex-1'
        />
        <Button
          type='primary'
          htmlType='submit'
          icon={<IconSearch />}
          loading={loading || searching}
        >
          {t('搜索')}
        </Button>
      </div>
    </Form>
  );
};

export default OAuthAuthorizationsFilters;
