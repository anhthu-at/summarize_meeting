import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Đảm bảo rằng axios đã được cài đặt và import

const API_ENDPOINT_LOGIN = 'http://localhost:8000/api/login/';

const Login = () => {
  const [studentId, setStudentId] = useState(''); // Mã số sinh viên
  const [password, setPassword] = useState('');   // Mật khẩu
  const [error, setError] = useState('');  // Lỗi
  const [mssv, setMssv] = useState('');        

  const navigate = useNavigate();

  const savedStudentId = localStorage.getItem('studentId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_ENDPOINT_LOGIN, {
        student_id: studentId,
        password: password,
      });
      
      if (response.status === 200) {
        localStorage.setItem('authToken', response.data.token); // Lưu token vào localStorage
        localStorage.setItem('studentId', studentId); // Lưu mã số sinh viên vào localStorage
        navigate('/home'); // Chuyển hướng đến trang chính sau khi đăng nhập thành công
      }
    } catch (err) {
      setError('Thông tin đăng nhập không hợp lệ'); // Thông báo lỗi
    }
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Đăng Nhập</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label>Nhập mã số sinh viên:</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            style={styles.input}
            placeholder="Nhập vào"
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <Button type="submit" style={styles.button}>
          Đăng Nhập
        </Button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '300px',
    margin: '100px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '15px',
  },
};

export default Login;
