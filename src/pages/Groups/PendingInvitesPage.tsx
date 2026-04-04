import { Button, CircularProgress } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Authentication/useAuth";
import groupService from "../../services/groupService";

interface PendingInvite {
  token: string;
  groupName: string;
  category?: string;
  status?: string;
  expiresAt?: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  const apiError = err as ApiErrorResponse;
  return apiError.response?.data?.message ?? fallback;
};

const PendingInvitesPage = () => {
  const { user, jwtToken } = useAuth();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingInvites = useCallback(async () => {
    if (!user?.email || !jwtToken) {
      setInvites([]);
      setLoading(false);
      return;
    }

    try {
      const response = await groupService.getPendingInvites(user.email, jwtToken);
      setInvites((response as PendingInvite[]) || []);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to fetch pending invites"));
    } finally {
      setLoading(false);
    }
  }, [user?.email, jwtToken]);

  useEffect(() => {
    void fetchPendingInvites();
  }, [fetchPendingInvites]);

  const handleAccept = async (token: string) => {
    if (!user?.email || !jwtToken) {
      return;
    }

    try {
      await groupService.acceptInvite(token, user.email);
      toast.success("Invitation accepted");
      await fetchPendingInvites();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to accept invitation"));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="ml-4 mt-6 w-[95%]">
      <div className="mb-4 text-xl font-extrabold text-gray-900">
        Pending Invites
      </div>

      {invites.length === 0 ? (
        <div className="rounded-2xl bg-white p-5 text-sm text-gray-600 shadow-sm">
          No pending invitations.
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map((invite) => (
            <div
              key={invite.token}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm"
            >
              <div>
                <div className="text-[15px] font-bold text-gray-900">
                  {invite.groupName}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {invite.category}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Status: {invite.status}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Expires: {invite.expiresAt}
                </div>
              </div>

              <Button
                variant="contained"
                onClick={() => {
                  void handleAccept(invite.token);
                }}
                sx={{ borderRadius: "12px", fontWeight: 700 }}
              >
                Accept
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingInvitesPage;