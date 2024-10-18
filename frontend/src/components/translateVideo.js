import React, { useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_ENDTRANSLATE = 'http://localhost:8000/api/translate-video/';

const TranslateVideo = () => {
    const [videoFile, setVideoFile] = useState(null);
    const [error, setError] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            setError("");
        } else {
            setError("Vui lòng chọn tệp video hợp lệ!");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!videoFile) {
            setError("Vui lòng chọn file video trước khi tải lên!");
            return;
        }

        setError("");
        const formData = new FormData();
        formData.append('video_file', videoFile);

        setLoading(true);

        try {
            const response = await axios.post(API_ENDTRANSLATE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update the results with both the file paths and transcription content
            setResults(prevResults => [...prevResults, {
                fileName: response.data.file_name,
                originalTranscriptionPath: response.data.original_transcription_path,
                translatedTranscriptionPath: response.data.translated_transcription_path,
                originalTranscriptionContent: response.data.original_transcription,  // Add the transcription content
                translatedTranscriptionContent: response.data.translated_transcription,  // Add the translated content
                status: 'Completed'
            }]);

        } catch (error) {
            setError("Đã xảy ra lỗi khi tải video lên: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (url) => {
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', ''); // This will trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.error("Invalid download URL.");
        }
    };

    const navigateToAudio = () => {
        navigate('/translate-audio');
    };

    const navigateToPDF = () => {
        navigate('/translate-document');
    };

    return (
        <div style={styles.frame}>
        <Box sx={styles.container}>
            <Typography variant="h4" sx={styles.title}>
                TRANSLATE VIDEO TO TEXT
            </Typography>

            <Button variant="contained" color="primary" onClick={navigateToAudio} style={{ margin: '10px 20px 20px 0px' }}>
                Transcribe Audio
            </Button>
            <Button variant="contained" color="secondary" onClick={navigateToPDF} style={{ margin: '10px 20px 20px 0px' }}>
                Translate PDF
            </Button>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <input type="file" accept="video/mp4" onChange={handleFileChange} style={styles.fileInput} />
                    <Button type="submit" variant="contained" color="primary" sx={styles.submitButton}>
                        Upload and Transcribe
                    </Button>
                </form>
            )}

            {error && (
                <Typography variant="body1" color="error" sx={styles.error}>
                    {error}
                </Typography>
            )}

            {results.length > 0 && (
                <TableContainer component={Paper} sx={styles.tableContainer}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Tên Video File</strong></TableCell>
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
                                    <TableCell>{result.originalTranscriptionContent}</TableCell>
                                    <TableCell>{result.translatedTranscriptionContent}</TableCell>
                                    <TableCell>{result.status}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleDownload(result.originalTranscriptionPath)}
                                            sx={styles.downloadButton}
                                        >
                                            Download English
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleDownload(result.translatedTranscriptionPath)}
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
        margin: '10px auto',
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
        padding: '10px',
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

export default TranslateVideo;
