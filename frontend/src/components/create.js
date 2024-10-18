import React, { useEffect, useState } from "react";
import { Box, Button, Typography, TextField, Snackbar, Alert } from "@mui/material";
import DatePickerField from "./forms/BasicDateFields";
import BasicTextFields from "./forms/TextFields";
import MultilineTextFields from "./forms/MultilineField";
import BasicSelectFields from "./forms/SelectFields";
import Dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import TimePickerField from "./forms/BasicTimeFields";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import AxiosInstance from "./axios";

const Create = () => {
    const [department, setDepartment] = useState();
    const [loading, setLoading] = useState(true);
    const [mssv, setMSSV] = useState(""); // Track MSSV input
    const [isMSSVEntered, setIsMSSVEntered] = useState(false); // Track if MSSV has been entered
    const [userRole, setUserRole] = useState(""); // Store the role after fetching
    const [canCreateMeeting, setCanCreateMeeting] = useState(false); // Track if the user can create a meeting
    const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message

    const getData = () => {
        AxiosInstance.get(`department/`).then((res) => {
            setDepartment(res.data);
            setLoading(false);
        });
    };

    useEffect(() => {
        getData();
    }, []);

    const navigate = useNavigate();

    const defaultValues = {
        name: '',
        link: '',
        start_day: null,
        end_day: null,
    };

    // Form validation schema
    const schema = yup.object({
        name: yup.string().required('Name is a required field'),
        depart: yup.string().required('Depart is a required field'),
        link: yup.string().required('Link is a required field'),
        start_day: yup.date().nullable().required('Start day is required'),
        end_day: yup.date().nullable().required('End day is required'),
    });

    const { handleSubmit, control } = useForm({ defaultValues, resolver: yupResolver(schema) });

    // Submission function
    const submission = (data) => {
        const StartDate = Dayjs(data.start_day).format("YYYY-MM-DD");
        const EndDate = Dayjs(data.end_day).format("YYYY-MM-DD");
        const StartTime = Dayjs(data.start_time).format("HH:mm:ss");
        const EndTime = Dayjs(data.end_time).format("HH:mm:ss");

        AxiosInstance.post('project/', {
            meeting_name: data.name,
            meeting_link: data.link,
            start_date: StartDate,
            end_date: EndDate,
            start_time: StartTime,
            end_time: EndTime,
            num_depart: data.depart,
        })
            .then(() => navigate('/list'))
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    // Display an error message if the meeting name is already taken
                    setSnackbarMessage("Tên cuộc họp đã tồn tại. Vui lòng chọn tên khác.");
                } else {
                    setSnackbarMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
                }
                setOpenSnackbar(true); // Open Snackbar to show the message
            });
    };

    const handleMSSVSubmit = () => {
        if (mssv.trim() !== "") {
            AxiosInstance.get(`users/select_role/`).then((res) => {
                const user = res.data.find(u => u.mssv === mssv);
                if (user) {
                    setUserRole(user.role);
                    if (user.role === '0' || user.role === '1') {
                        setCanCreateMeeting(true);
                        setIsMSSVEntered(true);
                    } else {
                        setSnackbarMessage("Chức vụ của bạn không được phép tạo cuộc họp.");
                        setOpenSnackbar(true);
                    }
                } else {
                    setSnackbarMessage("MSSV không hợp lệ!");
                    setOpenSnackbar(true);
                }
            });
        }
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const navigateToGGMeet = () => {
        window.open('https://meet.google.com/landing', '_blank');
    };
    const handleButtonClick = () => {
        navigate('/add-depart'); // Chuyển hướng đến trang mong muốn
    };

    const styles = {
        frame: {
            marginTop: '100px',  // Tạo khoảng cách từ trên cùng
        },
    }
    return (
        <div style={styles.frame}>
            {/* Chỉ hiển thị input MSSV nếu chưa nhập */}
            {!isMSSVEntered ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80%',  // Adjust width to 80% of the parent container
                        height: 'auto',  // Adjust height based on content
                        margin: 'auto',  // Center the box
                        padding: '40px',  // Add padding for a more spacious look
                        boxShadow: 3,  // Add shadow for better visual structure
                        backgroundColor: '#f9f9f9',  // Lighter background for the form
                        borderRadius: '12px',  // Add rounded corners for a modern look
                        marginTop: '150px',
                    }}
                >
                    <Typography variant="h6">Nhập mã số sinh viên (MSSV) để tạo cuộc họp</Typography>
                    <TextField
                        label="MSSV"
                        variant="outlined"
                        value={mssv}
                        onChange={(e) => setMSSV(e.target.value)}
                        sx={{ marginTop: '10px', width: '300px' }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleMSSVSubmit}
                        sx={{ marginTop: '10px', width: '150px' }}
                    >
                        Xác nhận
                    </Button>
                </Box>
            ) : canCreateMeeting ? (
                <form onSubmit={handleSubmit(submission)}>
                    <Typography
                        variant="h4"
                        align="center"
                        color="primary"
                        sx={{
                            fontWeight: 'bold',
                            marginBottom: 4
                        }}
                    >
                        Chào mừng đến với quyền thêm cuộc họp
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <Button
                            variant="contained"
                            type="button" // Đổi thành type="button" để không submit form
                            onClick={handleButtonClick} // Gắn hàm điều hướng vào sự kiện onClick
                            sx={{ width: '30%', fontSize: '16px' }}
                        >
                            Thêm bộ phận
                        </Button>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        width: '100%',
                        marginLeft: 'auto',
                        flexDirection: 'column',
                        padding: 4,
                        boxShadow: 3
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', marginBottom: '40px' }}>
                            <BasicTextFields label="Tên cuộc họp" name="name" control={control} width={'30%'} />
                            <DatePickerField label="Ngày bắt đầu" name="start_day" control={control} width={'30%'} />
                            <DatePickerField label="Ngày kết thúc" name="end_day" control={control} width={'30%'} />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                            <MultilineTextFields label="Đường link cuộc họp" name="link" control={control} width={'30%'} />
                            <TimePickerField label="Thời gian bắt đầu" name="start_time" control={control} width={'30%'} />
                            <TimePickerField label="Thời gian kết thúc" name="end_time" control={control} width={'30%'} />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '20px'
                        }}>
                            <BasicSelectFields label="Bộ phận" name="depart" control={control} width={'30%'} options={department} />
                        </Box>



                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                            <Button
                                variant="contained"
                                onClick={navigateToGGMeet}
                                sx={{
                                    width: '30%',
                                    height: '50px',
                                    fontSize: '16px',
                                    marginRight: '20px'
                                }}>
                                Link meeting
                            </Button>

                            <Button variant="contained" type="submit" sx={{ width: '30%', fontSize: '16px' }}>
                                TẠO CUỘC HỌP
                            </Button>
                        </Box>
                    </Box>
                </form>
            ) : null}

            {/* Snackbar for notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Create;
