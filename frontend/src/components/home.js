import React from 'react';
import { Box, Typography } from '@mui/material';
import avaImage from '../static/images/ava5.jpg';
import logoImage from '../static/images/logo.jpg'; // Import the logo image

const Home = () => {
    return (
        <Box
            sx={{
                height: '100vh',
                backgroundImage: `url(${avaImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'flex-start', // Align content to the left
                alignItems: 'center',
                color: '#fff',
                textAlign: 'left',
                position: 'relative', // To position the text elements
                paddingLeft: '50px'
            }}
        >
            {/* Logo and top-left text */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '100px', // Lower the text
                    left: '20px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <img 
                    src={logoImage} 
                    alt="Logo" 
                    style={{ width: '50px', height: '50px', marginRight: '10px' }} // Adjust the size of the logo
                />
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 'bold',
                        color: 'black'
                    }}
                >
                    Đại học Cần Thơ
                </Typography>
            </Box>

            {/* Name text on the right */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '100px', // Same height as the left text
                    right: '20px', // Position it on the right
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        fontWeight: 'bold',
                        color: 'black'
                    }}
                >
                    Võ Ngọc Anh Thư B2004756
                </Typography>
            </Box>

            {/* Main content */}
            <Box>
                <Typography
                    variant="h3"
                    component="h1"
                    color='black'
                    sx={{ fontFamily: "'Dancing Script', cursive", fontSize: '3rem', fontWeight: '300' }}
                >
                    Giúp bạn
                </Typography>
                <Typography
                    variant="h4"
                    component="h2"
                    color='black'
                    sx={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.5rem', fontWeight: '300' }}
                >
                    tóm tắt mọi vấn đề
                </Typography>
            </Box>
        </Box>
    );
};

export default Home;
