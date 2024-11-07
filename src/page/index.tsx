// src/App.tsx
import { useEffect, useState } from 'react';
import { getUsers, FetchUsers, addUser } from '../services/userService';
import UserList from './feature/usrList';  
import Loading from '../components/loading';  
import ErrorMessage from '../components/errorMessage';   
import { User } from '../models/userModel';
import AddUserForm from './feature/addUserForm'; 
import '../styles/app.css';

function App() {
  // State untuk menyimpan data pengguna, pesan kesalahan, status loading, dan kontrol tampilan formulir penambahan pengguna
  const [dataUser, setDataUser] = useState<User[]>([]);  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); 
  const [showAddUserForm, setShowAddUserForm] = useState<boolean>(false); 
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');  // State untuk filter pengguna

  useEffect(() => {
    // Fungsi untuk mengambil pengguna
    const fetchUsers = async () => {
      setLoading(true); // Menandai bahwa data sedang dimuat
      const response = await FetchUsers(); // Memanggil fungsi untuk mengambil data pengguna
      if (!response) {
        setError("Failed to fetch users."); // Menangani kesalahan jika tidak dapat mengambil pengguna
        console.log("failed fetch users"); // Menampilkan pesan kesalahan di konsol
        setLoading(false); // Menandai loading selesai
        return;
      }
      const users = await getUsers(); // Memanggil fungsi untuk mendapatkan pengguna dari local storage
      if (!users) {
        setError("Failed to get users."); // Menangani kesalahan jika tidak ada pengguna
        console.log("failed get users"); // Menampilkan pesan kesalahan di konsol
        setLoading(false); // Menandai loading selesai
        return;
      }
      setDataUser(users); // Mengatur data pengguna
      setLoading(false); // Menandai loading selesai
    };
    fetchUsers(); // Memanggil fungsi fetchUsers saat komponen dirender
  }, []); // Dependency array kosong berarti hanya dijalankan saat pertama kali dirender

  // Fungsi untuk menangani penghapusan pengguna
  const handleUserDelete = async () => {
    setLoading(true); // Menandai bahwa data sedang dimuat
    const users = await getUsers(); // Mengambil pengguna dari local storage
    if (!users) {
      setError("Failed to get users."); // Menangani kesalahan jika tidak ada pengguna
      console.log("failed get users"); // Menampilkan pesan kesalahan di konsol
      setLoading(false); // Menandai loading selesai
      return;
    }
    setDataUser(users); // Mengatur data pengguna
    setLoading(false); // Menandai loading selesai
  };

  // Fungsi untuk menangani penambahan pengguna
  const handleAddUser = (user: Omit<User, 'id'>) => {
    setLoading(true); // Menandai bahwa data sedang dimuat
    const updatedUsers = addUser(user); // Menambahkan pengguna baru dan memperbarui daftar pengguna
    setDataUser(updatedUsers); // Mengatur data pengguna baru
    setShowAddUserForm(false); // Menutup formulir penambahan pengguna
    setLoading(false); // Menandai loading selesai
  };
  
  // Fungsi untuk memfilter pengguna berdasarkan status
  const filterUsers = (users: User[], filter: string) => {
    return users.filter(user => {
      if (filter === 'active') return user.status === true; // Mengembalikan pengguna yang aktif
      if (filter === 'inactive') return user.status === false; // Mengembalikan pengguna yang tidak aktif
      return true; // Mengembalikan semua pengguna jika filter 'all'
    });
  };

  // Mengatur pengguna yang terfilter berdasarkan status yang dipilih
  const filteredUsers = filterUsers(dataUser, filter); 

  return (
    <>
      {error && <ErrorMessage message={error} />} {/* Menampilkan pesan kesalahan jika ada */}
      <nav className="flex py-5 shadow-lg justify-center border-b border-b-indigo-950">
        <img src="/assets/logo-1.png" alt="Logo" height={20} width={120}/> {/* Logo aplikasi */}
      </nav>
      <section className='mt-5'>
        <div className='max-w-container grid'>
          <h1 className='text-2xl text-white font-semibold'>USER MANAGEMENT</h1>
          <div className='grid mt-5'>
            <button 
              className='text-sm outline-none ms-auto text-white px-4 rounded-md py-1 border border-white hover:bg-indigo-900 hover:border-indigo-900 active:border-indigo-950 active:bg-indigo-950 transition'
              onClick={() => setShowAddUserForm(!showAddUserForm)} // Menangani klik untuk membuka/tutup formulir penambahan pengguna
            >
              Add User
            </button>
          </div>

          <div className="mt-4 flex gap-5 text-sm">
            {/* Tombol untuk memilih jenis filter pengguna */}
            <button 
              className={`text-white px-4 py-1 rounded-md ${filter === 'all' ? 'bg-indigo-600' : 'border-white border'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`text-white px-4 py-1 rounded-md ${filter === 'active' ? 'bg-indigo-600' : 'border-white border'}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button 
              className={`text-white px-4 py-1 rounded-md ${filter === 'inactive' ? 'bg-indigo-600' : 'border-white border'}`}
              onClick={() => setFilter('inactive')}
            >
              Inactive
            </button>
          </div>

          {/* Menampilkan formulir penambahan pengguna jika perlu */}
          {showAddUserForm && (
            <AddUserForm onAddUser={handleAddUser} /> 
          )}
        </div>
      </section>
      <section className='max-w-container'>
        {/* Menampilkan loading atau daftar pengguna berdasarkan status */}
        {loading ? (
          <Loading /> // Menampilkan komponen loading
        ) : (
          filteredUsers.length > 0 ? ( // Memeriksa apakah ada pengguna yang terfilter
            <UserList users={filteredUsers} onUserUpdate={handleUserDelete} /> // Menampilkan daftar pengguna
          ) : (
            <ErrorMessage message="No users found." /> // Menampilkan pesan jika tidak ada pengguna
          )
        )}
      </section>
    </>
  );
}

export default App;
