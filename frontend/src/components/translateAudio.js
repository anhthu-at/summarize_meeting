import React, { useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_ENDTRANSLATE = 'http://localhost:8000/api/transcribe/';

const TranslateAudio = () => {
    const [audioFile, setAudioFile] = useState(null);
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("audio/")) {
            setAudioFile(file);
            setError(""); // Clear previous errors
        } else {
            setAudioFile(null);
            setError("Please select a valid audio file.");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('audio_upload', audioFile);

        setLoading(true);

        try {
            const response = await axios.post(API_ENDTRANSLATE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const newResult = {
                fileName: audioFile.name,
                originalTranscription: response.data.original_transcription,
                translatedTranscription: response.data.translated_transcription,
                status: 'Completed',
                originalDownloadLink: response.data.original_download_link,
                translatedDownloadLink: response.data.translated_download_link
            };
            setResults([...results, newResult]);
            setError(""); // Reset error
        } catch (err) {
            setError(`An error occurred during transcription: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (url) => {
        // Kiểm tra xem URL có hợp lệ không
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', ''); // Kích hoạt tải xuống với cùng tên tệp
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error("URL tải xuống không hợp lệ.");
        }
    };


    const navigateToPDF = () => {
        navigate('/translate-document');
    };
    const navigateToVideo = () => {
        navigate('/translate-video');
    };
    return (
        <div style={styles.frame}>
        <Box sx={styles.container}>
            <Typography variant="h4" sx={styles.title}>
                CHUYỂN ĐỔI AUDIO
            </Typography>
            <Button variant="contained" color="primary" onClick={navigateToPDF} style={{ margin: '10px 20px 20px 0px' }}>
                Translate PDF
            </Button>
            <Button variant="contained" color="secondary" onClick={navigateToVideo} style={{ margin: '10px 20px 20px 0px' }}>
                Translate Video
            </Button>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input type="file" accept="audio/*" onChange={handleFileChange} style={styles.fileInput} disabled={loading} />
                    <Button type="submit" variant="contained" color="primary" sx={styles.submitButton} disabled={loading || !audioFile}>
                        Upload and Transcribe
                    </Button>
                </form>
            )}


            {error && (
                <Typography variant="body1" color="error" sx={styles.error}>
                    {error}
                </Typography>
            )}
            <TableContainer component={Paper} sx={styles.tableContainer}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tên Audio File</strong></TableCell>
                            <TableCell><strong>Bản ghi tiếng Anh</strong></TableCell>
                            <TableCell><strong>Bản ghi tiếng Việt</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell><strong>Tải xuống bản ghi tiếng Anh</strong></TableCell>
                            <TableCell><strong>Tải xuống bản ghi tiếng Việt</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((result, index) => (
                            <TableRow key={index}>
                                <TableCell>{result.fileName}</TableCell>
                                <TableCell>{result.originalTranscription}</TableCell>
                                <TableCell>{result.translatedTranscription}</TableCell>
                                <TableCell>{result.status}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleDownload(result.originalDownloadLink)}
                                        sx={styles.downloadButton}
                                    >
                                        Download English
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleDownload(result.translatedDownloadLink)}
                                        sx={styles.downloadButton}
                                    >
                                        Download Vietnamese
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
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
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333',
    },
    navigateButton: {
        display: 'block',
        margin: '0 auto 20px auto',
        padding: '10px 20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px',
    },
    fileInput: {
        marginBottom: '20px',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
    },
    error: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    tableContainer: {
        marginTop: '20px',
    },
    downloadButton: {
        fontSize: '10px',
    },
};

export default TranslateAudio;
