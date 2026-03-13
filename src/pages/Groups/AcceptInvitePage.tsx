import { Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import groupService from "../../services/groupService";
import { useAuth } from "../../context/Authentication/useAuth";

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, jwtToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);

  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        navigate("/groups");
        return;
      }

      try {
        const response = await groupService.getInviteByToken(token);
        setInvite(response);
      } catch (err) {
        toast.error((err as any).response?.data?.message || "Invitation not found");
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token, navigate]);

  useEffect(() => {
    if (!loading && !user?.email) {
      sessionStorage.setItem("pendingInviteRedirect", location.pathname + location.search);
      navigate("/login");
    }
  }, [loading, user, location, navigate]);

  const handleAccept = async () => {
    if (!token || !user?.email || !jwtToken) {
      toast.error("Please log in first");
      return;
    }

    try {
      await groupService.acceptInvite(token, jwtToken, user.email);
      toast.success("Invitation accepted");
      sessionStorage.removeItem("pendingInviteRedirect");
      navigate("/groups");
    } catch (err) {
      toast.error((err as any).response?.data?.message || "Failed to accept invitation");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
      <div className="text-2xl font-extrabold text-gray-900">Group Invitation</div>
      <div className="mt-2 text-sm text-gray-500">
        You have been invited to join the following group.
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Group Name</div>
        <div className="mt-1 text-lg font-bold text-gray-900">{invite?.groupName}</div>

        <div className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">Category</div>
        <div className="mt-1 text-sm text-gray-700">{invite?.category}</div>

        <div className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">Status</div>
        <div className="mt-1 text-sm text-gray-700">{invite?.status}</div>

        {invite?.invitedEmail && (
          <>
            <div className="mt-4 text-xs font-bold uppercase tracking-wide text-gray-500">Invited Email</div>
            <div className="mt-1 text-sm text-gray-700">{invite.invitedEmail}</div>
          </>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <Button
          variant="contained"
          onClick={handleAccept}
          sx={{ borderRadius: "12px", fontWeight: 700 }}
        >
          Accept Invitation
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate("/groups")}
          sx={{ borderRadius: "12px", fontWeight: 700 }}
        >
          Back
        </Button>
      </div>
    </div>
  );
};

export default AcceptInvitePage;