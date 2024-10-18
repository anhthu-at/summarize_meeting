import React, { useEffect, useMemo, useState } from "react";
import AxiosInstance from "./axios";
import { MaterialReactTable } from 'material-react-table';
import { Box, IconButton, Button } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Dayjs from "dayjs";

const ListDepart = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch departments when the component loads
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await AxiosInstance.get("department/");
                setDepartments(response.data);
            } catch (error) {
                console.error("Error fetching departments:", error);
                setError("Unable to load departments. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    // Define columns for the MaterialReactTable
    const columns = useMemo(() => [
        {
            accessorKey: 'num_depart',
            header: 'Mã Bộ Phận',
        },
        {
            accessorKey: 'name_depart',
            header: 'Tên Bộ Phận',
        },
        {
            accessorKey: 'role',
            header: 'Phân Quyền',
            Cell: ({ cell }) => {
                const role = cell.getValue();
                return role === 0 ? 'Quản trị' : role === 1 ? 'Quản lý' : 'Người dùng';
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Ngày Tạo',
            Cell: ({ cell }) => Dayjs(cell.getValue()).format('DD/MM/YYYY'),
        },
    ], []);

    // Handle deletion of department
    const handleDelete = async (num_depart) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bộ phận này không?")) {
            try {
                const response = await AxiosInstance.delete(`department/${num_depart}/`);
                console.log(response); // Kiểm tra phản hồi từ API
                if (response.status === 204) { // 204 No Content là trạng thái thành công cho việc xóa
                    setDepartments(departments.filter(department => department.num_depart !== num_depart));
                } else {
                    throw new Error('Failed to delete department');
                }
            } catch (error) {
                console.error("Error deleting department:", error);
                setError("Unable to delete department. Please try again.");
            }
        }
    };
    
    
    

    return (
        <div style={{
            marginTop: '150px'
        }}>
        <Box sx={{ padding: 2 }}>
            <h1>Danh sách Bộ Phận</h1>

            {/* Add Department Button */}
            <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/add-depart"
                sx={{ marginBottom: 2 }}
            >
                Thêm Bộ Phận
            </Button>

            {/* Display loading, error, or table */}
            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <MaterialReactTable
                    columns={columns}
                    data={departments}
                    enableRowActions
                    renderRowActions={({ row }) => (
                        <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: '8px' }}>
                            {/* Edit Button */}
                            <IconButton color="secondary" component={Link} to={`edit/${row.original.num_depart}`}>
                                <EditIcon />
                            </IconButton>

                            {/* Delete Button */}
                            <IconButton color="error" onClick={() => handleDelete(row.original.num_depart)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    )}
                />
            )}
        </Box>
    </div>
    );
};

export default ListDepart;
