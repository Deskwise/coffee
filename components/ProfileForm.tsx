import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Button from './Button';
import Input from './Input';
import { DEFAULT_PROFILE_PICTURE } from '../constants';
import { geminiService } from '../services/geminiService';

interface ProfileFormProps {
  user: User | null;
  onSave: (user: User) => Promise<void>;
  onCancel: () => void;
  isNewUser?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSave, onCancel, isNewUser = false }) => {
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || DEFAULT_PROFILE_PICTURE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; bio?: string }>({});
  const [generateBioLoading, setGenerateBioLoading] = useState(false);

  const validate = () => {
    const newErrors: { name?: string; bio?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateBio = async () => {
    if (bio.trim() === '' && !name.trim()) {
      alert('Please enter your name or some keywords in the bio field to generate a bio.');
      return;
    }
    setGenerateBioLoading(true);
    const keywords = bio.trim() === '' ? name : bio;
    const generatedBio = await geminiService.generateBio(keywords);
    setBio(generatedBio);
    setGenerateBioLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const updatedUser: User = {
      ...user,
      id: user?.id || `user-${Date.now()}`, // Unique ID for new users
      name,
      bio,
      profilePicture,
      role: user?.role || UserRole.MEMBER,
      points: user?.points || 0,
    };

    try {
      await onSave(updatedUser);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 card-industrial rounded-xl shadow-2xl border border-[#3E2723]">
      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <img
            src={profilePicture}
            alt="Profile"
            className="w-32 h-32 rounded border-4 border-[#7C2D12] object-cover shadow-lg"
          />
          <div className="absolute inset-0 rounded border-2 border-[#D97706]/20 pointer-events-none"></div>
        </div>
        <label htmlFor="profile-picture-upload" className="mt-4 cursor-pointer text-[#D97706] hover:text-[#F59E0B] font-bold uppercase tracking-wider text-sm transition-colors">
          Change Picture
        </label>
        <input
          id="profile-picture-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Name Input */}
      <Input
        id="name"
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      {/* Bio Section */}
      <div className="mb-6">
        <label htmlFor="bio" className="block text-xs font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          className={`w-full p-3 bg-[#0a0806] border rounded-lg text-[#E7E5E4] placeholder-[#57534E] focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all shadow-inner ${errors.bio ? 'border-red-500 focus:border-red-500' : 'border-[#3E2723]'}`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Tell us a little about yourself..."
        ></textarea>
        {errors.bio && <p className="mt-1 text-sm text-red-400 font-bold">{errors.bio}</p>}
        <Button
          type="button"
          variant="secondary"
          onClick={handleGenerateBio}
          loading={generateBioLoading}
          className="mt-3 text-xs"
        >
          ✨ Generate Bio with AI
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-[#3E2723]">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {isNewUser ? 'Create Profile' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
