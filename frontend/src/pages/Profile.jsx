import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, loading, updateProfile } = useAuth();
  const [formState, setFormState] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (user) {
      setFormState({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <p className="text-gray-500 mb-2">Email</p>
          <p className="font-medium mb-6">{user?.email || 'N/A'}</p>
          <p className="text-gray-500 mb-2">Role</p>
          <p className="font-medium">{user?.role || 'User'}</p>
        </section>

        <form
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-dark-700 dark:bg-dark-800"
          onSubmit={async (e) => {
            e.preventDefault();
            await updateProfile(formState);
          }}
        >
          <h2 className="text-xl font-semibold mb-6">Update Profile</h2>
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
            <input
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-dark-700 dark:bg-dark-900"
            />
          </label>
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</span>
            <input
              value={formState.phone}
              onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:border-dark-700 dark:bg-dark-900"
            />
          </label>
          <button type="submit" className="btn btn-primary mt-2">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
  
