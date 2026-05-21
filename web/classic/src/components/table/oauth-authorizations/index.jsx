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

import React, { useEffect, useState, useCallback } from 'react';
import { Toast } from '@douyinfe/semi-ui';
import { API, showError } from '../../../helpers';
import CardPro from '../../common/ui/CardPro';
import OAuthAuthorizationsTable from './OAuthAuthorizationsTable';
import OAuthAuthorizationsFilters from './OAuthAuthorizationsFilters';
import OAuthAuthorizationsDescription from './OAuthAuthorizationsDescription';
import { useTranslation } from 'react-i18next';

function OAuthAuthorizationsPage() {
  const { t } = useTranslation();
  const [authorizations, setAuthorizations] = useState([]);
  const [filteredAuthorizations, setFilteredAuthorizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [formApi, setFormApi] = useState(null);

  const formInitValues = {
    keyword: '',
  };

  // Load authorizations
  const loadAuthorizations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/user/oauth-authorizations');
      const { success, message, data } = res.data;
      if (success) {
        setAuthorizations(data || []);
        setFilteredAuthorizations(data || []);
      } else {
        showError(t(message));
      }
    } catch (error) {
      showError(error.message || t('加载授权列表失败'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Search authorizations
  const searchAuthorizations = useCallback(
    (values) => {
      setSearching(true);
      const keyword = values.keyword?.trim().toLowerCase() || '';

      if (!keyword) {
        setFilteredAuthorizations(authorizations);
      } else {
        const filtered = authorizations.filter((auth) =>
          auth.client_name?.toLowerCase().includes(keyword),
        );
        setFilteredAuthorizations(filtered);
      }

      setSearching(false);
    },
    [authorizations],
  );

  // Revoke authorization
  const handleRevoke = useCallback(
    async (clientId) => {
      try {
        const res = await API.delete(
          `/api/user/oauth-authorizations/${clientId}`,
        );
        const { success, message } = res.data;
        if (success) {
          Toast.success(t('撤销授权成功'));
          await loadAuthorizations();
          // Reset search
          if (formApi) {
            formApi.reset();
          }
        } else {
          showError(t(message));
        }
      } catch (error) {
        showError(error.message || t('撤销授权失败'));
      }
    },
    [t, loadAuthorizations, formApi],
  );

  useEffect(() => {
    loadAuthorizations();
  }, [loadAuthorizations]);

  return (
    <CardPro
      type='type1'
      descriptionArea={<OAuthAuthorizationsDescription t={t} />}
      actionsArea={
        <div className='w-full'>
          <OAuthAuthorizationsFilters
            formInitValues={formInitValues}
            setFormApi={setFormApi}
            searchAuthorizations={searchAuthorizations}
            loading={loading}
            searching={searching}
            t={t}
          />
        </div>
      }
      t={t}
    >
      <OAuthAuthorizationsTable
        authorizations={filteredAuthorizations}
        loading={loading}
        handleRevoke={handleRevoke}
        t={t}
      />
    </CardPro>
  );
}

export default OAuthAuthorizationsPage;
