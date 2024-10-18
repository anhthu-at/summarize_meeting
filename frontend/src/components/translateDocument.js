import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, CircularProgress
} from '@mui/material';

const API_ENDPOINT = 'http://localhost:8000/api/translate-document/';

const TranslateDocument = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setData(null);

        if (!file) {
            setError('Please upload a PDF file.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await axios.post(API_ENDPOINT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setData(response.data);
        } catch (err) {
            setError('An error occurred while translating the document.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = url.split('/').pop(); // Extract filename from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const navigateToAudio = () => {
        navigate('/translate-audio');
    };
    const navigateToSummary = () => {
        navigate('/summarize-document');
    };
    const navigateToVideo = () => {
        navigate('/translate-video');
    };
    

    return (
        <div style={styles.frame}>
        <Box sx={styles.container}>
            <Typography variant="h4" sx={styles.title}>
                CHUYỂN ĐỔI PDF
            </Typography>
            <Button variant="contained" color="primary" onClick={navigateToAudio}  style={{ margin: '10px 20px 20px 0px' }}>
                Transcribe Audio
            </Button>
            <Button variant="contained" color="secondary" onClick={navigateToVideo} style={{ margin: '10px 20px 20px 0px' }}>
                Translate Video
            </Button>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <Box sx={styles.fileInputContainer}>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            style={styles.fileInput}
                        />
                        <Button
                            type="submit"
                            sx={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Translating...' : 'Translate'}
                        </Button>
                    </Box>
                </form>


            {error && (
                <Typography variant="body1" color="error" sx={styles.error}>
                    {error}
                </Typography>
            )}


            {file && data && (
                <TableContainer component={Paper} sx={styles.tableContainer}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Tên PDF</strong></TableCell>
                                <TableCell><strong>Bản chuyển tiếng Anh</strong></TableCell>
                                <TableCell><strong>Bản chuyển tiếng Việt</strong></TableCell>
                                <TableCell><strong>Tải xuống bản tiếng Anh</strong></TableCell>
                                <TableCell><strong>Tải xuống bản tiếng Việt</strong></TableCell>
                                <TableCell><strong>Tóm tắt</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={styles.fileName}>{file.name}</TableCell>
                                <TableCell sx={styles.translatedText}>{data.english_transcription}</TableCell>
                                <TableCell sx={styles.translatedText}>{data.vietnamese_transcription}</TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => handleDownload(data.english_download_link)}
                                        sx={styles.downloadButton}
                                    >
                                        Download
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => handleDownload(data.vietnamese_download_link)}
                                        sx={styles.downloadButton}
                                    >
                                        Download
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        onClick={navigateToSummary}
                                        sx={styles.audioButton}
                                    >
                                        Tóm tắt
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    </div>
    );
};

const styles = {
    frame: {
        marginTop: '100px',  // Tạo khoảng cách từ trên cùng
    },
    container: {
        maxWidth: 'auto',
        margin: '0 auto',
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px',
    },
    audioButton: {
        display: 'block',
        margin: '0 auto 20px auto',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '4px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    fileInputContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    },
    fileInput: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    submitButton: {
        marginLeft: '10px',
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: '#fff',
        borderRadius: '4px',
    },
    error: {
        textAlign: 'center',
        marginTop: '20px',
    },
    tableContainer: {
        marginTop: '20px',
    },
    fileName: {
        textAlign: 'left',
        color: '#555',
    },
    translatedText: {
        textAlign: 'center',
        color: '#555',
    },
    downloadButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        borderRadius: '4px',
    },
    status: {
        textAlign: 'center',
        color: '#28a745',
    },
};

export default TranslateDocument;
