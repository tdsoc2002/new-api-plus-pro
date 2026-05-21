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

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API, showError, showSuccess } from '../../helpers';
import { ITEMS_PER_PAGE } from '../../constants';
import { useTableCompactMode } from '../common/useTableCompactMode';

export const useOAuthClientsData = () => {
  const { t } = useTranslation();
  const [compactMode, setCompactMode] = useTableCompactMode('oauth-clients');

  // State management
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [searching, setSearching] = useState(false);
  const [clientCount, setClientCount] = useState(0);

  // Modal states
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [editingClient, setEditingClient] = useState({
    id: undefined,
  });

  // Form initial values
  const formInitValues = {
    searchKeyword: '',
    searchEnabled: '',
  };

  // Form API reference
  const [formApi, setFormApi] = useState(null);

  // Get form values helper function
  const getFormValues = () => {
    const formValues = formApi ? formApi.getValues() : {};
    return {
      searchKeyword: formValues.searchKeyword || '',
      searchEnabled: formValues.searchEnabled || '',
    };
  };

  // Set client format with key field
  const setClientFormat = (clients) => {
    for (let i = 0; i < clients.length; i++) {
      clients[i].key = clients[i].id;
    }
    setClients(clients);
  };

  // Load clients data
  const loadClients = async (startIdx, pageSize) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/oauth-clients?p=${startIdx}&page_size=${pageSize}`);
      const { success, message, data } = res.data;
      if (success) {
        const newPageData = data.items || [];
        setActivePage(data.page || 1);
        setClientCount(data.total || 0);
        setClientFormat(newPageData);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  // Search clients with keyword and enabled status
  const searchClients = async (
    startIdx,
    pageSize,
    searchKeyword = null,
    searchEnabled = null,
  ) => {
    // If no parameters passed, get values from form
    if (searchKeyword === null || searchEnabled === null) {
      const formValues = getFormValues();
      searchKeyword = formValues.searchKeyword;
      searchEnabled = formValues.searchEnabled;
    }

    if (searchKeyword === '' && searchEnabled === '') {
      // If keyword is blank, load clients instead
      await loadClients(startIdx, pageSize);
      return;
    }
    setSearching(true);
    try {
      const res = await API.get(
        `/api/oauth-clients/search?keyword=${searchKeyword}&enabled=${searchEnabled}&p=${startIdx}&page_size=${pageSize}`,
      );
      const { success, message, data } = res.data;
      if (success) {
        const newPageData = data.items || [];
        setActivePage(data.page || 1);
        setClientCount(data.total || 0);
        setClientFormat(newPageData);
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setSearching(false);
  };

  // Delete client
  const deleteClient = async (clientId) => {
    setLoading(true);
    try {
      const res = await API.delete(`/api/oauth-clients/${clientId}`);
      const { success, message } = res.data;
      if (success) {
        showSuccess(t('删除成功'));
        await refresh();
      } else {
        showError(message);
      }
    } catch (error) {
      showError(error.message);
    }
    setLoading(false);
  };

  // Regenerate client secret
  const regenerateSecret = async (clientId) => {
    try {
      const res = await API.post(`/api/oauth-clients/${clientId}/regenerate-secret`);
      const { success, message, data } = res.data;
      if (success) {
        showSuccess(t('密钥已重新生成'));
        return data.client_secret;
      } else {
        showError(message);
        return null;
      }
    } catch (error) {
      showError(error.message);
      return null;
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setActivePage(page);
    const { searchKeyword, searchEnabled } = getFormValues();
    if (searchKeyword === '' && searchEnabled === '') {
      loadClients(page, pageSize).then();
    } else {
      searchClients(page, pageSize, searchKeyword, searchEnabled).then();
    }
  };

  // Handle page size change
  const handlePageSizeChange = async (size) => {
    localStorage.setItem('page-size', size + '');
    setPageSize(size);
    setActivePage(1);
    loadClients(1, size)
      .then()
      .catch((reason) => {
        showError(reason);
      });
  };

  // Handle table row styling for disabled clients
  const handleRow = (record, index) => {
    if (!record.enabled) {
      return {
        style: {
          background: 'var(--semi-color-disabled-border)',
        },
      };
    } else {
      return {};
    }
  };

  // Refresh data
  const refresh = async (page = activePage) => {
    const { searchKeyword, searchEnabled } = getFormValues();
    if (searchKeyword === '' && searchEnabled === '') {
      await loadClients(page, pageSize);
    } else {
      await searchClients(page, pageSize, searchKeyword, searchEnabled);
    }
  };

  // Modal control functions
  const closeAddClient = () => {
    setShowAddClient(false);
  };

  const closeEditClient = () => {
    setShowEditClient(false);
    setEditingClient({
      id: undefined,
    });
  };

  // Initialize data on component mount
  useEffect(() => {
    loadClients(1, pageSize)
      .then()
      .catch((reason) => {
        showError(reason);
      });
  }, []);

  return {
    // Data state
    clients,
    loading,
    activePage,
    pageSize,
    clientCount,
    searching,

    // Modal state
    showAddClient,
    showEditClient,
    editingClient,
    setShowAddClient,
    setShowEditClient,
    setEditingClient,

    // Form state
    formInitValues,
    formApi,
    setFormApi,

    // UI state
    compactMode,
    setCompactMode,

    // Actions
    loadClients,
    searchClients,
    deleteClient,
    regenerateSecret,
    handlePageChange,
    handlePageSizeChange,
    handleRow,
    refresh,
    closeAddClient,
    closeEditClient,
    getFormValues,

    // Translation
    t,
  };
};
