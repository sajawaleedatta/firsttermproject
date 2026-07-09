import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProfile, useUpdateProfile } from "../hooks/useApi";
import Spinner from "../components/Spinner";
import type { AxiosError } from "axios";

export default function Profile() {
  const { refreshUser } = useAuth();
  const { data, isLoading, isError, error } = useProfile();
  const updateMutation = useUpdateProfile();
  const profile = data?.data;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email);
    }
  }, [profile]);

  if (isLoading) return <Spinner size="lg" />;
  if (isError) return <div className="error-message">{(error as AxiosError<{ error: string }>)?.response?.data?.error || "Failed to load profile."}</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");

    if (!name && !email) {
      setFormError("Name and email are required.");
      return;
    }

    const payload: { name?: string; email?: string; currentPassword?: string; newPassword?: string } = {};
    if (name !== profile?.name) payload.name = name;
    if (email !== profile?.email) payload.email = email;
    if (newPassword) {
      if (!currentPassword) {
        setFormError("Current password is required to set a new password.");
        return;
      }
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    if (Object.keys(payload).length === 0) {
      setFormError("No changes to save.");
      return;
    }

    try {
      await updateMutation.mutateAsync(payload);
      await refreshUser();
      setSuccess("Profile updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setFormError(axiosErr.response?.data?.error || (err instanceof Error ? err.message : "Failed to update profile."));
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>My Profile</h2>
        {formError && <div className="form-error">{formError}</div>}
        {success && <div className="form-success">{success}</div>}
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <hr />
        <p className="form-hint">Leave blank to keep current password</p>
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
