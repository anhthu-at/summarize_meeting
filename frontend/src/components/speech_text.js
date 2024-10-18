import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Typography, CircularProgress }
    from '@mui/material';
import axios from 'axios';

const API_ENDPOINT = 'http://localhost:8000/api/speech-to-text/';

const SpeechToText = () => {
    const [mssv, setMssv] = useState(localStorage.getItem('mssv') || '');
    const [submitted, setSubmitted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [transcription, setTranscription] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const startRecording = async () => {
        setError('');
        setTranscription('');
        setSummary('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorder.start();
            setIsRecording(true);

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
                setIsRecording(false);
            };

            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 60000);
        } catch (err) {
            setError('Error accessing microphone: ' + err.message);
        }
    };

    const sendAudioToServer = async () => {
        if (!audioBlob) {
            setError('No audio recorded to send.');
            return;
        }

        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'recorded-audio.wav');
        formData.append('mssv', mssv);

        setLoading(true);

        try {
            const response = await axios.post(API_ENDPOINT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setTranscription(response.data.vietnamese_transcription);
            setSummary(response.data.summary);
        } catch (err) {
            setError(`Error occurred: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const styles = {

        box: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 2,
            backgroundColor: '#f0f0f0'
        },
    }
    return (
        <div>
            <Box sx={styles.box}>
                {!submitted ? (
                    <>
                        <Typography variant="h4" gutterBottom>
                            Nhập mã số sinh viên
                        </Typography>
                        <TextField
                            label="Nhập mã số sinh viên"
                            value={mssv}
                            onChange={handleMssvChange}
                            fullWidth
                            sx={{ marginBottom: 2, maxWidth: '400px' }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitMssv}
                            sx={{ padding: '10px 20px' }}
                        >
                            Xác nhận MSSV
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography variant="h4" gutterBottom>
                            Tóm tắt trực tiếp cho MSSV: {mssv}
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={isRecording ? () => setIsRecording(false) : startRecording}
                            disabled={loading}
                            sx={{ marginBottom: 2 }}
                        >
                            {isRecording ? 'Dừng' : 'Bắt đầu ghi âm'}
                        </Button>

                        {audioBlob && (
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={sendAudioToServer}
                                disabled={loading}
                                sx={{ marginBottom: 2, marginLeft: 2 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Tóm tắt'}
                            </Button>
                        )}

                        {error && (
                            <Typography color="error" variant="body1" sx={{ marginTop: 2 }}>
                                {error}
                            </Typography>
                        )}

                        {transcription && (
                            <Box sx={{ marginTop: 2, padding: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                                <Typography variant="body1">
                                    <strong>Phần ghi âm:</strong> {transcription}
                                </Typography>
                            </Box>
                        )}

                        {summary && (
                            <Box sx={{ marginTop: 2, padding: 2, border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                                <Typography variant="body1">
                                    <strong>Bản tóm tắt:</strong> {summary}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </div>
    );
};

export default SpeechToText;
