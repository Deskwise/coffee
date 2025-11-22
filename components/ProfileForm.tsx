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
    <form onSubmit={handleSubmit} className="p-4 bg-surface rounded-lg shadow-lg">
      <div className="flex flex-col items-center mb-6">
        <img
          src={profilePicture}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border-4 border-primary mb-3"
        />
        <label htmlFor="profile-picture-upload" className="cursor-pointer text-primary hover:underline">
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

      <Input
        id="name"
        label="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />

      <div className="mb-4">
        <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          className={`w-full p-3 bg-surface border border-gray-600 rounded-lg text-text placeholder-gray-400 focus:ring-primary focus:border-primary transition-colors duration-200 ${errors.bio ? 'border-danger focus:border-danger' : ''}`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Tell us a little about yourself..."
        ></textarea>
        {errors.bio && <p className="mt-1 text-sm text-danger">{errors.bio}</p>}
        <Button
          type="button"
          variant="secondary"
          onClick={handleGenerateBio}
          loading={generateBioLoading}
          className="mt-2 text-sm"
        >
          Generate Bio with AI
        </Button>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
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
