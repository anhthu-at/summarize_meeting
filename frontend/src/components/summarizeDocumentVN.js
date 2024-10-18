import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, RadioGroup, FormControlLabel, Radio, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_ENDPOINT = 'http://localhost:8000/api/translate-summaryVN/';

const SummarizeDocumentPDFVN = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [summary, setSummary] = useState('');
    const [fileName, setFileName] = useState('');
    const [method, setMethod] = useState('t5'); // Default to 't5'
    const [methodLabel, setMethodLabel] = useState('T5'); // Label for the selected method

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0]?.name || '');
    };

    const mssv = localStorage.getItem('mssv');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setExtractedText('');
        setSummary('');

        if (!file) {
            setError('Please upload a PDF file.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mssv', mssv);
        formData.append('method', method); // Use selected method

        try {
            const response = await axios.post(API_ENDPOINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const { extracted_text, summary, method: responseMethod } = response.data;
            setExtractedText(extracted_text);
            setSummary(summary);
            setMethodLabel(responseMethod);  // Set methodLabel based on the response

        } catch (err) {
            if (err.response) {
                setError(`Server responded with status ${err.response.status}: ${err.response.data.error}`);
            } else if (err.request) {
                setError('No response received from the server.');
            } else {
                setError(`Error: ${err.message}`);
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const navigateToSummarizeEN = () => {
        navigate('/summarize-PDFEN');
    };

    const styles = {
        frame: {
            marginTop: '100px',  // Tạo khoảng cách từ trên cùng
        },
    }
    return (
        <div style={styles.frame}>
            <Box sx={{ padding: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Chuyển đổi và Tóm tắt văn bản tiếng Việt
                </Typography>
                <Typography variant="h6">Xin chào {mssv}</Typography>

                <Button
                    type="button"
                    variant="contained"
                    color="secondary"
                    onClick={navigateToSummarizeEN}
                    sx={{ marginBottom: 2 }}
                >
                    Tóm tắt văn bản tiếng Anh
                </Button>

                <form onSubmit={handleSubmit}>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        style={{ marginBottom: 20 }}
                    />

                    {/* Styled Select for choosing summarization method */}
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel id="method-select-label">Phương pháp tóm tắt</InputLabel>
                        <Select
                            labelId="method-select-label"
                            value={method}
                            label="Phương pháp tóm tắt"
                            onChange={(e) => {
                                setMethod(e.target.value);
                                setMethodLabel(
                                    e.target.value === 'spacy'
                                        ? 'Spacy'
                                        : e.target.value === 'tokenize'
                                        ? 'Tokenize'
                                        : e.target.value === 'sumy'
                                        ? 'Sumy'
                                        : e.target.value === 'bart'
                                        ? 'Bart'
                                        : 'T5'
                                );
                            }}
                        >
                            <MenuItem value="t5">Tóm tắt tài liệu, báo chí (T5)</MenuItem>
                            <MenuItem value="sumy">Tóm tắt văn bản, chứng từ (Sumy)</MenuItem>
                            <MenuItem value="tokenize">Tóm tắt văn bản (Tokenize)</MenuItem>
                            <MenuItem value="spacy">Tóm tắt văn bản (Spacy)</MenuItem>
                            <MenuItem value="bart">Tóm tắt văn bản (Bart)</MenuItem>
                        </Select>
                    </FormControl>

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

                {extractedText && summary && (
                    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Tên File</strong></TableCell>
                                    <TableCell><strong>Bản chuyển đổi</strong></TableCell>
                                    <TableCell><strong>Tóm tắt ({methodLabel})</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{fileName}</TableCell>
                                    <TableCell>{extractedText}</TableCell>
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

export default SummarizeDocumentPDFVN;
