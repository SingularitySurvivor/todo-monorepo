import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTodoLists } from '../../hooks';
import { ListHeader, ListGrid, CreateListDialog, EditListDialog, MembersDialog } from '../../components/todo-lists';
import { ListQueryParams, TodoListWithPermissions } from '@todo-app/client-common';
import { todoListAPI } from '../../utils/apiClient';

const TodoListsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [params, setParams] = useState<ListQueryParams>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<TodoListWithPermissions | null>(null);
  
  const { lists, loading, error, total, page, totalPages, refetch, setFilters, getConnectionStatus } = useTodoLists(params);
  
  // Get real-time connection status from the hook
  const connectionStatus = getConnectionStatus();

  // Update selectedList when lists data changes (e.g., after refetch from SSE)
  useEffect(() => {
    if (selectedList && lists.length > 0) {
      const updatedList = lists.find(list => list.id === selectedList.id);
      if (updatedList) {
        setSelectedList(updatedList);
      }
    }
  }, [lists, selectedList]);

  // Handle edit URL parameter
  useEffect(() => {
    const editListId = searchParams.get('edit');
    if (editListId && lists.length > 0) {
      const listToEdit = lists.find(list => list.id === editListId);
      if (listToEdit) {
        setSelectedList(listToEdit);
        setEditDialogOpen(true);
        // Remove the edit parameter from URL
        searchParams.delete('edit');
        setSearchParams(searchParams);
      }
    }
  }, [lists, searchParams, setSearchParams]);



  const handlePageChange = (newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }));
    setFilters({ ...params, page: newPage });
  };

  const handleCreateList = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleListClick = (list: any) => {
    navigate(`/lists/${list.id}`);
  };

  const handleEditList = (list: TodoListWithPermissions) => {
    setSelectedList(list);
    setEditDialogOpen(true);
  };

  const handleDeleteList = async (list: TodoListWithPermissions) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${list.name}"?\n\nThis action cannot be undone and will permanently delete the list and all its todos.`
    );
    
    if (confirmed) {
      try {
        await todoListAPI.deleteList(list.id);
        refetch(); // Refresh the list after deletion
      } catch (error) {
        console.error('Failed to delete list:', error);
        alert('Failed to delete the list. Please try again.');
      }
    }
  };


  const handleManageMembers = (list: TodoListWithPermissions) => {
    setSelectedList(list);
    setMembersDialogOpen(true);
  };

  const handleEditSuccess = () => {
    refetch(); // Refetch lists to get updated information
    setEditDialogOpen(false);
    setSelectedList(null);
  };

  const handleMembersSuccess = async () => {
    // Refetch lists to get updated member information
    await refetch();
    // selectedList will be updated automatically by useEffect below
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <ListHeader
        title="Dashboard"
        subtitle="Organize and collaborate on your todo lists"
        totalCount={total}
        connectionStatus={connectionStatus}
        onCreateList={handleCreateList}
        showCreateButton={true}
        showFilters={false}
      />

      <ListGrid
        lists={lists}
        loading={loading}
        error={error}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onListClick={handleListClick}
        onEditList={handleEditList}
        onDeleteList={handleDeleteList}
        onManageMembers={handleManageMembers}
        onCreateList={handleCreateList}
        emptyStateTitle="No todo lists found"
        emptyStateMessage="Create your first todo list to start organizing your tasks and collaborating with others."
        showCreateButton={true}
      />

      <CreateListDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditListDialog
        open={editDialogOpen}
        list={selectedList}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedList(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <MembersDialog
        open={membersDialogOpen}
        list={selectedList}
        onClose={() => {
          setMembersDialogOpen(false);
          setSelectedList(null);
        }}
        onSuccess={handleMembersSuccess}
      />
    </Container>
  );
};

export default TodoListsPage;