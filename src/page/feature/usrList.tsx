// Mengimport React dan dependensi yang diperlukan 
import React, {useRef, useEffect} from 'react';
import { User } from '../../models/userModel'; // Memastikan model User mencakup `url`
import { deleteUsers, updateUsers } from '../../services/userService'; // Layanan untuk menghapus dan memperbarui pengguna
import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from "@table-library/react-table-library/table"; // Komponen tabel dari pustaka
import { useTheme } from "@table-library/react-table-library/theme"; // Tema untuk tabel
import { DEFAULT_OPTIONS, getTheme } from '@table-library/react-table-library/material-ui'; // Tema material
import { useSort, HeaderCellSort } from "@table-library/react-table-library/sort"; // Fitur pengurutan
import SwapVertIcon from '@mui/icons-material/SwapVert'; // Ikon untuk pengurutan
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'; // Ikon panah atas
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; // Ikon panah bawah
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Ikon untuk menghapus
import Brightness2Icon from '@mui/icons-material/Brightness2'; // Ikon status
import { useRowSelect, SelectTypes } from "@table-library/react-table-library/select"; // Fitur select baris

// Mendeskripsikan properti yang diterima oleh komponen UserList
interface UserListProps {
  users: User[] | null; // daftar pengguna atau null
  onUserUpdate: () => Promise<void>; // fungsi untuk memperbarui informasi pengguna
}

// Tema kustom untuk tabel
const customTheme = {
  Table: `
        --data-table-library_grid-template-columns: 80px auto 75px auto 50px;
      `,
  HeaderCell: ` 
    &:nth-of-type(3) {
      background-color:rgb(12, 10, 29);
    }&:nth-of-type(2) { 
        min-width: 300px;
      }
        &:nth-of-type(4) { 
        min-width: 400px;
      }
  `,
  BaseCell: `
      background-color:rgb(12, 10, 29);
      color: white;
      padding-block: 15px;
      &:nth-of-type(1) {
          left: 0px;
      }
      &:nth-of-type(1) {
        background-color:rgb(22, 19, 54);
        color: white;
      }
      &:nth-of-type(5) {
        background-color:rgb(22, 19, 54);
        right: 0px;
      }
  `, 
};
// Komponen utama UserList
const UserList: React.FC<UserListProps> = ({ users, onUserUpdate }) => {
  const table = useRef<HTMLDivElement>(null); // Referensi ke elemen tabel
  const [isScrolling, setIsScrolling] = React.useState(false); // Status untuk mendeteksi pengguliran
  const data = users ? { nodes: users } : { nodes: [] }; // Data untuk tabel
  const [detail, setDetail] = React.useState<number[]>([]); // Detail yang ditampilkan
  const materialTheme = ([ getTheme(DEFAULT_OPTIONS), customTheme ]); // Tema untuk material-ui
  const theme = useTheme(materialTheme); // Mengambil tema
  const [editValues, setEditValues] = React.useState<{ [key: number]: Omit<User, 'id'> }>({}); // Status edit pengguna
  const [emailError, setEmailError] = React.useState<{ [key: number]: string }>({}); // Error untuk email
  const [urlError, setUrlError] = React.useState<{ [key: number]: string }>({}); // Error untuk URL
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex dasar untuk validasi email
  const [ageError, setAgeError] = React.useState<{ [key: number]: string }>({}); // Error untuk usia

  // Fungsi untuk memvalidasi email
  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email);
  };
  
  // Fungsi untuk memvalidasi usia
  const validateAge = (age: number): boolean => {
    return age >= 30;
  };

  // Fungsi untuk memvalidasi URL
  const validateUrl = (url: string): boolean => {
    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i; // Regex dasar untuk validasi URL
    return urlRegex.test(url);
  };

  // Fungsi untuk memperluas detail pengguna
  const handleExpand = (item: User) => {
    if (isScrolling) return; // Jika sedang menggulir, jangan lakukan apa-apa
    if (detail.includes(item.id)) { // Jika detail sudah ditampilkan, sembunyikan
      setEditValues((prev) => {
        const { [item.id]: _, ...rest } = prev;
        return rest; // Menghapus nilai edit untuk pengguna ini
      });
      setDetail(detail.filter((id) => id !== item.id)); // Menghapus ID dari daftar detail
    } else { // Jika detail belum ditampilkan, tampilkan
      setEditValues((prev) => ({
        ...prev,
        [item.id]: {  
          login: item.login,
          email: item.email,
          age: item.age,
          status: item.status,
          url: item.url,
        } as Omit<User, 'id'>, // Menyimpan nilai yang di-edit
      }));
      setDetail([...detail, item.id]); // Menambah ID pengguna ke daftar detail
    }
  };

  // Fungsi untuk mengatur pengurutan
  const sort = useSort(data, {}, {
    sortFns: {
      ID: (array) => array.sort((a, b) => a.id - b.id), // Pengurutan berdasarkan ID
      NAME: (array) => array.sort((a, b) => a.login.localeCompare(b.login)), // Pengurutan berdasarkan nama
    },
    sortIcon: {
      margin: "auto",
      iconDefault: <SwapVertIcon fontSize="small" />, // Ikon default
      iconUp: <KeyboardArrowUpIcon fontSize="small" />, // Ikon untuk pengurutan naik
      iconDown: <KeyboardArrowDownIcon fontSize="small" />, // Ikon untuk pengurutan turun
    },
  });

  // Pengaturan untuk pemilihan baris
  const select = useRowSelect(data, {
    state: { id: "1" },
  }, {
    rowSelect: SelectTypes.MultiSelect, // Memungkinkan pemilihan multibaris
  });
  
  // Fungsi untuk menghapus pengguna
  const handleDeleteUser = async (userId: number) => {
    await deleteUsers(userId); // Menghapus pengguna melalui layanan
    onUserUpdate(); // Memperbarui daftar pengguna setelah penghapusan
  }

  // Fungsi untuk menangani perubahan input
  const handleInputChange = (id: number, field: keyof User, value: string | number) => {
    if (field === 'email') {
      if (!validateEmail(value as string)) { // Validasi email
        setEmailError(prev => ({ ...prev, [id]: 'Invalid email format' }));
      } else {
        setEmailError(prev => ({ ...prev, [id]: '' })); // Bersihkan pesan error
      }
    }

    if (field === 'age') { // Validasi usia
      const ageValue = Number(value);
      if (!validateAge(ageValue)) {
        setAgeError(prev => ({ ...prev, [id]: 'The minimum age is 30 years' }));
      } else {
        setAgeError(prev => ({ ...prev, [id]: '' })); // Bersihkan pesan error
      }
    }

    if (field === 'url') { // Validasi URL
      if (!validateUrl(value as string)) {
        setUrlError(prev => ({ ...prev, [id]: 'Invalid URL format' }));
      } else {
        setUrlError(prev => ({ ...prev, [id]: '' })); // Bersihkan pesan error
      }
    }

    setEditValues(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value, // Memperbarui nilai yang diedit
      },
    }));
  };


  // Fungsi untuk memperbarui pengguna
  const handleUpdateUser = async (item: User) => {
    const updatedValue = editValues[item.id];
  
    // Validasi bahwa semua field yang diperlukan terisi
    if (!updatedValue || 
        !updatedValue.login || 
        !updatedValue.email || 
        !updatedValue.age || 
        !updatedValue.url || 
        updatedValue.status === undefined) {
      alert('All fields must be filled out to update.'); // Peringatan jika ada field yang kosong
      return;
    }
  
    // Jika tidak ada yang berubah
    if (
      (item.login === updatedValue.login && 
       item.email === updatedValue.email && 
       item.age === updatedValue.age && 
       item.status === updatedValue.status &&
       item.url === updatedValue.url)) {
      alert('No changes made. Please enter at least one field to update.'); // Peringatan jika tidak ada perubahan
      return;
    }
  
    // Validasi email, usia, dan URL sebelum memperbarui
    if (emailError[item.id]) {
      alert('Enter a valid email address.'); // Peringatan jika email tidak valid
      return;
    }
    if (ageError[item.id]) {
      alert('Age must be greater than or equal to 30.'); // Peringatan jika usia tidak valid
      return;
    }
    if (urlError[item.id]) {
      alert('Enter a valid URL.'); // Peringatan jika URL tidak valid
      return;
    }
  
    const userPayload = { 
      ...item, // Memuat informasi pengguna lama
      ...updatedValue // Memuat informasi yang diperbarui
    };
  
    await updateUsers(item.id, userPayload); // Memperbarui pengguna melalui layanan
  
    onUserUpdate(); // Memperbarui daftar pengguna
  };
  

  // Fungsi untuk mengubah status pengguna
  const toggleUserStatus = (id: number) => {
    const currentStatus = editValues[id]?.status; // Mendapatkan status saat ini
    handleInputChange(id, 'status', !currentStatus); // Mengubah status
  };

  // Fungsi untuk menangani scroll pada tabel
  const handleScroll = () => {
    const tableElement = table.current as HTMLDivElement;
    if (tableElement) {
      if (tableElement.scrollLeft > 0) { 
        setIsScrolling(true); // Menandai bahwa tabel sedang di-scroll
        setDetail([]); // Menghapus detail yang ditampilkan
      } else {
        setIsScrolling(false); // Menandai bahwa tabel tidak di-scroll
      }
    }
  };

  // Effect untuk mengelola resize dan scroll
  useEffect(() => {
    const element = table.current as HTMLDivElement;
    const resizeObserver = new ResizeObserver(() => {
      if (element) {
        element.addEventListener('scroll', handleScroll); // Menangkap event scroll
        const formUpdate = document.getElementsByClassName('formUpdate'); // Mengambil elemen dengan class formUpdate
        for (let i = 0; i < formUpdate.length; i++) {
          const formUpdateElement = formUpdate[i] as HTMLElement;
          formUpdateElement.style.width = `${element.offsetWidth}px`; // Mengatur lebar elemen form
        }
      }
    });

    if (element) {
      element.addEventListener('scroll', handleScroll); // Menambahkan event listener scroll
      resizeObserver.observe(element); // Memantau perubahan ukuran
    } 
    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll); // Menghapus event listener scroll
      }
      resizeObserver.disconnect(); // Menghentikan pemantauan resize
    };
  }, [users]); // Menggunakan users sebagai dependensi
  
  
  if (!users) return null; // Jika tidak ada pengguna, kembali null
  
  // Mengembalikan komponen tabel dengan data pengguna
  return (
    <Table ref={table} className="relative rounded-xl border border-indigo-900 mb-5" data={data} theme={theme} layout={{custom: true, fixedHeader: true }} sort={sort} select={select}>
      {(tableList) => (
        <>
          <Header>
            <HeaderRow>
              <HeaderCellSort pinLeft sortKey="ID">ID</HeaderCellSort>
              <HeaderCellSort resize sortKey="NAME">Name</HeaderCellSort>
              <HeaderCell style={{textAlign: 'center'}}>Status</HeaderCell>
              <HeaderCell resize style={{textAlign: 'center'}}>Email</HeaderCell> 
              <HeaderCell pinRight className='text-center'></HeaderCell>
            </HeaderRow>
          </Header>

          <Body>
            {tableList.map((item: User) => (
              <React.Fragment key={item.id}>
                <Row key={item.id} item={item}>
                  <Cell pinLeft className='text-center' onClick={()=>handleExpand(item)}>{item.id}</Cell>
                  <Cell onClick={()=>handleExpand(item)}>{item.login}</Cell>
                  <Cell className='text-center' onClick={()=>handleExpand(item)}>
                    <Brightness2Icon color={item.status ? 'success' : 'error'} fontSize="small" />
                  </Cell>
                  <Cell className='text-center' onClick={()=>handleExpand(item)}>{item.email}</Cell> 
                  <Cell pinRight className='text-center' onClick={() => handleDeleteUser(item.id)}>
                    <DeleteOutlineIcon color='warning' fontSize="small" />
                  </Cell>
                </Row>
                {/* Form Update */}
                {detail.includes(item.id) && (
                  <tr  className='relative formUpdate px-5 pb-4 pt-11' style={{ display: "flex", gridColumn: "1 / -1" }}>
                    <td style={{ flex: "1" }}>
                      <ul className='text-white grid gap-3'>
                        <li className="lg:flex grid gap-3">
                          <label className="min-w-[150px]">Name</label>
                          <input
                            className="px-4 py-2 outline-none border border-slate-600 rounded-md w-full"
                            type="text"
                            value={editValues[item.id]?.login}
                            onChange={(e) => handleInputChange(item.id, 'login', e.target.value)}
                            style={{ backgroundColor: "rgb(12, 10, 29)" }}
                          />
                        </li>
                        <li className="lg:flex grid gap-3">
                          <label className="min-w-[150px]">Email</label>
                          <div className="grid w-full">
                            <input
                              className="px-4 py-2 outline-none border border-slate-600 rounded-md w-full"
                              type="text"
                              value={editValues[item.id]?.email}
                              onChange={(e) => handleInputChange(item.id, 'email', e.target.value)}
                              style={{ backgroundColor: "rgb(12, 10, 29)" }}
                            />
                            {emailError[item.id] && <small className="text-red-500">{emailError[item.id]}</small>}
                          </div>
                        </li>
                        <li className="lg:flex grid gap-3">
                          <label className="min-w-[150px]">Age</label>
                          <div className="grid w-full">
                            <input
                              className="px-4 py-2 outline-none border border-slate-600 rounded-md w-full"
                              type="number"
                              value={editValues[item.id]?.age}
                              onChange={(e) => handleInputChange(item.id, 'age', e.target.value)}
                              style={{ backgroundColor: "rgb(12, 10, 29)" }}
                            />
                            {ageError[item.id] && <small className="text-red-500">{ageError[item.id]}</small>}
                          </div>
                        </li>
                        <li className="lg:flex grid gap-3">
                          <label className="min-w-[150px]">Github URL</label>
                          <div className='grid w-full'>
                          <input
                            className="px-4 py-2 outline-none border border-slate-600 rounded-md w-full"
                            type="text"
                            value={editValues[item.id]?.url}
                            onChange={(e) => handleInputChange(item.id, 'url', e.target.value)}
                            style={{ backgroundColor: "rgb(12, 10, 29)" }}
                          />
                          {urlError[item.id] && <small className="text-red-500">{urlError[item.id]}</small>} 
                          </div>
                        </li>
                        <li className="flex gap-3 mt-2 lg:mt-0">
                          <label className="min-w-[150px]">Status</label>
                          <button 
                            className={`transition-all px-4 py-1 outline-none hover:brightness-110 rounded-md ${(editValues[item.id]?.status === true) ? "bg-green-700" : "bg-red-600"}`}
                            onClick={() => toggleUserStatus(item.id)}>
                            {(editValues[item.id]?.status === true) ? "Active" : "Inactive"}
                          </button>
                        </li>
                        <button className='w-full sm:w-auto mt-4 outline-none ms-auto text-white px-4 rounded-md py-1 border border-white hover:bg-indigo-900 hover:border-indigo-900 active:border-indigo-950 active:bg-indigo-950 transition' onClick={() => handleUpdateUser(item)}>
                          Update
                        </button>
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </Body>
        </>
      )}
    </Table>
  );
};

export default UserList;
