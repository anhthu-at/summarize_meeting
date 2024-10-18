import React, { useState } from "react";
import { Box, Button, Typography, TextField, Snackbar, Alert, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AxiosInstance from "./axios";

// Validation schema using Yup
const schema = yup.object().shape({
    num_depart: yup.string().required("Mã bộ phận là bắt buộc"),
    name_depart: yup.string().required("Tên bộ phận là bắt buộc"),
    role: yup.string().required("Phân quyền là bắt buộc"),
});

const AddDepart = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();

    // Initialize React Hook Form with Yup resolver
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    // Form submission handler
    const onSubmit = async (data) => {
        try {
            // Send POST request to backend to add department
            const response = await AxiosInstance.post("department/", {
                num_depart: data.num_depart,
                name_depart: data.name_depart,
                role: data.role,
            });
            if (response.status === 200) {
                setOpenSnackbar(true);  // Success feedback
                setTimeout(() => {
                    navigate("/list-depart");  // Redirect to list of departments after success
                }, 1500); // Điều hướng sau 1.5 giây
            }
        } catch (error) {
            console.error("Error adding department:", error);
        }
    };

    return (
        <div style={{
            marginTop: '150px'
        }}>
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Thêm Bộ Phận
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Department ID Field */}
                <TextField
                    label="Mã Bộ Phận"
                    fullWidth
                    margin="normal"
                    {...register("num_depart")}
                    error={!!errors.num_depart}
                    helperText={errors.num_depart?.message}
                />
                {/* Department Name Field */}
                <TextField
                    label="Tên Bộ Phận"
                    fullWidth
                    margin="normal"
                    {...register("name_depart")}
                    error={!!errors.name_depart}
                    helperText={errors.name_depart?.message}
                />
                {/* Role Field */}
                <TextField
                    label="Phân Quyền"
                    select
                    fullWidth
                    margin="normal"
                    {...register("role")}
                    error={!!errors.role}
                    helperText={errors.role?.message}
                >
                    <MenuItem value="0">Quyền quản trị (0)</MenuItem>
                    <MenuItem value="1">Quyền quản lý (1)</MenuItem>
                    <MenuItem value="2">Quyền người dùng (2)</MenuItem>
                </TextField>

                {/* Submit Button */}
                <Button variant="contained" color="primary" type="submit" fullWidth>
                    Gửi
                </Button>
            </form>

            {/* Success Snackbar */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="success">
                    Bộ phận đã được thêm thành công!
                </Alert>
            </Snackbar>
        </Box>
    </div>);
};

export default AddDepart;
