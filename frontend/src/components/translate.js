import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Translate = () => {
    const navigate = useNavigate();

    const navigateToAudio = () => {
        navigate('/translate-audio');
    };

    const navigateToPDF = () => {
        navigate('/translate-document');
    };

    const navigateToVideo = () => {
        navigate('/translate-video');
    };

    const styles = {
        frame: {
            marginTop: '150px',  // Tạo khoảng cách từ trên cùng
        },
        buttonAudio: {
            backgroundColor: '#27A4F2', // Blue shade
            color: 'white',
            margin: '10px 20px 20px 0px',
        },
        buttonPDF: {
            backgroundColor: '#6586E6', // Lighter blue shade
            color: 'white',
            margin: '10px 20px 20px 0px',
        },
        buttonVideo: {
            backgroundColor: '#91A8', // Even lighter blue shade
            color: 'white',
            margin: '10px 20px 20px 0px',
        },
    };

    return (
        <div style={styles.frame}>
            <h1>CHUYỂN ĐỔI NỘI DUNG</h1>
            <h2>(TIẾNG ANH)</h2>
            <Button 
                variant="contained" 
                style={styles.buttonAudio} 
                onClick={navigateToAudio}
            >
                Chuyển đổi với Audio
            </Button>
            <Button 
                variant="contained" 
                style={styles.buttonPDF} 
                onClick={navigateToPDF}
            >
                Chuyển đổi với PDF
            </Button>
            <Button 
                variant="contained" 
                style={styles.buttonVideo} 
                onClick={navigateToVideo}
            >
                Chuyển đổi với Video
            </Button>
        </div>
    );
};

export default Translate;
