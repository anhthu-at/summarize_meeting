import React, { useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_ENDPOINT_SUMMARIZE = 'http://localhost:8000/api/translate-summary-videoVN/';

const SummarizeVideoVN = () => {
    const [file, setFile] = useState(null);
    const [translatedText, setTranslatedText] = useState('');
    const [englishText, setEnglishText] = useState('');
    const [summary, setSummary] = useState(''); // Đổi tên thành summary
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const mssv = localStorage.getItem('mssv');
    const navigate = useNavigate();

    // Xử lý thay đổi tệp video
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('video/')) {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Vui lòng tải lên tệp video hợp lệ (.mp4).');
        }
    };

    // Xử lý sự kiện gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTranslatedText('');
        setEnglishText('');
        setSummary('');

        if (!file) {
            setError('Vui lòng tải lên một tệp video (.mp4).');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('video_file', file); // Gửi video
        formData.append('mssv', mssv); // Gửi MSSV để nhận diện

        try {
            const response = await axios.post(API_ENDPOINT_SUMMARIZE, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const { vietnamese_transcription, english_transcription, vietnamese_summary } = response.data;
            setTranslatedText(vietnamese_transcription);
            setEnglishText(english_transcription);
            setSummary(vietnamese_summary); // Cập nhật giá trị cho summary
        } catch (err) {
            setError('Đã xảy ra lỗi trong quá trình xử lý tệp video.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Dịch và Tóm Tắt Video (MP4)
            </Typography>
            <h2>Xin chào {mssv}</h2>

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
                    {loading ? 'Đang xử lý...' : 'Dịch và Tóm Tắt'}
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
                                <TableCell><strong>Tên File</strong></TableCell>
                                <TableCell><strong>Bản Chuyển Đổi Tiếng Việt</strong></TableCell>
                                <TableCell><strong>Bản Chuyển Đổi Tiếng Anh</strong></TableCell>
                                <TableCell><strong>Tóm Tắt Tiếng Việt</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>{file.name}</TableCell>
                                <TableCell>{translatedText}</TableCell>
                                <TableCell>{englishText}</TableCell>
                                <TableCell>{summary}</TableCell> {/* Hiển thị summary */}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    </div>
    );
};

export default SummarizeVideoVN;
