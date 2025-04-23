import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import PopulationUpdateModal from './PopulationUpdateModal';

interface PopulationData {
  students?: {
    male: number;
    female: number;
    total?: number;
  };
  teachers?: {
    steamInvolved: number;
    nonSteamInvolved: number;
    total?: number;
  };
}

export default function Population() {
  const [populationData, setPopulationData] = useState<PopulationData>({
    students: { male: 0, female: 0, total: 0 },
    teachers: { steamInvolved: 0, nonSteamInvolved: 0, total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<'students' | 'teachers' | null>(null);
  const [editData, setEditData] = useState<PopulationData>({
    students: { male: 0, female: 0 },
    teachers: { steamInvolved: 0, nonSteamInvolved: 0 }
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    fetchPopulationData();
  }, []);

  const fetchPopulationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user ID
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        setError("You must be logged in to view population data");
        setLoading(false);
        return;
      }
      
      // Fetch school data from Firestore
      const schoolDocRef = doc(db, 'schools', userId);
      const schoolDocSnap = await getDoc(schoolDocRef);
      
      if (schoolDocSnap.exists()) {
        const schoolData = schoolDocSnap.data();
        
        // Extract population data if it exists
        const population: PopulationData = {
          students: {
            male: schoolData.students?.male || 0,
            female: schoolData.students?.female || 0,
            total: schoolData.students?.total || 
              (schoolData.students?.male || 0) + (schoolData.students?.female || 0)
          },
          teachers: {
            steamInvolved: schoolData.teachers?.steamInvolved || 0,
            nonSteamInvolved: schoolData.teachers?.nonSteamInvolved || 0,
            total: schoolData.teachers?.total || 
              (schoolData.teachers?.steamInvolved || 0) + (schoolData.teachers?.nonSteamInvolved || 0)
          }
        };
        
        setPopulationData(population);
        setEditData({
          students: { 
            male: population.students?.male || 0,
            female: population.students?.female || 0,
            total: population.students?.total
          },
          teachers: { 
            steamInvolved: population.teachers?.steamInvolved || 0,
            nonSteamInvolved: population.teachers?.nonSteamInvolved || 0,
            total: population.teachers?.total
          }
        });
      } else {
        setError("School profile not found");
      }
    } catch (err) {
      console.error("Error fetching population data:", err);
      setError("Failed to load population data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    section: 'students' | 'teachers', 
    field: string, 
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    
    setEditData(prev => {
      const newData = { ...prev };
      
      if (section === 'students' && newData.students) {
        newData.students = {
          ...newData.students,
          [field]: numValue
        };
        // Calculate total
        newData.students.total = 
          (newData.students.male || 0) + 
          (newData.students.female || 0);
      } else if (section === 'teachers' && newData.teachers) {
        newData.teachers = {
          ...newData.teachers,
          [field]: numValue
        };
        // Calculate total
        newData.teachers.total = 
          (newData.teachers.steamInvolved || 0) + 
          (newData.teachers.nonSteamInvolved || 0);
      }
      
      return newData;
    });
  };

  const handleUpdate = async (section: 'students' | 'teachers') => {
    try {
      setUpdateLoading(true);
      setUpdateSuccess(false);
      
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setError("You must be logged in to update data");
        setUpdateLoading(false);
        return;
      }
      
      const schoolDocRef = doc(db, 'schools', userId);
      
      // Prepare update data
      const updateData: any = {};
      
      if (section === 'students') {
        updateData.students = {
          male: editData.students?.male || 0,
          female: editData.students?.female || 0,
          total: (editData.students?.male || 0) + (editData.students?.female || 0)
        };
      } else {
        updateData.teachers = {
          steamInvolved: editData.teachers?.steamInvolved || 0,
          nonSteamInvolved: editData.teachers?.nonSteamInvolved || 0,
          total: (editData.teachers?.steamInvolved || 0) + (editData.teachers?.nonSteamInvolved || 0)
        };
      }
      
      // Update Firestore
      await updateDoc(schoolDocRef, updateData);
      
      // Update local state
      setPopulationData(prev => ({
        ...prev,
        [section]: { ...updateData[section] }
      }));
      
      setUpdateSuccess(true);
      setIsEditing(null);
      
      // Show success message briefly
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error(`Error updating ${section} data:`, err);
      setError(`Failed to update ${section} data`);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-12">Loading population data...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-8">{error}</div>;
  }

  return (
    <div>
      <h1 className='font-semibold text-2xl mb-1'>School Population</h1>
      <p className="text-gray-500 mb-8">Lorem ipsum dolor sit amet consectetur. Semper enim scelerisque in pellentesque amet</p>      
      {updateSuccess && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4">
          Population data updated successfully!
        </div>
      )}
      
      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Students</h2>
            <button 
              onClick={() => setIsEditing('students')} 
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
            >
              Update
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Males</p>
              <p>{populationData.students?.male || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Females</p>
              <p>{populationData.students?.female || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Students</p>
              <p className="text-2xl font-semibold">
                {populationData.students?.total || 0}
              </p>
              <p className="text-sm text-gray-500">Total Student Population</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Teachers</h2>
            <button 
              onClick={() => setIsEditing('teachers')} 
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
            >
              Update
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm text-gray-500 mb-1">Involved in STEAM</p>
              <p>{populationData.teachers?.steamInvolved || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Not Involved in STEAM</p>
              <p>{populationData.teachers?.nonSteamInvolved || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Teachers</p>
              <p className="text-2xl font-semibold">
                {populationData.teachers?.total || 0}
              </p>
              <p className="text-sm text-gray-500">Total Teacher Population</p>
            </div>
          </div>
        </section>
      </div>

      {/* Student Population Update Modal */}
      <PopulationUpdateModal
        isOpen={isEditing === 'students'}
        onClose={() => setIsEditing(null)}
        title="Update Student Population"
        description="Lorem ipsum dolor sit amet consectetur. Imperdiet libero nulla pharetra commodo etiam. Placerat eget pharetra in tortor."
        type="students"
        formData={{
          male: editData.students?.male,
          female: editData.students?.female
        }}
        onInputChange={(field, value) => handleInputChange('students', field, value)}
        onUpdate={() => handleUpdate('students')}
        isLoading={updateLoading}
      />

      {/* Teacher Population Update Modal */}
      <PopulationUpdateModal
        isOpen={isEditing === 'teachers'}
        onClose={() => setIsEditing(null)}
        title="Update Teacher Population"
        description="Lorem ipsum dolor sit amet consectetur. Imperdiet libero nulla pharetra commodo etiam. Placerat eget pharetra in tortor."
        type="teachers"
        formData={{
          steamInvolved: editData.teachers?.steamInvolved,
          nonSteamInvolved: editData.teachers?.nonSteamInvolved
        }}
        onInputChange={(field, value) => handleInputChange('teachers', field, value)}
        onUpdate={() => handleUpdate('teachers')}
        isLoading={updateLoading}
      />
    </div>
  );
}