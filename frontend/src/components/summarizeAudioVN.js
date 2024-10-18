import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_ENDPOINT = 'http://localhost:8000/api/translate-summary-audioVN/';

const SummarizeAudioVN = () => {
    const [file, setFile] = useState(null);
    const [translatedText, setTranslatedText] = useState('');
    const [englishText, setEnglishText] = useState(''); // Thêm biến cho bản chuyển đổi tiếng Anh
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState('');

    const mssv = localStorage.getItem('mssv');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please upload an audio file (.mp3 or .wav).");
            return;
        }

        const formData = new FormData();
        formData.append('audio_file', file);
        formData.append('mssv', mssv);

        setLoading(true);

        try {
            const response = await axios.post(API_ENDPOINT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Cập nhật phản hồi từ backend
            setError(''); // Reset error
            setTranslatedText(response.data.vietnamese_transcription); // Vietnamese transcription
            setEnglishText(response.data.english_transcription); // English transcription
            setSummary(response.data.vietnamese_summary); // Vietnamese summary
        } catch (err) {
            setError(`An error occurred during transcription: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const NavigateToSummarizeEN = () => {
        navigate('/summarize-AudioEN'); // Navigate to the summarize English page
    };

    return (
        <div>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Chuyển đổi và tóm tắt Audio (MP3/WAV) Tiếng Việt
            </Typography>
            <h2>Xin chào {mssv}</h2>
            <Button
                type="button"
                variant="contained"
                color="secondary"
                onClick={NavigateToSummarizeEN}
                sx={{ marginBottom: 2 }}
            >
                Tóm tắt bằng Tiếng Anh
            </Button>

            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept=".mp3,.wav"
                    onChange={handleFileChange}
                    style={{ marginBottom: 20 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Chuyển đổi và tóm tắt'}
                </Button>
            </form>

            {error && (
                <Typography color="error" variant="body1" sx={{ marginTop: 2 }}>
                    {error}
                </Typography>
            )}

            {translatedText && (
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>File Name</strong></TableCell>
                                <TableCell><strong>Vietnamese Transcription</strong></TableCell>
                                <TableCell><strong>English Transcription</strong></TableCell> {/* Thêm cột cho bản chuyển đổi tiếng Anh */}
                                <TableCell><strong>Vietnamese Summary</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{file.name}</TableCell>
                                <TableCell>{translatedText}</TableCell>
                                <TableCell>{englishText}</TableCell> {/* Hiển thị bản chuyển đổi tiếng Anh */}
                                <TableCell>{summary}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
        </div>
        );
};

export default SummarizeAudioVN;
