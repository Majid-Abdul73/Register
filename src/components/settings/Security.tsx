import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { updateEmail, updatePassword, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface ContactPerson {
  id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

interface SecurityData {
  email: string;
  contactPersons?: ContactPerson[];
}

export default function Security() {
  const [securityData, setSecurityData] = useState<SecurityData | null>(null);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  
  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newContact, setNewContact] = useState<ContactPerson>({
    name: '',
    role: '',
    email: '',
    phone: ''
  });
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user ID
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        setError("You must be logged in to view security settings");
        setLoading(false);
        return;
      }
      
      // Fetch school data from Firestore
      const schoolDocRef = doc(db, 'schools', userId);
      const schoolDocSnap = await getDoc(schoolDocRef);
      
      if (schoolDocSnap.exists()) {
        const schoolData = schoolDocSnap.data();
        setSecurityData({
          email: schoolData.email || '',
        });
        
        // Fetch contact persons
        const contactsCollectionRef = collection(db, 'schools', userId, 'contacts');
        const contactsSnapshot = await getDocs(contactsCollectionRef);
        
        const contacts: ContactPerson[] = [];
        contactsSnapshot.forEach((doc) => {
          contacts.push({
            id: doc.id,
            ...doc.data() as Omit<ContactPerson, 'id'>
          });
        });
        
        setContactPersons(contacts);
      } else {
        setError("School profile not found");
      }
    } catch (err) {
      console.error("Error fetching security data:", err);
      setError("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!auth.currentUser) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || '',
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update email in Firebase Auth
      await updateEmail(auth.currentUser, newEmail);
      
      // Update email in Firestore
      const userId = auth.currentUser.uid;
      const schoolDocRef = doc(db, 'schools', userId);
      await updateDoc(schoolDocRef, {
        email: newEmail
      });
      
      // Update local state
      setSecurityData(prev => ({
        ...prev!,
        email: newEmail
      }));
      
      setSuccess("Email updated successfully");
      setShowEmailModal(false);
      setNewEmail('');
      setCurrentPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error changing email:", err);
      setError("Failed to change email. Please check your password and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email || '',
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Update password in Firebase Auth
      await updatePassword(auth.currentUser, newPassword);
      
      setSuccess("Password updated successfully");
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Failed to change password. Please check your current password and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!auth.currentUser || !auth.currentUser.email) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      
      setSuccess("Password reset email sent. Please check your inbox.");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Failed to send password reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddContact = async () => {
    if (!auth.currentUser) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate form
      if (!newContact.name || !newContact.role) {
        setError("Name and role are required");
        setIsSubmitting(false);
        return;
      }
      
      const userId = auth.currentUser.uid;
      
      if (editingContact && editingContact.id) {
        // Update existing contact
        const contactRef = doc(db, 'schools', userId, 'contacts', editingContact.id);
        await updateDoc(contactRef, {
          name: newContact.name,
          role: newContact.role,
          email: newContact.email || '',
          phone: newContact.phone || ''
        });
        
        // Update local state
        setContactPersons(prev => 
          prev.map(contact => 
            contact.id === editingContact.id 
              ? { ...newContact, id: editingContact.id } 
              : contact
          )
        );
        
        setSuccess("Contact updated successfully");
      } else {
        // Add new contact
        const contactsCollectionRef = collection(db, 'schools', userId, 'contacts');
        const docRef = await addDoc(contactsCollectionRef, {
          name: newContact.name,
          role: newContact.role,
          email: newContact.email || '',
          phone: newContact.phone || ''
        });
        
        // Update local state
        setContactPersons(prev => [...prev, { ...newContact, id: docRef.id }]);
        
        setSuccess("Contact added successfully");
      }
      
      setShowContactModal(false);
      setNewContact({
        name: '',
        role: '',
        email: '',
        phone: ''
      });
      setEditingContact(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error adding/updating contact:", err);
      setError("Failed to add/update contact.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!auth.currentUser || !contactId) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const userId = auth.currentUser.uid;
      const contactRef = doc(db, 'schools', userId, 'contacts', contactId);
      await deleteDoc(contactRef);
      
      // Update local state
      setContactPersons(prev => prev.filter(contact => contact.id !== contactId));
      
      setSuccess("Contact deleted successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error deleting contact:", err);
      setError("Failed to delete contact.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditContact = (contact: ContactPerson) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      role: contact.role,
      email: contact.email || '',
      phone: contact.phone || ''
    });
    setShowContactModal(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">Loading security settings...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-8">{error}</div>;
  }

  if (!securityData) {
    return <div className="py-8">No security data available</div>;
  }

  return (
    <div>
<h1 className='font-semibold text-2xl mb-1'>Security Settings</h1>
<p className="text-gray-500 mb-8">Lorem ipsum dolor sit amet consectetur. Semper enim scelerisque in pellentesque amet</p>      
      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{securityData.email}</p>
            </div>
            <button 
              onClick={() => {
                setNewEmail(securityData.email);
                setShowEmailModal(true);
              }}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
            >
              Change Email
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500">Password</p>
              <p>••••••••</p>
            </div>
            <div className="space-x-2">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Change Password
              </button>
              <button 
                onClick={handleResetPassword}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Contact Person(s)</h2>
            <button 
              onClick={() => {
                setNewContact({
                  name: '',
                  role: '',
                  email: '',
                  phone: ''
                });
                setEditingContact(null);
                setShowContactModal(true);
              }}
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
            >
              Add a New Contact
            </button>
          </div>
          
          <div className="space-y-4">
            {contactPersons.length > 0 ? (
              contactPersons.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-gray-500">{contact.role}</p>
                      {contact.email && <p className="text-sm text-gray-500">{contact.email}</p>}
                      {contact.phone && <p className="text-sm text-gray-500">{contact.phone}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditContact(contact)}
                      className="px-3 py-1 text-sm bg-gray-100 rounded-lg"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteContact(contact.id!)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg"
                      disabled={isSubmitting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 py-2">No contact persons added yet</div>
            )}
          </div>
        </section>
      </div>

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">Change Email</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 mt-2">{error}</p>}
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => {
                  setShowEmailModal(false);
                  setError(null);
                }}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleChangeEmail}
                className="px-4 py-2 text-sm bg-register-green text-white rounded-lg"
                disabled={isSubmitting || !newEmail || !currentPassword}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">Change Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 mt-2">{error}</p>}
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setError(null);
                }}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleChangePassword}
                className="px-4 py-2 text-sm bg-register-green text-white rounded-lg"
                disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">
              {editingContact ? 'Edit Contact Person' : 'Add New Contact Person'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Name *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Role *</label>
                <input
                  type="text"
                  value={newContact.role}
                  onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            {error && <p className="text-red-500 mt-2">{error}</p>}
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => {
                  setShowContactModal(false);
                  setError(null);
                }}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddContact}
                className="px-4 py-2 text-sm bg-register-green text-white rounded-lg"
                disabled={isSubmitting || !newContact.name || !newContact.role}
              >
                {isSubmitting ? 'Saving...' : (editingContact ? 'Update Contact' : 'Add Contact')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}