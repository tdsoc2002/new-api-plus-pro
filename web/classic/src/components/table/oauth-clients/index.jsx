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
import CardPro from '../../common/ui/CardPro';
import OAuthClientsTable from './OAuthClientsTable';
import OAuthClientsActions from './OAuthClientsActions';
import OAuthClientsFilters from './OAuthClientsFilters';
import OAuthClientsDescription from './OAuthClientsDescription';
import EditOAuthClientModal from './modals/EditOAuthClientModal';
import { useOAuthClientsData } from '../../../hooks/oauth-clients/useOAuthClientsData';
import { useIsMobile } from '../../../hooks/common/useIsMobile';
import { createCardProPagination } from '../../../helpers/utils';

const OAuthClientsPage = () => {
  const clientsData = useOAuthClientsData();
  const isMobile = useIsMobile();

  const {
    // Modal state
    showAddClient,
    showEditClient,
    editingClient,
    setShowAddClient,
    closeAddClient,
    closeEditClient,
    refresh,

    // Form state
    formInitValues,
    setFormApi,
    searchClients,
    loadClients,
    activePage,
    pageSize,
    loading,
    searching,

    // Description state
    compactMode,
    setCompactMode,

    // Translation
    t,
  } = clientsData;

  return (
    <>
      <EditOAuthClientModal
        refresh={refresh}
        visible={showAddClient}
        handleClose={closeAddClient}
        editingClient={{}}
      />

      <EditOAuthClientModal
        refresh={refresh}
        visible={showEditClient}
        handleClose={closeEditClient}
        editingClient={editingClient}
      />

      <CardPro
        type='type1'
        descriptionArea={
          <OAuthClientsDescription
            compactMode={compactMode}
            setCompactMode={setCompactMode}
            t={t}
          />
        }
        actionsArea={
          <div className='flex flex-col md:flex-row justify-between items-center gap-2 w-full'>
            <OAuthClientsActions setShowAddClient={setShowAddClient} t={t} />

            <OAuthClientsFilters
              formInitValues={formInitValues}
              setFormApi={setFormApi}
              searchClients={searchClients}
              loadClients={loadClients}
              activePage={activePage}
              pageSize={pageSize}
              loading={loading}
              searching={searching}
              t={t}
            />
          </div>
        }
        paginationArea={createCardProPagination({
          currentPage: clientsData.activePage,
          pageSize: clientsData.pageSize,
          total: clientsData.clientCount,
          onPageChange: clientsData.handlePageChange,
          onPageSizeChange: clientsData.handlePageSizeChange,
          isMobile: isMobile,
          t: clientsData.t,
        })}
        t={clientsData.t}
      >
        <OAuthClientsTable {...clientsData} />
      </CardPro>
    </>
  );
};

export default OAuthClientsPage;
