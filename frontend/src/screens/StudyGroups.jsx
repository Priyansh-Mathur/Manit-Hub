import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, AlertCircle } from "lucide-react";
import StudyGroupCard from "../components/studyGroups/StudyGroupCard";
import StudyGroupFilters from "../components/studyGroups/StudyGroupFilters";
import CreateGroupModal from "../components/studyGroups/CreateGroupModal";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Skeleton from "../components/ui/Skeleton";
import { studyGroupsApi } from "../api/studyGroups";
import { useAuthContext } from "../context/useAuthContext";
import HubTabs from "../components/nav/HubTabs";

export default function StudyGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [actionError, setActionError] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({ search: "", subject: "", myGroups: false });
  const { user } = useAuthContext();

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const loadGroups = useCallback(async () => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.subject) params.subject = filters.subject;
      if (filters.myGroups) params.myGroups = "true";

      const response = await studyGroupsApi.getStudyGroups({
        ...params,
        page,
        limit: 12,
      });
      const payload = response.data?.data || {};
      setGroups(payload.groups || []);
      setMeta(payload.meta || null);
    } catch (error) {
      console.error("Error loading study groups:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async ({ data, coverFile }) => {
    try {
      const response = await studyGroupsApi.createStudyGroup(data);
      const createdGroup = response.data?.data;
      if (coverFile && createdGroup?._id) {
        await studyGroupsApi.uploadCover(createdGroup._id, coverFile);
      }
      setShowCreateModal(false);
      setActionError("");
      loadGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  const handleEditGroup = async ({ data, coverFile }) => {
    if (!editingGroup) return;
    try {
      await studyGroupsApi.updateStudyGroup(editingGroup._id, data);
      if (coverFile) {
        await studyGroupsApi.uploadCover(editingGroup._id, coverFile);
      }
      setEditingGroup(null);
      setActionError("");
      loadGroups();
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await studyGroupsApi.deleteStudyGroup(groupId);
      setActionError("");
      loadGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      setActionError(error.response?.data?.message || "Failed to delete group");
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await studyGroupsApi.joinStudyGroup(groupId);
      setActionError("");
      navigate(`/study-groups/${groupId}`);
    } catch (error) {
      console.error("Error joining group:", error);
      setActionError(error.response?.data?.message || "Failed to join group");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await studyGroupsApi.leaveStudyGroup(groupId);
      setActionError("");
      loadGroups();
    } catch (error) {
      console.error("Error leaving group:", error);
      setActionError(error.response?.data?.message || "Failed to leave group");
    }
  };

  const isUserInGroup = (group) =>
    user &&
    group.members.some(
      (member) => member._id === user._id || member === user._id
    );

  return (
    <div className="space-y-6">
      <HubTabs hub="study" />
      <PageHeader
        eyebrow="Learn together"
        title="Study Groups"
        subtitle="Find or create branch-wise study circles across MANIT."
        icon={Users}
        actions={
          user && (
            <Button leftIcon={Plus} onClick={() => setShowCreateModal(true)}>
              Create group
            </Button>
          )
        }
      />

      <StudyGroupFilters filters={filters} onFiltersChange={setFilters} />

      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-3 text-sm text-danger-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border bg-card shadow-card"
            >
              <Skeleton className="h-32 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No study groups found"
          description="Be the first to start a study circle for your branch or subject."
          action={
            user && (
              <Button leftIcon={Plus} onClick={() => setShowCreateModal(true)}>
                Create the first group
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <StudyGroupCard
              key={group._id}
              group={group}
              currentUser={user}
              isJoined={isUserInGroup(group)}
              onEdit={() => setEditingGroup(group)}
              onDelete={() => handleDeleteGroup(group._id)}
              onJoin={handleJoinGroup}
              onLeave={handleLeaveGroup}
            />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
            disabled={page >= meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
      />

      <CreateGroupModal
        key={editingGroup?._id || "edit-modal"}
        isOpen={Boolean(editingGroup)}
        onClose={() => setEditingGroup(null)}
        onSubmit={handleEditGroup}
        initialData={editingGroup}
        submitLabel="Save changes"
      />
    </div>
  );
}
