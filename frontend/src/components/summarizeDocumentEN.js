import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_ENDPOINT = 'http://localhost:8000/api/translate-summaryEN/'; // Ensure this is correct

const SummarizeDocumentPDFEN = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null); // Store all results here
    const [method, setMethod] = useState('t5'); // Default method

    const mssv = localStorage.getItem('mssv');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResults(null);

        if (!file) {
            setError('Vui lòng tải lên một tệp PDF.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mssv', mssv);
        formData.append('method', method);

        try {
            // Send the PDF file for translation and summarization
            const response = await axios.post(API_ENDPOINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Assuming the response contains the expected data structure
            setResults(response.data);
        } catch (err) {
            setError('Đã xảy ra lỗi trong quá trình xử lý tài liệu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const navigateToSummarizeVN = () => {
        navigate('/summarize-PDFVN');
    };

    return (
        <div>
            <Box sx={{ padding: 3, backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}>
                    Dịch và Tóm tắt Tài liệu (Tiếng Anh)
                </Typography>
                <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2 }}>
                    Xin chào {mssv}
                </Typography>
                <Button
                    type="button"
                    variant="contained"
                    color="secondary"
                    onClick={navigateToSummarizeVN}
                    sx={{ fontSize: '12px', marginBottom: 2, display: 'block', marginLeft: 'auto', marginRight: '0', float: 'right' }}
                >
                    Tóm tắt tiếng Việt
                </Button>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        style={{ marginBottom: 20 }}
                    />

                    {/* Select Summarization Method */}
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel id="method-select-label">Phương pháp Tóm tắt</InputLabel>
                        <Select
                            labelId="method-select-label"
                            value={method}
                            label="Phương pháp Tóm tắt"
                            onChange={(e) => setMethod(e.target.value)}
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
                        sx={{ width: '50%', margin: 'auto' }}
                    >
                        {loading ? 'Đang xử lý...' : 'Dịch & Tóm tắt'}
                    </Button>
                </form>

                {error && (
                    <Typography color="error" variant="body1" sx={{ marginTop: 2, textAlign: 'center' }}>
                        {error}
                    </Typography>
                )}

                {results && (
                    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tên tệp</TableCell>
                                    <TableCell>Bản extract từ PDF (Tiếng Anh)</TableCell>
                                    <TableCell>Bản dịch tiếng Việt</TableCell>
                                    <TableCell>Bản tóm tắt tiếng Anh</TableCell>
                                    <TableCell>Bản tóm tắt tiếng Việt</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{results.file_name}</TableCell>
                                    <TableCell>{results.extracted_text}</TableCell>
                                    <TableCell>{results.vietnamese_translation}</TableCell>
                                    <TableCell>{results.english_summary}</TableCell>
                                    <TableCell>{results.vietnamese_summary}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </div>
    );
};

export default SummarizeDocumentPDFEN;
