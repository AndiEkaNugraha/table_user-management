// src/components/AddUserForm.tsx
import React, { useState } from 'react'; // Mengimpor React dan hook useState dari pustaka React
import { User } from '../../models/userModel'; // Mengimpor tipe User dari model yang ditentukan

// Mendefinisikan interface untuk properti yang diterima oleh komponen AddUserForm
interface AddUserFormProps {
  onAddUser: (user: Omit<User, 'id'>) => void; // onAddUser adalah fungsi untuk menambahkan pengguna baru
}

// Mendefinisikan komponen AddUserForm dengan props yang diterima
const AddUserForm: React.FC<AddUserFormProps> = ({ onAddUser }) => {
  // State untuk menyimpan data pengguna baru
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({ login: '', email: '', age: undefined, url: '' });
  
  // State untuk menyimpan pesan kesalahan dari berbagai input
  const [loginError, setLoginError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null); // State untuk kesalahan URL

  // Fungsi untuk memvalidasi username
  const validateUsername = (username: string) => {
    if (!username) {
      setLoginError("Username is required."); // Menetapkan kesalahan jika username kosong
    } else {
      setLoginError(null); // Menghapus kesalahan jika username valid
    }
  };

  // Fungsi untuk memvalidasi email menggunakan regex
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression untuk email
    if (!email) {
      setEmailError("Email is required."); // Menetapkan kesalahan jika email kosong
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format."); // Menetapkan kesalahan jika format email tidak valid
    } else {
      setEmailError(null); // Menghapus kesalahan jika email valid
    }
  };

  // Fungsi untuk memvalidasi usia
  const validateAge = (age: number | undefined) => {
    if (age === undefined || age <= 30) {
      setAgeError("Age must be greater than 30."); // Menetapkan kesalahan jika usia kurang dari atau sama dengan 30
    } else {
      setAgeError(null); // Menghapus kesalahan jika usia valid
    }
  };

  // Fungsi untuk memvalidasi URL menggunakan regex
  const validateUrl = (url: string) => {
    const urlRegex = /^(https?:\/\/)?(([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})(\/[^\s]*)?$/; // Regex untuk format URL
    if (!url) {
      setUrlError("URL is required."); // Menetapkan kesalahan jika URL kosong
    } else if (!urlRegex.test(url)) {
      setUrlError("Invalid URL format. Please enter a valid URL."); // Menetapkan kesalahan jika format URL tidak valid
    } else {
      setUrlError(null); // Menghapus kesalahan jika URL valid
    }
  };

  // Fungsi untuk menangani penambahan pengguna baru
  const handleAddUser = () => { 
    // Memvalidasi setiap field
    validateUsername(newUser.login);
    validateEmail(newUser.email);
    validateAge(newUser.age);
    validateUrl(newUser.url); // Validasi URL

    // Jika ada kesalahan, jangan lanjutkan
    if (loginError || emailError || ageError || urlError || !newUser.login || !newUser.email || !newUser.url) return;

    onAddUser(newUser); // Memanggil fungsi untuk menambahkan pengguna baru
    setNewUser({ login: '', email: '', age: undefined, url: '' }); // Reset state baru setelah penambahan
  };

  // Mengembalikan JSX untuk diagram formulir penambahan pengguna baru
  return (
    <div className="dropdown-form mt-4 grid gap-4 p-10 border border-indigo-900 rounded-xl">
      <label className='text-white text-sm'>Name</label>
      <input
        type="text"
        placeholder="Username"
        className="px-4 py-2 outline-none border border-slate-600 rounded-md w-full bg-transparent text-white"
        onChange={(e) => {
          const username = e.target.value; // Mengambil nilai dari input username
          setNewUser({ ...newUser, login: username }); // Memperbarui state newUser
          validateUsername(username); // Memvalidasi username
        }}
      />
      {loginError && <div className="text-red-500 text-sm">{loginError}</div>} {/* Menampilkan pesan kesalahan untuk username */}

      <label className='text-white text-sm'>Email</label>
      <input
        type="email"
        placeholder="Email"
        className="px-4 py-2 outline-none border border-slate-600 rounded-md w-full bg-transparent text-white"
        onChange={(e) => {
          const email = e.target.value; // Mengambil nilai dari input email
          setNewUser({ ...newUser, email }); // Memperbarui state newUser
          validateEmail(email); // Memvalidasi email
        }}
      />
      {emailError && <div className="text-red-500 text-sm">{emailError}</div>} {/* Menampilkan pesan kesalahan untuk email */}
      
      <label className='text-white text-sm'>Age</label>
      <input
        type="number"
        placeholder="Age"
        className="px-4 py-2 outline-none border border-slate-600 rounded-md w-full bg-transparent text-white"
        onChange={(e) => {
          const age = Number(e.target.value); // Mengambil dan mengonversi nilai dari input usia
          setNewUser({ ...newUser, age }); // Memperbarui state newUser
          validateAge(age); // Memvalidasi usia
        }}
      />
      {ageError && <div className="text-red-500 text-sm">{ageError}</div>} {/* Menampilkan pesan kesalahan untuk usia */}
      
      <label className='text-white text-sm'>Github URL</label>  
      <input
        type="text"
        placeholder="Github URL"
        className="px-4 py-2 outline-none border border-slate-600 rounded-md w-full bg-transparent text-white"
        onChange={(e) => {
          const url = e.target.value; // Mengambil nilai dari input URL
          setNewUser({ ...newUser, url }); // Memperbarui state newUser
          validateUrl(url); // Memvalidasi URL
        }}
      />
      {urlError && <div className="text-red-500 text-sm">{urlError}</div>} {/* Menampilkan pesan kesalahan untuk URL */}

      <div className='flex'>
        <button onClick={handleAddUser} className="ms-auto text-white bg-indigo-600 rounded-md px-4 py-1">Submit</button> {/* Tombol untuk mengirim formulir */}
      </div>
    </div>
  );
};

export default AddUserForm; // Ekspor komponen AddUserForm untuk digunakan di bagian lain aplikasi
