import React, { useState } from 'react';
import axios from 'axios';

// Đảm bảo URL API chính xác, tùy thuộc vào cấu hình của bạn
const API_ENDTRANSLATE = 'http://localhost:8000/api/summarize-text/';

const SummarizeText = () => {
    const [input_text, setInputText] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Đảm bảo rằng tên trường đúng theo mong đợi của server
            const response = await axios.post(API_ENDTRANSLATE, { input_text: input_text }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Response:', response); // Xem kết quả phản hồi từ server
            setSummary(response.data.summary);
        } catch (err) {
            console.error('Error summarizing text:', err);
            setError('An error occurred while summarizing the text.');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        frame: {
            marginTop: '150px',  // Tạo khoảng cách từ trên cùng
        },
    }
    return (
        <div style={styles.frame}>
            <h2>Tóm tắt văn bản ngắn</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={input_text}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Điền văn bản được vào"
                    rows="10"
                    cols="50"
                />
                <br />
                <button type="submit" disabled={loading}>Tóm tắt</button>
            </form>

            {loading && <p>Loading...</p>}

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {summary && (
                <div>
                    <h2>Tóm tắt văn bản</h2>
                    <p><strong>Văn bản được đưa vào:</strong></p>
                    <div>{input_text}</div>
                    <p><strong>Kết quả văn bản:</strong></p>
                    <div>{summary}</div>
                    <a href="/">Trở về</a>
                </div>
            )} 
        </div>
    );
};

export default SummarizeText;
