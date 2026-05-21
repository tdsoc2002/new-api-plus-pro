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
import { Switch } from '@douyinfe/semi-ui';

const OAuthClientsDescription = ({ compactMode, setCompactMode, t }) => {
  return (
    <div className='flex flex-col gap-2'>
      <div className='text-base font-semibold'>{t('OAuth 客户端管理')}</div>
      <div className='text-sm text-gray-600 dark:text-gray-400'>
        {t('管理 OAuth 2.0 客户端应用，配置授权和访问权限')}
      </div>
      <div className='flex items-center gap-2 mt-2'>
        <Switch
          checked={compactMode}
          onChange={setCompactMode}
          aria-label='Toggle compact mode'
        />
        <span className='text-sm'>{t('紧凑模式')}</span>
      </div>
    </div>
  );
};

export default OAuthClientsDescription;
