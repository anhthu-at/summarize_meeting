import React, { useEffect, useState } from "react";
import { Box, Button, Typography, CircularProgress, Snackbar, Alert, TextField, MenuItem } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form"; 
import AxiosInstance from "./axios";
import DatePickerField from "./forms/BasicDateFields";

const EditDepart = () => {
    const { num_depart } = useParams();
    const navigate = useNavigate();

    const { control, handleSubmit, setValue } = useForm();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                const response = await AxiosInstance.get(`/department/${num_depart}`);
                const department = response.data;
                setValue("num_depart", department.num_depart); // Added num_depart
                setValue("name_depart", department.name_depart);
                setValue("role", department.role);
                if (department.created_at) {
                    const date = new Date(department.created_at);
                    if (!isNaN(date.getTime())) {
                        setValue("created_at", date.toISOString().split("T")[0]);
                    }
                }
                setLoading(false);
            } catch (err) {
                setError("Lỗi khi tải dữ liệu bộ phận.");
                setLoading(false);
            }
        };
        fetchDepartment();
    }, [num_depart, setValue]);

    const onSubmit = async (data) => {
        try {
            await AxiosInstance.put(`/department/${num_depart}/`, data);
            setSuccess(true);
            setTimeout(() => navigate('/list-depart'), 2000);
        } catch (err) {
            setError("Không thể cập nhật bộ phận. Vui lòng thử lại.");
        }
    };

    const styles = {
        frame: {
            marginTop: '80px',  // Tạo khoảng cách từ trên cùng
        },
    }
    return (
        <div style={styles.frame}>
        <Box sx={{ padding: 3, maxWidth: 600, margin: "auto" }}>
            <Typography variant="h4" gutterBottom>
                Chỉnh Sửa Bộ Phận
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#00003f', marginBottom: '10px' }}>
                        <Typography sx={{ marginLeft: '20px', color: '#ffffff' }}>
                            Cập nhật thông tin bộ phận
                        </Typography>
                    </Box>

                    {/* num_depart field with Controller */}
                    <Box sx={{ marginBottom: 2 }}>
                        <Controller
                            name="num_depart"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Kí Hiệu Bộ Phận"
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.num_depart}
                                    helperText={errors.num_depart?.message}
                                />
                            )}
                        />
                    </Box>

                    {/* name_depart field with Controller */}
                    <Box sx={{ marginBottom: 2 }}>
                        <Controller
                            name="name_depart"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Tên Bộ Phận"
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.name_depart}
                                    helperText={errors.name_depart?.message}
                                />
                            )}
                        />
                    </Box>

                    {/* Role selection */}
                    <Box sx={{ marginBottom: 2 }}>
                        <Controller
                            name="role"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Phân Quyền"
                                    select
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.role}
                                    helperText={errors.role?.message}
                                >
                                    <MenuItem value="0">Quyền quản trị (0)</MenuItem>
                                    <MenuItem value="1">Quyền quản lý (1)</MenuItem>
                                    <MenuItem value="2">Quyền người dùng (2)</MenuItem>
                                </TextField>
                            )}
                        />
                    </Box>

                    {/* Created At DatePicker */}
                    <Box sx={{ marginBottom: 2 }}>
                        <DatePickerField
                            label="Ngày Tạo"
                            name="created_at"
                            control={control}
                            error={!!errors.created_at}
                            helperText={errors.created_at?.message}
                        />
                    </Box>

                    <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 2 }}>
                        Cập Nhật
                    </Button>
                </form>
            )}

            <Snackbar open={success} autoHideDuration={2000} onClose={() => setSuccess(false)}>
                <Alert onClose={() => setSuccess(false)} severity="success">
                    Cập nhật bộ phận thành công!
                </Alert>
            </Snackbar>
        </Box>
        </div>
    );
};

export default EditDepart;
