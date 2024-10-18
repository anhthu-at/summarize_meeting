import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Translate = () => {
    const [mssv, setMssv] = useState(localStorage.getItem('mssv') || '');
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (mssv) {
            localStorage.setItem('mssv', mssv);
        }
    }, [mssv]);

    const handleMssvChange = (e) => {
        setMssv(e.target.value);
    };

    const handleSubmitMssv = () => {
        if (mssv) {
            setSubmitted(true);
        }
    };

    const navigateToPDFVN = () => {
        navigate('/summarize-PDFVN');
    };
    const navigateToPDFEN = () => {
        navigate('/summarize-PDFEN');
    };
    const navigateToAudioEN = () => {
        navigate('/summarize-AudioEN');
    };
    const navigateToAudioVN = () => {
        navigate('/summarize-AudioVN');
    };
    const navigateToVideoEN = () => {
        navigate('/summarize-VideoEN');
    };
    const navigateToVideoVN = () => {
        navigate('/summarize-VideoVN');
    };

    const styles = {

        box: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 2,
        },
        section: {
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#fff',
            padding: '20px',
            margin: '20px 0',
            borderRadius: '10px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            border: '2px solid #d1d1d1' // Lighter border color
        },
        buttonGroup: {
            display: 'flex',
            justifyContent: 'space-between', // Ensure the buttons have space between them
            flexDirection: 'row' // Set the buttons in a row (horizontal layout)
        },
        button: {
            margin: '10px',
            padding: '10px 20px'
        },
        heading: {
            marginBottom: '2rem'
        },
        subHeading: {
            marginTop: '3rem'
        },
        textField: {
            marginBottom: 2,
            maxWidth: '400px'
        },
        label: {
            position: 'absolute',
            top: '-10px',
            left: '20px',
            backgroundColor: '#fff',
            padding: '0 5px',
            fontSize: '12px',
            color: '#888'
        }
    };

    return (
        <div>
            <Box sx={styles.box}>
                {!submitted ? (
                    <>
                        <Typography variant="h4" gutterBottom sx={styles.heading}>
                            Nhập mã số sinh viên
                        </Typography>
                        <TextField
                            label="Nhập mã số sinh viên"
                            value={mssv}
                            onChange={handleMssvChange}
                            fullWidth
                            sx={styles.textField}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitMssv}
                            sx={styles.button}
                        >
                            Xác nhận MSSV
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography variant="h4" gutterBottom>
                            XIN CHÀO {mssv}
                        </Typography>

                        <Typography variant="h5" gutterBottom sx={styles.subHeading}>
                            Lựa chọn chuyển đổi
                        </Typography>

                        {/* Chuyển đổi PDF */}
                        <Box sx={styles.section} position="relative">

                            <Typography variant="caption" sx={styles.label}>
                                PDF
                            </Typography>
                            <Box sx={styles.buttonGroup}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={navigateToPDFEN}
                                    sx={styles.button}
                                >
                                    Chuyển đổi Tiếng Anh
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={navigateToPDFVN}
                                    sx={styles.button}
                                >
                                    Chuyển đổi Tiếng Việt
                                </Button>
                            </Box>
                        </Box>

                        {/* Chuyển đổi Audio */}
                        <Box sx={styles.section} position="relative">

                            <Typography variant="caption" sx={styles.label}>
                                Audio
                            </Typography>
                            <Box sx={styles.buttonGroup}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={navigateToAudioEN}
                                    sx={styles.button}
                                >
                                    Chuyển đổi Tiếng Anh
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={navigateToAudioVN}
                                    sx={styles.button}
                                >
                                    Chuyển đổi Tiếng Việt
                                </Button>
                            </Box>
                        </Box>

                        {/* Chuyển đổi Video */}
                        <Box sx={styles.section} position="relative">

                            <Typography variant="caption" sx={styles.label}>
                                Video
                            </Typography>
                            <Box sx={styles.buttonGroup}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={navigateToVideoEN}
                                    sx={styles.button}
                                >
                                    Chuyển đổi Tiếng Anh
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={navigateToVideoVN}
                                    sx={styles.button}
                                >
                                    Chuyển đổi Tiếng Việt
                                </Button>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </div>
    );
};

export default Translate;
