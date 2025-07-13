import { useEffect, useState } from "react";
import {
  getAuth,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Pencil, Save, User, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const Settings = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  const [originalName, setOriginalName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [changePwd, setChangePwd] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid) return;
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.username || "");
        setEmail(data.email || "");
        setOriginalName(data.username || "");
        setOriginalEmail(data.email || "");
      }
    };
    fetchUserProfile();
  }, [uid]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      if (user.email !== email) {
        await updateEmail(user, email);
      }

      await updateDoc(doc(db, "users", uid), {
        username: name,
        email,
      });

      setOriginalName(name);
      setOriginalEmail(email);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(originalName);
    setEmail(originalEmail);
    setEditMode(false);
  };

  const handlePasswordChange = async () => {
    if (!oldPwd || !newPwd) return alert("Please fill all fields");

    try {
      const credential = EmailAuthProvider.credential(user.email, oldPwd);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPwd);
      toast.success("Password updated successfully.");
      setChangePwd(false);
      setOldPwd("");
      setNewPwd("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to change password.");
    }
  };

  const handleClearAllData = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete ALL tests and results? This action cannot be undone!"
    );
    if (!confirm) return;

    try {
      const testSnap = await getDocs(collection(db, "tests"));
      const testDeletes = testSnap.docs.map(async (testDoc) => {
        const testId = testDoc.id;

        const questionsSnap = await getDocs(
          collection(db, "tests", testId, "questions")
        );
        const questionDeletes = questionsSnap.docs.map((qDoc) =>
          deleteDoc(qDoc.ref)
        );
        await Promise.all(questionDeletes);

        await deleteDoc(doc(db, "tests", testId));
      });

      const resultSnap = await getDocs(collection(db, "results"));
      const resultDeletes = resultSnap.docs.map((doc) => deleteDoc(doc.ref));

      await Promise.all([...testDeletes, ...resultDeletes]);

      toast.success("All test data cleared successfully!");
    } catch (err) {
      console.error("Failed to clear data:", err);
      toast.error("Something went wrong while clearing data.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto md:p-6 text-gray-800">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-blue-600" />
        Admin Settings
      </h2>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={`https://ui-avatars.com/api/?name=${name}&background=random&rounded=true`}
          alt="Admin Avatar"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full border shadow"
        />
        <div>
          <p className="font-semibold">{name || "Admin"}</p>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Admin Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editMode}
            className="w-full outline-none border px-3 py-2 rounded-lg mt-2 border-gray-200 bg-gray-50 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Admin Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!editMode}
            className="w-full outline-none border px-3 py-2 rounded-lg mt-2 border-gray-200 bg-gray-50 focus:border-blue-500 transition"
          />
        </div>

        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <hr className="my-6" />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-600" />
          Change Password
        </h3>

        {!changePwd ? (
          <button
            onClick={() => setChangePwd(true)}
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md"
          >
            Change Password
          </button>
        ) : (
          <div className="space-y-5">
            <div className="relative">
              <input
                type={showOldPwd ? "text" : "password"}
                placeholder="Old Password"
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                className="w-full outline-none border px-3 py-2 rounded-lg mt-2 border-gray-200 bg-gray-50 focus:border-blue-500 transition"
              />
              <span
                onClick={() => setShowOldPwd(!showOldPwd)}
                className="absolute right-3 top-7 transform -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showOldPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="relative">
              <input
                type={showNewPwd ? "text" : "password"}
                placeholder="New Password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full outline-none border px-3 py-2 rounded-lg mt-2 border-gray-200 bg-gray-50 focus:border-blue-500 transition"
              />
              <span
                onClick={() => setShowNewPwd(!showNewPwd)}
                className="absolute right-3 top-7 transform -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="mt-2 flex gap-4">
              <button
                onClick={handlePasswordChange}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Update Password
              </button>
              <button
                onClick={() => {
                  setChangePwd(false);
                  setOldPwd("");
                  setNewPwd("");
                  setShowOldPwd(false);
                  setShowNewPwd(false);
                }}
                className="text-white bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <hr className="my-6" />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
          ⚠️ Danger Zone
        </h3>

        <button
          onClick={handleClearAllData}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          Clear All Test Data
        </button>
      </div>
    </div>
  );
};

export default Settings;
