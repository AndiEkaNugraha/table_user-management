import axios from 'axios';
import { User } from '../models/userModel';

// Fungsi untuk mengambil data pengguna dari API GitHub
const FetchUsers = async () => {
   try {
      const response = await axios.get('https://api.github.com/users'); // Mengambil data pengguna
      // Memeriksa apakah status respons adalah 200 (OK)
      if (response.status === 200) {
         // Memetakan data pengguna untuk menambahkan properti baru
         const data = response.data.map((user: User) => ({
            ...user,
            email: null,  // Menambahkan properti email yang null
            age: null,    // Menambahkan properti usia yang null
            status: true   // Menambahkan properti status yang true
         }));
         // Menyimpan data pengguna ke local storage
         localStorage.setItem('users', JSON.stringify(data));
         return response.data; // Mengembalikan data pengguna
      } else {
         throw new Error("Failed to fetch users, status code: " + response.status); // Menangani status respons yang tidak OK
      }
   } catch (error) {
      console.error("Failed to fetch users", error); // Menampilkan pesan kesalahan
      return null; // Mengembalikan null jika ada kesalahan
   }
}

// Fungsi untuk mendapatkan pengguna dari local storage
const getUsers = async () => {
   try {
      const users = localStorage.getItem('users'); // Mengambil data pengguna dari local storage
      if (!users) {
         throw new Error("No users found in local storage."); // Menangani jika tidak ada pengguna ditemukan
      }
      return JSON.parse(users); // Mengembalikan data pengguna
   } catch (error) {
      console.error("Failed to get users", error); // Menampilkan pesan kesalahan
      return null; // Mengembalikan null jika ada kesalahan
   }
}

// Fungsi untuk menghapus pengguna berdasarkan ID
const deleteUsers = async (userId: number) => {
   try {
      const users = localStorage.getItem('users'); // Mengambil data pengguna dari local storage
      if (!users) {
         throw new Error("No users found in local storage."); // Menangani jika tidak ada pengguna ditemukan
      }
      const usersArray = JSON.parse(users); // Mengubah data pengguna menjadi array
      // Memfilter pengguna yang ID-nya tidak cocok
      const updatedUsers = usersArray.filter((user: User) => user.id !== userId);
      console.log(updatedUsers); // Menampilkan pengguna yang tersisa setelah penghapusan
      // Menyimpan kembali pengguna yang diperbarui ke local storage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
   } catch (error) {
      console.error("Failed to delete user", error); // Menampilkan pesan kesalahan
   }
}

// Fungsi untuk memperbarui informasi pengguna berdasarkan ID
const updateUsers = async (userId: number, updatedUser: User) => {
   try {
      const users = localStorage.getItem('users'); // Mengambil data pengguna dari local storage
      if (!users) {
         throw new Error("No users found in local storage."); // Menangani jika tidak ada pengguna ditemukan
      }
      const usersArray = JSON.parse(users); // Mengubah data pengguna menjadi array
      // Memperbarui pengguna yang ID-nya cocok
      const updatedUsers = usersArray.map((user: User) => {
         if (user.id === userId) {
            return updatedUser; // Menggantikan dengan pengguna yang diperbarui
         }
         return user; // Mengembalikan pengguna yang tidak berubah
      });
      // Menyimpan kembali pengguna yang diperbarui ke local storage
      localStorage.setItem('users', JSON.stringify(updatedUsers));
   } catch (error) {
      console.error("Failed to update user", error); // Menampilkan pesan kesalahan
   }
}

// Fungsi untuk menambahkan pengguna baru
const addUser = (newUser: Omit<User, 'id'>) => {
   const existingUsers = JSON.parse(localStorage.getItem('users') || '[]'); // Mengambil pengguna yang ada
   const newUserId = existingUsers.length ? existingUsers[existingUsers.length - 1].id + 1 : 1; // Menentukan ID pengguna baru
   const userToAdd = { id: newUserId, ...newUser, status: true };  // Membuat objek pengguna baru
   existingUsers.push(userToAdd); // Menambahkan pengguna baru ke array pengguna yang ada
   localStorage.setItem('users', JSON.stringify(existingUsers)); // Menyimpan kembali ke local storage
   return existingUsers; // Mengembalikan daftar pengguna yang diperbarui
};

// Mengekspor fungsi-fungsi yang telah didefinisikan
export { FetchUsers, getUsers, deleteUsers, updateUsers, addUser };
