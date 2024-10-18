import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "./axios";
import { MaterialReactTable } from 'material-react-table';
import { Box, IconButton, TextField, Button, Snackbar, Alert, Typography } 
from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Margin } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ListSum = () => {
    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(""); // State to hold the search input value
    const [mssv, setMSSV] = useState(""); // Store MSSV input
    const [isMSSVValid, setIsMSSVValid] = useState(false); // Track if valid MSSV is entered
    const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message

    // Function to validate MSSV input
    const validateMSSV = () => {
        if (mssv.trim() !== "") {
            AxiosInstance.get(`users/select_role/`).then((res) => {
                const user = res.data.find(u => u.mssv === mssv);
                if (user) {
                    setIsMSSVValid(true);
                } else {
                    setSnackbarMessage("MSSV không hợp lệ!");
                    setOpenSnackbar(true);
                }
            });
        }
    };

    const getData = () => {
        if (isMSSVValid) {
            setLoading(true); // Set loading to true when fetching data
            AxiosInstance.get(`summarize/`).then((res) => {
                let filteredData = res.data.filter(item => item.mssv === mssv); // Filter based on MSSV

                if (globalFilter) {
                    // Filter the data further based on department code
                    filteredData = filteredData.filter(item =>
                        item.num_depart.toLowerCase().includes(globalFilter.toLowerCase())
                    );
                }

                if (filteredData.length === 0) {
                    setSnackbarMessage("Không tìm thấy bản tóm tắt cho MSSV này!");
                    setOpenSnackbar(true);
                }

                setMyData(filteredData);
                setLoading(false); // Set loading to false after data is fetched
            }).catch((err) => {
                setSnackbarMessage("Lỗi khi tải dữ liệu!");
                setOpenSnackbar(true);
                setLoading(false); // In case of error, stop loading
            });
        }
    };

    useEffect(() => {
        if (isMSSVValid) {
            getData();
        }
    }, [isMSSVValid, globalFilter]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'sum_content',
                header: 'Summary Content',
                size: 150,
            },
            {
                accessorKey: 'sum_link',
                header: 'Summary Link',
                size: 150,
            },
            {
                accessorKey: 'mssv',
                header: 'MSSV',
                size: 150,
            },
            {
                accessorKey: 'num_depart',
                header: 'Department',
                size: 150,
            },
        ],
        [],
    );

    const handleSearch = () => {
        getData();
    };

    const handleMSSVSubmit = () => {
        validateMSSV();
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const styles = {
        frame:{
            marginTop: '150px'
        },
        box: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 2,
            backgroundColor: '#f0f0f0',
        },
    }

    return (
        <div style={styles.frame}>
            {!isMSSVValid ? (
                <Box sx={styles.box}>
                    <Typography variant="h4" gutterBottom>
                        Nhập mã số sinh viên
                    </Typography>
                    <TextField
                        label="Nhập mã số sinh viên (MSSV)"
                        value={mssv}
                        onChange={(e) => setMSSV(e.target.value)}
                        sx={{ marginBottom: '10px', width: '300px' }}
                    />
                    <Button variant="contained" onClick={handleMSSVSubmit}>
                        Xác nhận MSSV
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    {/* <TextField
                        placeholder="Vui lòng nhập mã bộ phận ..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        variant="outlined"
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                    >
                        Search
                    </Button> */}
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ 
                            fontWeight: 'bold',
                            color: '#1976d2',
                            marginTop: '20px',
                            fontFamily: 'Arial, sans-serif',
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: '#f5f5f5', // Add background color to make it stand out
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Optional shadow for depth
                            width: '100%', // Ensure it spans the full width
                            textAlign: 'center'
                        }}
                    >
                        DANH SÁCH BẢN TÓM TẮT
                    </Typography>
                </Box>
            )}

            {loading ? (
                <p>Loading data...</p>
            ) : (
                isMSSVValid && (
                    <MaterialReactTable
                        columns={columns}
                        data={myData}
                        enableRowActions
                        renderRowActions={({ row }) => (
                            <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                                <IconButton color="secondary" component={Link} to={`edit/${row.original.id}`}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        )}
                    />
                )
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            >
                <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ListSum;
