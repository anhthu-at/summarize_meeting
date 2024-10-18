import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/home';
import Contact from './components/contact';
import Create from './components/create';
import Navbar from './components/navbar';
import List from './components/list';
import Edit from './components/edit';
import Delete from './components/delete';
import Translate from './components/translate';
import SummarizeText from './components/summarizeText';
import SummarizeDocument from './components/summarizeDocument';
import TranslateAudio from './components/translateAudio';
import TranslateDocument from './components/translateDocument';
import SummarizeDocumentPDFEN from './components/summarizeDocumentEN';
import SummarizeDocumentPDFVN from './components/summarizeDocumentVN';
import ListSum from './components/listsum';
import DeleteSum from './components/deleteSum';
import TranslateVideo from './components/translateVideo';
import SummarizeAudioVN from './components/summarizeAudioVN';
import SummarizeAudioEN from './components/summarizeAudioEN';
import SummarizeVideoEN from './components/summarizeVideoEN';
import SummarizeVideoVN from './components/summarizeVideoVN';
import SpeechToText from './components/speech_text';
import AddDepart from './components/add-depart';
import DeleteDepart from './components/delete-depart';
import EditDepart from './components/edit-depart';
import ListDepart from './components/list-depart';

function App() {
  const myWidth = 240;

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar drawerWidth={myWidth} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/create' element={<Create />} />
          <Route path='/list' element={<List />} />
          <Route path='/add-depart' element={<AddDepart />} />
          <Route path='/list-depart' element={<ListDepart />} />
          <Route path='/list-depart/delete/:num_depart' element={<DeleteDepart />} />
          <Route path='/list-depart/edit/:num_depart' element={<EditDepart />} />
          <Route path='/speech_to_text' element={<SpeechToText />} />
          <Route path='/list/edit/:meeting_name' element={<Edit />} />
          <Route path='/list/delete/:meeting_name' element={<Delete />} />
          <Route path='/transcribe' element={<Translate />} />
          <Route path='/translate-audio' element={<TranslateAudio />} />
          <Route path='/translate-document' element={<TranslateDocument />} />
          <Route path='/translate-video' element={<TranslateVideo />} />
          <Route path='/listsum' element={<ListSum />} />
          <Route path='/listsum/delete/:id' element={<DeleteSum />} />
          <Route path='/summarize-text' element={<SummarizeText />} />
          <Route path='/summarize-document' element={<SummarizeDocument />} />
          <Route path='/summarize-PDFVN' element={<SummarizeDocumentPDFVN />} />
          <Route path='/summarize-PDFEN' element={<SummarizeDocumentPDFEN />} />
          <Route path='/summarize-VideoEN' element={<SummarizeVideoEN />} />
          <Route path='/summarize-VideoVN' element={<SummarizeVideoVN />} />
          <Route path='/summarize-AudioEN' element={<SummarizeAudioEN />} />
          <Route path='/summarize-AudioVN' element={<SummarizeAudioVN />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
