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

import React, { useMemo, useState } from 'react';
import { Empty } from '@douyinfe/semi-ui';
import CardTable from '../../common/ui/CardTable';
import {
  IllustrationNoResult,
  IllustrationNoResultDark,
} from '@douyinfe/semi-illustrations';
import { getOAuthClientsColumns } from './OAuthClientsColumnDefs';
import DeleteOAuthClientModal from './modals/DeleteOAuthClientModal';
import RegenerateSecretModal from './modals/RegenerateSecretModal';

const OAuthClientsTable = (clientsData) => {
  const {
    clients,
    loading,
    activePage,
    pageSize,
    clientCount,
    compactMode,
    handlePageChange,
    handlePageSizeChange,
    handleRow,
    setEditingClient,
    setShowEditClient,
    refresh,
    regenerateSecret,
    deleteClient,
    t,
  } = clientsData;

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRegenerateSecretModal, setShowRegenerateSecretModal] = useState(false);
  const [modalClient, setModalClient] = useState(null);

  // Modal handlers
  const showDeleteClientModal = (client) => {
    setModalClient(client);
    setShowDeleteModal(true);
  };

  const showRegenerateSecretClientModal = (client) => {
    setModalClient(client);
    setShowRegenerateSecretModal(true);
  };

  // Get all columns
  const columns = useMemo(() => {
    return getOAuthClientsColumns({
      t,
      setEditingClient,
      setShowEditClient,
      showDeleteModal: showDeleteClientModal,
      showRegenerateSecretModal: showRegenerateSecretClientModal,
    });
  }, [
    t,
    setEditingClient,
    setShowEditClient,
  ]);

  // Handle compact mode by removing fixed positioning
  const tableColumns = useMemo(() => {
    return compactMode
      ? columns.map((col) => {
          if (col.dataIndex === 'operate') {
            const { fixed, ...rest } = col;
            return rest;
          }
          return col;
        })
      : columns;
  }, [compactMode, columns]);

  return (
    <>
      <CardTable
        columns={tableColumns}
        dataSource={clients}
        scroll={compactMode ? undefined : { x: 'max-content' }}
        pagination={{
          currentPage: activePage,
          pageSize: pageSize,
          total: clientCount,
          pageSizeOpts: [10, 20, 50, 100],
          showSizeChanger: true,
          onPageSizeChange: handlePageSizeChange,
          onPageChange: handlePageChange,
        }}
        hidePagination={true}
        loading={loading}
        onRow={handleRow}
        empty={
          <Empty
            image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
            darkModeImage={
              <IllustrationNoResultDark style={{ width: 150, height: 150 }} />
            }
            description={t('暂无数据')}
            style={{ padding: 30 }}
          />
        }
        className='overflow-hidden'
        size='middle'
      />

      {/* Modal components */}
      <DeleteOAuthClientModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        client={modalClient}
        deleteClient={deleteClient}
        refresh={refresh}
        t={t}
      />

      <RegenerateSecretModal
        visible={showRegenerateSecretModal}
        onCancel={() => setShowRegenerateSecretModal(false)}
        client={modalClient}
        regenerateSecret={regenerateSecret}
        t={t}
      />
    </>
  );
};

export default OAuthClientsTable;
