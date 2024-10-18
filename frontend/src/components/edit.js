import { React, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";

import DatePickerField from "./forms/BasicDateFields";
import BasicTextFields from "./forms/TextFields";
import MultilineTextFields from "./forms/MultilineField";
import BasicSelectFields from "./forms/SelectFields";

import Dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import TimePickerField from "./forms/BasicTimeFields";

import AxiosInstance from "./axios";

const Edit = () => {

    const MyParam = useParams()
    const MyId = MyParam.meeting_name

    const [department, setDepartment] = useState()
    const [loading, setLoading] = useState(true)

    // const hardcode_options = [
    //     {id: '', name: 'None'},
    //     {id: 'DH02', name: 'Phòng Điều Hành 02'},
    //     {id: 'AD01', name: 'Phòng Quản Lý 01'},
    //     {id: 'KD01', name: 'Phòng Kinh Doanh 01'},

    // ]

    const getData = () => {
        AxiosInstance.get(`department/`).then((res) => {
            setDepartment(res.data)
            console.log(res.data)
        })

        AxiosInstance.get(`project/${MyId}`).then((res) => {
            // console.log(res.data)
            setValue('name', res.data.meeting_name)
            setValue('depart', res.data.id_depart)
            setValue('link', res.data.meeting_link)
            setValue('start_day', Dayjs(res.data.start_date))
            setValue('end_day', Dayjs(res.data.end_date))
            setValue('start_time', Dayjs(res.data.start_time, "HH:mm:ss"))
            setValue('end_time', Dayjs(res.data.end_time, "HH:mm:ss"))
            setLoading(false)
        })

    }

    useEffect(() => {
        // console.log(MyId)
        getData();
    }, [])

    const navigate = useNavigate()

    const defaultValues = {
        name: '',
        link: '',

    };
    // link la lay ten duoc khai bao tu urrl cua backend
    const { handleSubmit, reset, setValue, control } = useForm({ defaultValues })
    const submission = (data) => {
        // Log dữ liệu nhận được từ form
        // console.log(data);

        // Nếu `data.start_date` và `data.end_date` là `dayjs` object, bạn có thể trực tiếp sử dụng chúng.
        const StartDate = Dayjs(data.start_date).format("YYYY-MM-DD");
        const EndDate = Dayjs(data.end_date).format("YYYY-MM-DD");
        const StartTime = Dayjs(data.start_time).format("HH:mm:ss");
        const EndTime = Dayjs(data.end_time).format("HH:mm:ss");

        // Log dữ liệu gửi đi
        // console.log({
        //     meeting_name: data.name,
        //     meeting_link: data.link,
        //     start_date: StartDate,
        //     end_date: EndDate,
        //     start_time: StartTime,
        //     end_time: EndTime
        // });

        // Gửi yêu cầu tới server
        AxiosInstance.put(`project/${MyId}/`, {
            meeting_name: data.name,
            meeting_link: data.link,
            start_date: StartDate,
            end_date: EndDate,
            start_time: StartTime,
            end_time: EndTime,
            id_depart: data.depart,
        })
            .then((res) => {
                navigate('/list');
            })
            .catch((error) => {
                if (error.response) {
                    console.error('Error status:', error.response.status);
                    console.error('Error data:', error.response.data);
                } else {
                    console.error('Error message:', error.message);
                }
            });
    };



    return (
        <div style={{
            marginTop: '150px'
        }}>
            {loading ? <p> Loading data... </p> :
                <form onSubmit={handleSubmit(submission)}>
                    <Box
                        sx={{
                            display: 'flex',
                            width: '100%',
                            backgroundColor: '#00003f',
                            marginBottom: '10px'
                        }}>
                        <Typography sx={{ marginLeft: '20px', color: '#ffffff' }}>
                            Cập nhật thông tin cuộc họp
                        </Typography>

                    </Box>

                    <Box sx={{
                        display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            marginBottom: '40px'
                        }}>
                            <BasicTextFields
                                label="Tên cuộc họp"
                                // đặt tên cho phù hợp để truyền data
                                name="name"
                                control={control}
                                placeholder="Provide a meeting name"
                                width={'30%'}
                            />

                            <DatePickerField
                                label="Ngày bắt đầu"
                                name="start_day"
                                control={control}
                                width={'30%'}
                            />
                            <DatePickerField
                                label="Ngày kết thúc"
                                name="end_day"
                                control={control}
                                width={'30%'}
                            />
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-around',

                        }}>
                            <MultilineTextFields
                                label="Đường link cuộc họp"
                                name="link"
                                control={control}
                                placeholder="Provide a link meeting "
                                width={'30%'}
                            />
                            <TimePickerField
                                label="Thời gian bắt đầu "
                                name="start_time"
                                control={control}
                                width={'30%'}
                            />
                            <TimePickerField
                                label="Thời gian kết thúc"
                                name="end_time"
                                control={control}
                                width={'30%'}
                            />

                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                marginTop: '20px'
                            }}>
                            <BasicSelectFields
                                label="Bộ phận"
                                name="depart"
                                control={control}
                                width={'30%'}
                                options={department}
                            />

                        </Box>


                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: '20px'
                            }}>
                            <Button variant="contained" type="submit" sx={{ width: '30%' }}>
                                Cập nhật
                            </Button>
                        </Box>
                    </Box>
                </form>}
        </div>
    )
}

export default Edit