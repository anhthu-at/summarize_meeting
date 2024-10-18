import { React, useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AxiosInstance from "./axios";

const DeleteSum = () => {
    const MyParam = useParams()
    const MyId = MyParam.id
    console.log(MyId)

    const [myData, setmyData] = useState()
    const [loading, setLoading] = useState(true)


    const getData = () => {
        AxiosInstance.get(`summarize/${MyId}`).then((res) => {
            setmyData(res.data)
            console.log(res.data)
            setLoading(false)
        })

    }

    useEffect(() => {
        // console.log(MyId)
        getData();
    }, [])

    const navigate = useNavigate()
    const submission = (data) => {
        // Gửi yêu cầu tới server
        // link la lay ten duoc khai bao tu url cua backend
        AxiosInstance.delete(`summarize/${MyId}/`)
            .then((res) => {
                navigate('/listsum');
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
            marginLeft: '250px'
        }}>
            { loading ? <p> Loading data... </p> : 
        <div>
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    backgroundColor: '#00003f',
                    marginBottom: '10px'
                }}>
                <Typography sx={{ marginLeft: '20px', color: '#ffffff' }}>
                    Delete summarize: {myData.id}
                </Typography>
            </Box>

            <Box sx={{
                display: 'flex', width: '100%', boxShadow: 3, padding: 4, flexDirection: 'column'
            }}>
                <Box sx={{
                    display: 'flex', justifyContent: 'start', marginBottom: '40px'
                }}>
                    Bạn chắc chắn muốn xóa tóm tắt này không ? {myData.sum_link}
                </Box>

                <Box sx={{ width: '30%', display: 'flex', justifyContent: 'flex-end',marginTop: '20px'
                    }}>
                    <Button variant="contained" onClick={submission} sx={{ width: '100%' }}>
                        Xóa
                    </Button>
                </Box>
            </Box>
            </div> }
        </div>
    )
}

export default DeleteSum;
