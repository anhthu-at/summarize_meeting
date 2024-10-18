import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_ENDPOINT_TRANSLATE_SUMMARY = 'http://localhost:8000/api/translate-summary-audioEN/';

const SummarizeAudioEN = () => {
    const [file, setFile] = useState(null);
    const [translatedText, setTranslatedText] = useState('');
    const [englishText, setEnglishText] = useState('');
    const [summary, setSummary] = useState('');
    const [translatedSummary, setTranslatedSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);

    const mssv = localStorage.getItem('mssv');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please upload a .mp3, or .wav file.");
            return;
        }

        // Validate file format
        const allowedFormats = ['mp3', 'wav'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedFormats.includes(fileExtension)) {
            setError('Invalid file format. Please upload a .mp3, or .wav file.');
            return;
        }

        const formData = new FormData();
        formData.append('audio_upload', file);
        formData.append('mssv', mssv);

        setLoading(true);

        try {
            const response = await axios.post(API_ENDPOINT_TRANSLATE_SUMMARY, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;
            setTranslatedText(data.translated_transcription || '');
            setEnglishText(data.original_transcription || '');
            setSummary(data.summary || '');
            setTranslatedSummary(data.translated_summary || '');

            setResults([{
                fileName: file.name,
                originalTranscription: data.original_transcription || '',
                translatedTranscription: data.translated_transcription || '',
                summary: data.summary || '',
                translatedSummary: data.translated_summary || '',
            }]);

            setError(''); // Reset error
        } catch (err) {
            setError(`An error occurred: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const navigateToSummarizeVN = () => {
        navigate('/summarize-AudioVN');
    };

    return (
        <div>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Translate and Summarize Audio (MP3) in English
            </Typography>
            <Typography variant="h6">Welcome, {mssv}</Typography>
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
                    accept=".mp3, .wav"
                    onChange={handleFileChange}
                    style={{ marginBottom: 20 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Translate & Summarize'}
                </Button>
            </form>

            {error && (
                <Typography color="error" variant="body1" sx={{ marginTop: 2 }}>
                    {error}
                </Typography>
            )}

            {results.length > 0 && (
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
                            {results.map((result, index) => (
                                <TableRow key={index}>
                                    <TableCell>{result.fileName}</TableCell>
                                    <TableCell>{result.originalTranscription}</TableCell>
                                    <TableCell>{result.translatedTranscription}</TableCell>
                                    <TableCell>{result.summary}</TableCell>
                                    <TableCell>{result.translatedSummary}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    </div>);
};

export default SummarizeAudioEN;
