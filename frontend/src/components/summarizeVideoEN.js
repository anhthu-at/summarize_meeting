import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// API endpoints (update as needed)
const API_ENDPOINT_TRANSLATE = 'http://localhost:8000/api/translate-summary-videoEN/';

const SummarizeVideoEN = () => {
    const [file, setFile] = useState(null);
    const [translatedText, setTranslatedText] = useState('');
    const [englishText, setEnglishText] = useState('');
    const [summary, setSummary] = useState('');
    const [translatedSummary, setTranslatedSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const mssv = localStorage.getItem('mssv');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        setError('');
        setTranslatedText('');
        setEnglishText('');
        setSummary('');
        setTranslatedSummary('');

        if (!file) {
            setError('Please upload a video file (.mp4).');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('video_file', file);
        formData.append('mssv', mssv);

        try {
            // Send the video file for transcription and translation
            const response = await axios.post(API_ENDPOINT_TRANSLATE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const { original_transcription, translated_transcription, summary, translated_summary } = response.data;
            setTranslatedText(translated_transcription);
            setEnglishText(original_transcription);
            setSummary(summary);
            setTranslatedSummary(translated_summary);

        } catch (err) {
            setError('An error occurred while processing the video file.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const navigateToSummarizeVN = () => {
        navigate('/summarize-VideoVN'); // Navigate to the summarize Vietnamese page
    };

    return (
        <div>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Translate and Summarize Video (MP4) (English)
            </Typography>
            <Typography variant="h6">
                Xin chào {mssv}
            </Typography>
            <Button
                type="button"
                variant="contained"
                color="secondary"
                onClick={navigateToSummarizeVN}
                sx={{ marginBottom: 2 }}
            >
                Summarize Vietnamese
            </Button>

            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept="video/mp4"
                    onChange={handleFileChange}
                    style={{ marginBottom: 20 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Translate'}
                </Button>
            </form>
            {error && (
                <Typography color="error" variant="body1" sx={{ marginTop: 2 }}>
                    {error}
                </Typography>
            )}
            {(englishText || translatedText || summary || translatedSummary) && (
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>File Name</strong></TableCell>
                                <TableCell><strong>English Transcription</strong></TableCell>
                                <TableCell><strong>Vietnamese Transcription</strong></TableCell>
                                <TableCell><strong>English Summary</strong></TableCell>
                                <TableCell><strong>Vietnamese Summary</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{file?.name}</TableCell>
                                <TableCell>{englishText}</TableCell>
                                <TableCell>{translatedText}</TableCell>
                                <TableCell>{summary}</TableCell>
                                <TableCell>{translatedSummary}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    </div>
    );
};

export default SummarizeVideoEN;
