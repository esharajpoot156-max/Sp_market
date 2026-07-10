import { useState } from "react";
import toast from "react-hot-toast";
import { FaCamera } from "react-icons/fa";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import SpotlightCard from "../components/SpotlightCard";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    city: user?.location?.city || "",
    country: user?.location?.country || "",
    skills: user?.skills?.join(", ") || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/users/profile", formData);
      setUser({ ...user, ...res.data });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const data = new FormData();
      data.append("profilePicture", file);
      const res = await api.post("/users/profile/picture", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser({ ...user, profilePicture: res.data.profilePicture });
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error("Failed to upload picture");
    } finally {
      setUploadingPic(false);
    }
  };

  return (
    <div className="bg-bg min-h-[calc(100vh-72px)] px-6 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-secondary mb-6">Your Profile</h1>

        <SpotlightCard className="bg-surface p-8">
          {/* Profile picture */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  alt=""
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-secondary/10 border-4 border-white shadow-md" />
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-md hover:bg-primary-dark transition">
                <FaCamera size={12} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePictureUpload}
                  disabled={uploadingPic}
                />
              </label>
            </div>
            {uploadingPic && <p className="text-xs text-secondary/50 mt-2">Uploading...</p>}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Bio</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell others about yourself..."
                className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Country</label>
                <input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">
                Skills (comma separated)
              </label>
              <input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Graphic Design, Tutoring"
                className="w-full px-4 py-2.5 rounded-lg border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </SpotlightCard>
      </div>
    </div>
  );
};

export default Profile;