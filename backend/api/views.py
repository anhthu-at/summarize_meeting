from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse
from rest_framework import viewsets, permissions
from .models import *
from .serializers import *
from .forms import *
from rest_framework.response import Response
import os
from django.conf import settings
# translate speech-to-text
import whisper
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
# chuyển audio tiếng việt thành text
from moviepy.editor import VideoFileClip
import tempfile
from pydub import AudioSegment, effects
import shutil
# Speech to text
import speech_recognition as sr
import sounddevice as sd
import scipy.io.wavfile as wavfile
import numpy as np
# summary
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from txtai.pipeline import Summary
from PyPDF2 import PdfReader
from django.utils.translation import gettext as _
# xử lý ngôn ngữ
import torch
# xử lý ngôn ngữ và tóm tắt
from transformers import pipeline
from transformers import T5ForConditionalGeneration, T5Tokenizer, BartForConditionalGeneration, BartTokenizer
# from txtai.pipeline import Translation as Translator
from django.core.files.storage import default_storage
# chuyển đổi video
import moviepy.editor as mp
# thông báo lỗi
import logging
# home
from django.utils.timezone import now

# Summarize VN
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from collections import defaultdict 

from collections import Counter
import spacy

from django.utils.dateparse import parse_date
from .models import meeting as Meeting
from django.contrib.auth import authenticate, login, logout
from googletrans import Translator

import datetime
from rest_framework.decorators import action

# Create your views here.

def get_home(request):
    return HttpResponse("This is the home page")



# BACKEND Bộ phận
class get_Department(viewsets.ViewSet):
    permissions_classes = [permissions.AllowAny]
    queryset = department.objects.all()
    serializer_class = DepartmentSerializer
    
    def list(self, request):
        queryset = self.queryset
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors,status=400)

    def retrieve(self, request, pk=None):
        link = self.queryset.get(pk=pk)
        serializer = self.serializer_class(link)
        return Response(serializer.data)

    def update(self, request, pk=None):
        link = self.queryset.get(pk=pk)
        serializer = self.serializer_class(link, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors,status=400)

    def destroy(self, request, pk=None):
        link = self.queryset.get(pk=pk)
        link.delete()
        return Response(status=204)

# BACKEND meeting link
class get_LinksViewSet(viewsets.ViewSet):
    permissions_classes = [permissions.AllowAny]
    queryset = meeting.objects.all()
    serializer_class = MeetingSerializer

    def list(self, request):
        queryset = self.queryset
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # def create(self, request):
    #     serializer = self.serializer_class(data = request.data)
    #     if serializer.is_valid():
    #         serializer.save()
    #         return Response(serializer.data, status=201)
    #     else:
    #         return Response(serializer.errors,status=400)
    
    def create(self, request):
        meeting_name = request.data.get('meeting_name')

        # Check if a meeting with the same name already exists
        if meeting.objects.filter(meeting_name=meeting_name).exists():
            return Response({'error': 'Meeting name already exists.'}, status=400)

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)
        
    def retrieve(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
            serializer = self.serializer_class(instance)
            return Response(serializer.data)
        except meeting.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

    def update(self, request, pk=None):
        link = self.queryset.get(pk=pk)
        serializer = self.serializer_class(link, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors,status=400)

    def destroy(self, request, pk=None):
        link = self.queryset.get(pk=pk)
        link.delete()
        return Response(status=204)
    
# BACKEND CHO HOME
class Get_home_meeting(APIView):
    def get(self, request, *args, **kwargs):
        date_str = request.GET.get('date', None)
        print(f'Received date: {date_str}')
        if date_str:
            date = parse_date(date_str)
            print(f'Parsed date: {date}')
            if date:
                meetings = Meeting.objects.filter(start_date=date)
            else:
                meetings = Meeting.objects.none()
        else:
            today = now().date()  # Get today's date
            meetings = Meeting.objects.filter(start_date=today)
            
        data = list(meetings.values())
        return JsonResponse(data, safe=False)

# BACKEND bản tóm tắt
class get_Sum(viewsets.ViewSet):
    permissions_classes = [permissions.AllowAny]
    queryset = summarize.objects.all()
    serializer_class = SumSerializer

    def list(self, request):
        queryset = self.queryset
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
            serializer = self.serializer_class(instance)
            return Response(serializer.data)
        except meeting.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

    def destroy(self, request, pk=None):
        link = self.queryset.get(pk=pk)
        link.delete()
        return Response(status=204)

# BACKEND người dùng
class get_User(viewsets.ViewSet):
    permissions_classes = [permissions.AllowAny]
    queryset = users.objects.all()
    serializer_class = StaffSerializer

    def create(self, request):
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors,status=400)
        
    def list(self, request):
        queryset = self.queryset
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
            serializer = self.serializer_class(instance)
            return Response(serializer.data)
        except meeting.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

    def update(self, request, pk=None):
        link = self.queryset.get(pk=pk)
        serializer = self.serializer_class(link, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors,status=400)
    def destroy(self, request, pk=None):
        link = self.queryset.get(pk=pk)
        link.delete()
        return Response(status=204)
    
    @action(detail=False, methods=['get'])
    def select_role(self, request):
        queryset = users.objects.select_related('num_depart')
        departs = []
        for depart in queryset:
            departs.append({'mssv': depart.mssv,'role': depart.num_depart.role})
        return Response(departs)


# Hàm Chuyển đổi file audio thành text và tiến hành xử lý

# Có thể dùng chung qua cho summary lại được
class AudioTranscriber:
    def __init__(self, audio_file):
        self.audio_file = audio_file
        self.audio_path = os.path.join(settings.MEDIA_ROOT, 'audio_uploads', 'audio_upload.mp3')
        self.transcription_result = ""
        self.translated_result = ""

    def transcribe_audio(self):
        print(f"\nAudio path: {self.audio_path}\n")
        try:
            if not os.path.exists(self.audio_path):
                print(f"Error: Audio file does not exist at path {self.audio_path}")
                return

            # Load Whisper model
            model = whisper.load_model("base")
            print("Model loaded successfully.")

            # Perform transcription
            result = model.transcribe(self.audio_path)
            # print("Transcription result: ", result)
            
            if result and 'text' in result:
                self.transcription_result = result['text']
                # print(f"Transcription result: {self.transcription_result}")
            else:
                print("Error: Transcription result is empty.")
        
        except Exception as e:
            print(f"Error during transcription: {e}")

    def save_audio(self):
        # Ensure the directory for audio exists
        self.ensure_directory_exists()
        try:
            with open(self.audio_path, 'wb') as f:
                for chunk in self.audio_file.chunks():
                    f.write(chunk)
            print(f"File saved successfully at: {self.audio_path}")
        except Exception as e:
            raise RuntimeError(f"Error saving audio file: {e}")

    def ensure_directory_exists(self):
        directory = os.path.dirname(self.audio_path)
        if not os.path.exists(directory):
            os.makedirs(directory)

    def convert_path(self):
        # Convert Windows-style paths to Unix-style for compatibility
        self.audio_path = self.audio_path.replace('\\', '/')

    def translate_text(self):
        if not self.transcription_result:
            print("No transcription result available to translate.")
            return
        
        translator = Translator()
        print("Translating text...")
        try:
            translation = translator.translate(self.transcription_result, src='en', dest='vi')
            self.translated_result = translation.text
            # print(f"Translation result: {self.translated_result}")
        except Exception as e:
            print(f"Error during translation: {e}")

    def save_transcriptions(self):
        result_dir = os.path.join(settings.MEDIA_ROOT, 'audio_uploads')
        self.ensure_directory_exists()
        print("Saving transcriptions...")
        original_file_path = os.path.join(result_dir, 'original_transcription.txt')
        translated_file_path = os.path.join(result_dir, 'translated_transcription.txt')
        
        try:
            # Save original transcription
            with open(original_file_path, 'w', encoding='utf-8') as original_file:
                original_file.write(self.transcription_result)
            print(f"Original transcription saved at: {original_file_path}")
            
            # Save translated transcription
            with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
                translated_file.write(self.translated_result)
            print(f"Translated transcription saved at: {translated_file_path}")
        except Exception as e:
            raise RuntimeError(f"Error saving transcription files: {e}")
        
        return original_file_path, translated_file_path


# Gọi các hàm được viết ở trên để xử lý 
class AudioTranscriptionAPI(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        audio_file = request.FILES.get('audio_upload')

        if not audio_file:
            return Response({'error': 'No file uploaded'}, status=400)
        
        print("Received file:", audio_file.name)

        # Create an instance of the AudioTranscriber class
        transcriber = AudioTranscriber(audio_file)

        try:
            # Save the audio file and adjust the path
            transcriber.save_audio()
            transcriber.convert_path()
            
            # Perform transcription and translation
            transcriber.transcribe_audio()
            transcriber.translate_text()
            
            # Save the transcription results
            original_file_path, translated_file_path = transcriber.save_transcriptions()

            # Generate URLs to download the transcriptions
            original_file_url = os.path.join(settings.MEDIA_URL, 'audio_uploads', 'original_transcription.txt')
            translated_file_url = os.path.join(settings.MEDIA_URL, 'audio_uploads', 'translated_transcription.txt')
            
            response_data = {
                'original_transcription': transcriber.transcription_result,
                'translated_transcription': transcriber.translated_result,
                'original_download_link': original_file_url,
                'translated_download_link': translated_file_url
            }
            return JsonResponse(response_data)
        
        except Exception as e:
            print(f"Error during transcription: {e}")  # Debugging line
            return Response({'error': str(e)}, status=500)


# Gọi lại hàm và tái sử dụng cho việc summarize của tiếng anh
class SummarizerAudioEN(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.translator = Translator()  # Initialize translator if using a library like googletrans or similar

    def text_summary(self, text, maxlength=None):
        # Summarize the text using a pre-trained model
        summary = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", revision="a4f8f3e")
        result = summary(text)
        return result[0]['summary_text']  # Extract the summary text

    def translate_text(self, text, src_lang='en', dest_lang='vi'):
        try:
            translation = self.translator.translate(text, src=src_lang, dest=dest_lang)
            return translation.text
        except Exception as e:
            raise RuntimeError(f"Error while translating text: {e}")

    def post(self, request, *args, **kwargs):
        # Get the translated text from the request data
        translated_text = request.data.get('original_transcription')
        
        if not translated_text:
            return Response({'error': 'Original transcription text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Perform text summarization
            summary = self.text_summary(translated_text)
            translated_summary = self.translate_text(summary, src_lang='en', dest_lang='vi')
            
            return Response({
                'translated_text': translated_text,
                'summary': summary,
                'translated_summary': translated_summary},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Gọi hàm audio AudioTranscriber và hàm SummarizerAudioEN 
# dịch tiếng anh ở trên và tiến hành tái sử dụng
class SummaryAudioTranscriptionEN(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, *args, **kwargs):
        mssv = request.data.get('mssv')
        audio_file = request.FILES.get('audio_upload')

        if not audio_file:
            return Response({'error': 'No file uploaded'}, status=400)

        print("Received file:", audio_file.name)
        print("Received MSSV:", mssv)  # Debugging purposes

        # Create an instance of the AudioTranscriber class
        transcriber = AudioTranscriber(audio_file)
        summarizeAudio = SummarizerAudioEN()
        
        try:
            # Save the audio file and adjust the path
            transcriber.save_audio()
            transcriber.convert_path()

            # Perform transcription and translation
            transcriber.transcribe_audio()
            transcriber.translate_text()

            # Perform summarization on the original transcription
            summarized_response = summarizeAudio.text_summary(transcriber.transcription_result)
            
            # Save the transcription and summary results
            original_file_path, translated_file_path = transcriber.save_transcriptions()

            original_file_url = os.path.join(settings.MEDIA_URL, 'audio_uploads', 'original_transcription.txt')
            translated_file_url = os.path.join(settings.MEDIA_URL, 'audio_uploads', 'translated_transcription.txt')

            try:
                user_instance = users.objects.get(mssv=mssv)
                document_summary = summarize.objects.create(
                    sum_content=summarized_response,
                    sum_link=audio_file, 
                    mssv=user_instance,
                    num_depart=user_instance.num_depart
                )
            except users.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
                
            response_data = {
                'original_transcription': transcriber.transcription_result,
                'translated_transcription': transcriber.translated_result,
                'summary': summarized_response,
                'translated_summary': summarizeAudio.translate_text(summarized_response, src_lang='en', dest_lang='vi'),
                'original_download_link': original_file_url,
                'translated_download_link': translated_file_url
            }
            return JsonResponse(response_data)

        except Exception as e:
            print(f"Error during transcription: {e}")
            return Response({'error': str(e)}, status=500)
        
    
     
def download_file(request, filename):
    # Tạo đường dẫn đầy đủ đến file tóm tắt
    file_path = os.path.join(settings.MEDIA_ROOT, 'summarized_texts', filename)
    
    if not os.path.exists(file_path):
        return HttpResponseNotFound("Không tìm thấy file")
    
    # Mở file và phục vụ nó như một file văn bản tải về
    with open(file_path, 'rb') as file:
        response = HttpResponse(file.read(), content_type='text/plain')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


# xử lý tóm tắt văn bản bằng đoạn text  
class SummarizerText(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = T5ForConditionalGeneration.from_pretrained("NlpHUST/t5-small-vi-summarization").to(self.device)
        self.tokenizer = T5Tokenizer.from_pretrained("NlpHUST/t5-small-vi-summarization")

    def text_summary(self, text, max_length=256):
        tokenized_text = self.tokenizer.encode(text, return_tensors="pt").to(self.device)
        self.model.eval()
        summary_ids = self.model.generate(
            tokenized_text,
            max_length=max_length, 
            num_beams=5,
            repetition_penalty=2.5, 
            length_penalty=1.0, 
            early_stopping=True
        )
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

    def post(self, request, *args, **kwargs):
        input_text = request.data.get('input_text', '')
        if not input_text:
            return Response({'error': 'No input text provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        summary = self.text_summary(input_text)
        return Response({'input_text': input_text, 'summary': summary}, status=status.HTTP_200_OK)

# chuyển đổi tài liệu từ file pdf
class DocumentTranscriber:
    def __init__(self):
        self.translator = Translator()
        self.media_dir = os.path.join(settings.MEDIA_ROOT, 'documents')
        os.makedirs(self.media_dir, exist_ok=True)
        
    def extract_text_from_pdf(self, pdf_path):
        try:
            reader = PdfReader(pdf_path)
            text = "".join(page.extract_text() or "" for page in reader.pages)
            return text
        except Exception as e:
            raise RuntimeError(f"Error while extracting text: {e}")

    def translate_text(self, text, src_lang='en', dest_lang='vi'):
        try:
            translation = self.translator.translate(text, src=src_lang, dest=dest_lang)
            return translation.text
        except Exception as e:
            raise RuntimeError(f"Error while translating text: {e}")

    def save_text(self, text, filename):
        try:
            file_path = os.path.join(self.media_dir, filename)
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(text)
            return file_path
        except Exception as e:
            raise RuntimeError(f"Error saving text file: {e}")

# TỪ ĐÂY
# Gọi xử lý tài liệu các hàm ở trên để tiến hành dịch tài liệu từ anh sang việt
class TranslateDocument(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        print("file doc: ",file)
        
        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        transcriber = DocumentTranscriber()
        file_path = os.path.join(transcriber.media_dir, file.name)

        try:
            # Save the uploaded PDF file to the server
            with open(file_path, 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # Extract text from the saved PDF file
            extracted_text = transcriber.extract_text_from_pdf(file_path)

            # Translate the extracted text to Vietnamese
            translated_text = transcriber.translate_text(extracted_text)

            # Save both the original and translated text
            original_file_path = transcriber.save_text(extracted_text, 'original_text.txt')
            translated_file_path = transcriber.save_text(translated_text, 'translated_text.txt')

            request.session['translated_file_path'] = translated_file_path

            # Construct URLs for the files
            original_file_url = os.path.join(settings.MEDIA_URL, 'documents', 'original_text.txt')
            translated_file_url = os.path.join(settings.MEDIA_URL, 'documents', 'translated_text.txt')

            file_name = file.name
            
            # Return the extracted text, translated text, and download links
            response_data = {
                'file_name': file.name,
                'english_transcription': extracted_text,
                'vietnamese_transcription': translated_text,
                'english_download_link': original_file_url,
                'vietnamese_download_link': translated_file_url,
            }
            return JsonResponse(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Server error: {e}")
            return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Tóm tắt tài liệu pdf từ 
class SummarizerDocument(APIView):
    def text_summary(self, text, maxlength=None):
        # Summarize the text using a pre-trained model
        summary = Summary("sshleifer/distilbart-cnn-12-6", revision="a4f8f3e")
        result = summary(text)
        return result

    def post(self, request, *args, **kwargs):
        # Get the translated text from the request data
        translated_text = request.data.get('translated_text')
        file = request.data.get('file_name')
        print("file document: ", file)
        if not translated_text:
            return Response({'error': 'Translated text is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Perform text summarization
            summary = self.text_summary(translated_text)
            
            return Response({'translated_text': translated_text, 'summary': summary}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Tóm tắt tài liệu ENG  
class TranslateSummary(APIView):
    def __init__(self):
        self.translator = Translator()  # Initialize the translator here

    def translate_text(self, text, src_lang='en', dest_lang='vi'):
        try:
            translation = self.translator.translate(text, src=src_lang, dest=dest_lang)
            return translation.text
        except Exception as e:
            raise RuntimeError(f"Error while translating text: {e}")

    def post(self, request, *args, **kwargs):
        text = request.data.get('text')
        mssv = request.data.get('mssv')
        file = request.data.get('file_name')
        print("file:  ", file)
        if not text:
            return Response({'error': 'Text is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            translated_text = self.translate_text(text, src_lang='en', dest_lang='vi')
            try:
                user_instance = users.objects.get(mssv=mssv)
                document_summary = summarize.objects.create(
                    sum_content=translated_text,
                    sum_link=file, 
                    mssv=user_instance,
                    num_depart=user_instance.num_depart
                )
            except users.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = SumSerializer(document_summary)

            return Response({'translated_text': translated_text}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error: {str(e)}")
            return Response({'error': 'Internal Server Error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SummarizeDocumentEN(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = T5ForConditionalGeneration.from_pretrained("t5-small").to(self.device)
        self.tokenizer = T5Tokenizer.from_pretrained("t5-small")
        
        self.bart_model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')
        self.bart_tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
        # Initialize Sumy summarizer
        self.sumy_summarizer = LsaSummarizer()
        
        self.stop_words = set(stopwords.words('english'))
        self.nlp = spacy.load('en_core_web_sm')
        
    def save_uploaded_file(self, file):
        """Save the uploaded file to the server and return the file path."""
        transcriber = DocumentTranscriber()
        file_path = os.path.join(transcriber.media_dir, file.name)
        try:
            with open(file_path, 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)
            return file_path
        except Exception as e:
            raise Exception(f"Error saving file: {e}")

    def extract_and_translate_text(self, file_path):
        """Extract text from the file and translate it."""
        transcriber = DocumentTranscriber()
        extracted_text = transcriber.extract_text_from_pdf(file_path)
        translated_text = transcriber.translate_text(extracted_text)
        return extracted_text, translated_text

    def save_text_to_file(self, text, filename):
        """Save text to a file and return the file URL."""
        file_path = os.path.join(settings.MEDIA_ROOT, 'documents', filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(text)
        return os.path.join(settings.MEDIA_URL, 'documents', filename)


    def text_summary_t5(self, text, max_length=256):
        """Tóm tắt văn bản bằng mô hình T5."""
        tokenized_text = self.tokenizer.encode(text, return_tensors="pt").to(self.device)
        self.model.eval()
        summary_ids = self.model.generate(
            tokenized_text,
            max_length=max_length,
            num_beams=5,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True
        )
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

    def text_summary_sumy(self, text, num_sentences=3):
        """Tóm tắt văn bản bằng phương pháp Sumy (LsaSummarizer)."""
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, num_sentences)

        summary_text = ' '.join(str(sentence) for sentence in summary)
        return summary_text
    
    def summarize_tokenize(self, text, num_sentences=2):
        """Tóm tắt văn bản bằng cách sử dụng tokenization của NLTK."""
        # Tokenize văn bản thành câu
        sentences = sent_tokenize(text)

        # Tokenize văn bản thành từ và loại bỏ stop words
        word_frequencies = defaultdict(int)
        for word in word_tokenize(text.lower()):
            if word.isalnum() and word not in self.stop_words:
                word_frequencies[word] += 1

        # Tính toán tần suất tối đa
        max_frequency = max(word_frequencies.values())

        # Tính toán tần suất từ chuẩn hóa
        for word in word_frequencies:
            word_frequencies[word] = (word_frequencies[word] / max_frequency)

        # Tính điểm cho mỗi câu
        sentence_scores = defaultdict(int)
        for sentence in sentences:
            for word in word_tokenize(sentence.lower()):
                if word in word_frequencies:
                    sentence_scores[sentence] += word_frequencies[word]

        # Chọn số lượng câu để tạo bản tóm tắt
        summary_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]

        # Tạo bản tóm tắt
        summary = ' '.join(summary_sentences)
        return summary
    
    def summarize_spacy(self,text, num_sentences=3):
        doc = self.nlp(text)
        word_freq = Counter(token.text.lower() for token in doc if token.is_alpha and not token.is_stop)
        sentence_scores = {}

        for sent in doc.sents:
            for word in sent:
                if word.text.lower() in word_freq:
                    sentence_scores[sent] = sentence_scores.get(sent, 0) + word_freq[word.text.lower()]

        ranked_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)
        summary_sentences = ranked_sentences[:num_sentences]
        return ' '.join([sent.text for sent in sorted(summary_sentences, key=lambda x: x.start)])

    def summarize_bart(self, text):
        input_ids = self.bart_tokenizer.encode("summarize: " + text, return_tensors="pt", max_length=1024, truncation=True)
        summary_ids = self.bart_model.generate(input_ids, max_length=150, min_length=40, length_penalty=2.0, num_beams=6, early_stopping=True)
        summary = self.bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    
    def summarize_text(self, method, text):
        """Tóm tắt văn bản dựa trên phương pháp đã cung cấp."""
        # Thêm các phương pháp tóm tắt ở đây (t5, sumy, v.v.)
        if method == 't5':
            return self.text_summary_t5(text)  # Giả sử bạn đã định nghĩa phương thức này
        elif method == 'sumy':
            return self.text_summary_sumy(text)  # Giả sử bạn đã định nghĩa phương thức này
        elif method == 'tokenize':
            return self.summarize_tokenize(text)  # Giả sử bạn đã định nghĩa phương thức này
        elif method == 'spacy':
            return self.summarize_spacy(text)  # Giả sử bạn đã định nghĩa phương thức này
        elif method == 'bart':
            return self.summarize_bart(text)  # Giả sử bạn đã định nghĩa phương thức này
        else:
            raise ValueError("Phương pháp tóm tắt không hợp lệ")

    def post(self, request, *args, **kwargs):
        file = request.data.get('file')
        mssv = request.data.get('mssv')
        method = request.data.get('method', 't5')  # Default is 't5'

        if not file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        if not mssv:
            return Response({'error': 'MSSV is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Step 1: Save and extract text from the file
            file_path = self.save_uploaded_file(file)
            extracted_text, translated_text = self.extract_and_translate_text(file_path)

            # Step 2: Summarize the English text (extracted from PDF)
            english_summary = self.summarize_text(method, extracted_text)

            # Step 3: Summarize the Vietnamese text (translated)
            vietnamese_summary = self.summarize_text(method, translated_text)

            try:
                user_instance = users.objects.get(mssv=mssv)
                document_summary = summarize.objects.create(
                    sum_content=english_summary,
                    sum_link=file, 
                    mssv=user_instance,
                    num_depart=user_instance.num_depart
                )
            except users.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            serializer = SumSerializer(document_summary)
            # Step 4: Return response with the required fields
            return JsonResponse({
                'file_name': file.name,
                'extracted_text': extracted_text,
                'vietnamese_translation': translated_text,
                'english_summary': english_summary,
                'vietnamese_summary': vietnamese_summary
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Internal server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Xử lý Summarize VN Ban2
# nltk.download('punkt_tab')
# nltk.download('stopwords')
class SummarizeDocumentVN(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = T5ForConditionalGeneration.from_pretrained("NlpHUST/t5-small-vi-summarization").to(self.device)
        self.tokenizer = T5Tokenizer.from_pretrained("NlpHUST/t5-small-vi-summarization")
        
        self.bart_model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')
        self.bart_tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
        # Initialize Sumy summarizer
        self.sumy_summarizer = LsaSummarizer()
        
        self.stop_words = set(stopwords.words('english'))
        self.nlp = spacy.load('en_core_web_sm')
        
    def extract_text_from_pdf(self, pdf_path):
        reader = PdfReader(pdf_path)
        text = ""

        # Duyệt qua từng trang và trích xuất văn bản
        for i, page in enumerate(reader.pages):
            text += page.extract_text() or ""  # Use or "" to avoid error if extract_text returns None

        return text

    def split_text(self, text, max_length=1000):
        """Chia văn bản thành các đoạn ngắn hơn."""
        if len(text) <= max_length:
            return [text]  # If the text is short enough, return it as a single chunk

        # Split the text into chunks of max_length
        chunks = [text[i:i + max_length] for i in range(0, len(text), max_length)]
        return chunks

    def text_summary_t5(self, text, max_length=256):
        """Tóm tắt văn bản bằng mô hình T5."""
        tokenized_text = self.tokenizer.encode(text, return_tensors="pt").to(self.device)
        self.model.eval()
        summary_ids = self.model.generate(
            tokenized_text,
            max_length=max_length,
            num_beams=5,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True
        )
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary

    def text_summary_sumy(self, text, num_sentences=3):
        """Tóm tắt văn bản bằng phương pháp Sumy (LsaSummarizer)."""
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, num_sentences)

        summary_text = ' '.join(str(sentence) for sentence in summary)
        return summary_text
    
    def summarize_tokenize(self, text, num_sentences=2):
        """Tóm tắt văn bản bằng cách sử dụng tokenization của NLTK."""
        # Tokenize văn bản thành câu
        sentences = sent_tokenize(text)

        # Tokenize văn bản thành từ và loại bỏ stop words
        word_frequencies = defaultdict(int)
        for word in word_tokenize(text.lower()):
            if word.isalnum() and word not in self.stop_words:
                word_frequencies[word] += 1

        # Tính toán tần suất tối đa
        max_frequency = max(word_frequencies.values())

        # Tính toán tần suất từ chuẩn hóa
        for word in word_frequencies:
            word_frequencies[word] = (word_frequencies[word] / max_frequency)

        # Tính điểm cho mỗi câu
        sentence_scores = defaultdict(int)
        for sentence in sentences:
            for word in word_tokenize(sentence.lower()):
                if word in word_frequencies:
                    sentence_scores[sentence] += word_frequencies[word]

        # Chọn số lượng câu để tạo bản tóm tắt
        summary_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]

        # Tạo bản tóm tắt
        summary = ' '.join(summary_sentences)
        return summary
    
    def summarize_spacy(self,text, num_sentences=3):
        doc = self.nlp(text)
        word_freq = Counter(token.text.lower() for token in doc if token.is_alpha and not token.is_stop)
        sentence_scores = {}

        for sent in doc.sents:
            for word in sent:
                if word.text.lower() in word_freq:
                    sentence_scores[sent] = sentence_scores.get(sent, 0) + word_freq[word.text.lower()]

        ranked_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)
        summary_sentences = ranked_sentences[:num_sentences]
        return ' '.join([sent.text for sent in sorted(summary_sentences, key=lambda x: x.start)])

    def summarize_bart(self, text):
        input_ids = self.bart_tokenizer.encode("summarize: " + text, return_tensors="pt", max_length=1024, truncation=True)
        summary_ids = self.bart_model.generate(input_ids, max_length=150, min_length=40, length_penalty=2.0, num_beams=6, early_stopping=True)
        summary = self.bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    
    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({'error': 'No PDF file provided'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        mssv = request.data.get('mssv')
        summarization_method = request.data.get('method', 't5')  # Default method is T5

        temp_file_path = 'temp.pdf'

        # Lưu tệp PDF tạm thời
        with open('temp.pdf', 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)

        # Trích xuất văn bản từ tệp PDF
        text = self.extract_text_from_pdf(temp_file_path)


        if not text:
            return Response({'error': 'No text extracted from the PDF'}, status=status.HTTP_400_BAD_REQUEST)

        # Chia văn bản thành các đoạn nếu quá dài
        chunks = self.split_text(text, max_length=1000)

        summaries = []

        # Chọn phương pháp tóm tắt và tóm tắt từng đoạn
        if summarization_method == 'sumy':
            for chunk in chunks:
                summaries.append(self.text_summary_sumy(chunk))  # Summarize each chunk with Sumy
        elif summarization_method == 'tokenize':
            for chunk in chunks:
                summaries.append(self.summarize_tokenize(chunk))  # Summarize each chunk with NLTK tokenization
        elif summarization_method == 'spacy':
            for chunk in chunks:
                summaries.append(self.summarize_spacy(chunk))  # Summarize each chunk with NLTK tokenization
        elif summarization_method == 'bart':
            for chunk in chunks:
                summaries.append(self.summarize_bart(chunk))
        else:
            for chunk in chunks:
                summaries.append(self.text_summary_t5(chunk))
        # Ghép các đoạn tóm tắt lại
        combined_summary = ' '.join(summaries)

        # Lưu kết quả vào cơ sở dữ liệu
        try:
            user_instance = users.objects.get(mssv=mssv)
            document_summary = summarize.objects.create(
                sum_content=combined_summary,
                sum_link=file,
                mssv=user_instance,
                num_depart=user_instance.num_depart
            )
        except users.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Xóa tệp tạm sau khi xử lý
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

        # Trả về kết quả cho frontend
        return Response({
            'extracted_text': text,
            'summary': combined_summary,  # Return the combined summary
            'method': summarization_method  # Inform the frontend of the summarization method used
        }, status=status.HTTP_200_OK)


# Nhận file video và chuyển đổi thành text 
 
# Xử lý Video tiếng anh thành text

logger = logging.getLogger(__name__)
class ExtractVideo(APIView):
    parser_classes = [MultiPartParser]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.audio_path = None
        self.transcription_result = None
        self.translated_result = None

    def transcribe_audio(self):
        model = whisper.load_model("base")
        result = model.transcribe(self.audio_path)
        self.transcription_result = result["text"]

    def translate_text(self):
        translator = Translator()
        translation = translator.translate(self.transcription_result, src='en', dest='vi')
        self.translated_result = translation.text

    def save_transcriptions(self):
        result_dir = os.path.join(settings.MEDIA_ROOT, 'audio_uploads')
        self.ensure_directory_exists(result_dir)

        original_file_path = os.path.join(result_dir, 'original_transcription.txt')
        translated_file_path = os.path.join(result_dir, 'translated_transcription.txt')

        try:
            with open(original_file_path, 'w', encoding='utf-8') as original_file:
                original_file.write(self.transcription_result)

            with open(translated_file_path, 'w', encoding='utf-8') as translated_file:
                translated_file.write(self.translated_result)
        except Exception as e:
            logger.error(f"Error saving transcription files: {str(e)}", exc_info=True)
            raise RuntimeError(f"Error saving transcription files: {e}")

        return original_file_path, translated_file_path

    def ensure_directory_exists(self, directory):
        if not os.path.exists(directory):
            os.makedirs(directory)
            
# gọi hàm ExtractVideo ở trên tiến hành tách video thành văn bản
# Hàm này không có sum lại
class TranslateVideo(ExtractVideo):
    def post(self, request, *args, **kwargs):
        full_video_path = None
        try:
            video_file = request.FILES.get('video_file')
            if not video_file:
                return Response({'error': 'No file uploaded. Please upload a valid video file.'}, status=status.HTTP_400_BAD_REQUEST)

            # Save video file to temporary location
            video_path = default_storage.save(f'temp_videos/{video_file.name}', video_file)
            full_video_path = os.path.join(settings.MEDIA_ROOT, video_path)

            self.audio_path = os.path.join(settings.MEDIA_ROOT, 'audio_uploads', 'converted_audio.wav')

            # Convert video to audio (wav) using MoviePy
            clip = VideoFileClip(full_video_path)
            clip.audio.write_audiofile(self.audio_path)
            clip.close()

            # Use methods from ExtractVideo class
            self.transcribe_audio()
            self.translate_text()

            # Save transcriptions
            original_file_path, translated_file_path = self.save_transcriptions()

            # Read the contents of the transcription files
            with open(original_file_path, 'r', encoding='utf-8') as original_file:
                original_content = original_file.read()

            with open(translated_file_path, 'r', encoding='utf-8') as translated_file:
                translated_content = translated_file.read()

            # Generate download URLs for both files
            original_file_url = request.build_absolute_uri(settings.MEDIA_URL + 'audio_uploads/original_transcription.txt')
            translated_file_url = request.build_absolute_uri(settings.MEDIA_URL + 'audio_uploads/translated_transcription.txt')

            # Return response with both file contents and download links
            return Response({
                'file_name': video_file.name,
                'original_transcription_path': original_file_url,
                'translated_transcription_path': translated_file_url,
                'original_transcription': original_content,
                'translated_transcription': translated_content
            }, status=status.HTTP_200_OK)

        except FileNotFoundError as e:
            logger.error(f"File not found: {str(e)}", exc_info=True)
            return Response({'error': f'File not found: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except PermissionError as e:
            logger.error(f"Permission denied: {str(e)}", exc_info=True)
            return Response({'error': f'Permission denied: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"An unexpected error occurred: {str(e)}", exc_info=True)
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            # Cleanup temporary files
            if full_video_path and os.path.exists(full_video_path):
                try:
                    os.remove(full_video_path)
                except PermissionError:
                    logger.warning(f'Cannot remove temporary video file: {full_video_path}')

            if self.audio_path and os.path.exists(self.audio_path):
                try:
                    os.remove(self.audio_path)
                except PermissionError:
                    logger.warning(f'Cannot remove temporary audio file: {self.audio_path}')
                    
# Tái sử dụng hàm TranslateVideo cho SummarizeVideo
# Hàm này có sum lại
class SummarizeVideoEN(ExtractVideo):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.translator = Translator()
        
    def save_transcriptions(self):
        try:
            if self.transcription_result is None:
                raise ValueError("Transcription result is None, cannot save transcription.")

            # Path for saving original transcription
            original_transcription_path = os.path.join(settings.MEDIA_ROOT, 'audio_uploads', 'original_transcription.txt')
            with open(original_transcription_path, 'w', encoding='utf-8') as original_file:
                original_file.write(self.transcription_result)  # Ghi transcription_result vào file
            
            # Path for saving translated transcription
            translated_transcription_path = os.path.join(settings.MEDIA_ROOT, 'audio_uploads', 'translated_transcription.txt')
            with open(translated_transcription_path, 'w', encoding='utf-8') as translated_file:
                if self.translated_transcription_result is not None:
                    translated_file.write(self.translated_transcription_result)  # Ghi translated_transcription_result vào file
                else:
                    translated_file.write("No translation available.")  # Trường hợp không có kết quả dịch

            return original_transcription_path, translated_transcription_path

        except Exception as e:
            raise RuntimeError(f"Error saving transcription files: {e}")
        
    def text_summary(self, text, maxlength=None): 
        # Summarize the text using a pre-trained model 
        summary = Summary("sshleifer/distilbart-cnn-12-6", revision="a4f8f3e") 
        result = summary(text) 
        return result
    
    def translate_text(self, text, src_lang='en', dest_lang='vi'):
        try:
            if not text:
                raise ValueError("No text provided for translation.")

            # Sử dụng đối tượng `translator` đã khởi tạo
            translation = self.translator.translate(text, src=src_lang, dest=dest_lang)
            return translation.text

        except Exception as e:
            raise RuntimeError(f"Error while translating text: {e}")
        
        
    def post(self, request, *args, **kwargs):
        full_video_path = None
        mssv = request.data.get('mssv')

        try:
            video_file = request.FILES.get('video_file')  # Tệp video từ request
            if not video_file:
                return Response({'error': 'No file uploaded. Please upload a valid video file.'}, status=status.HTTP_400_BAD_REQUEST)

            # Save video file to temporary location
            video_path = default_storage.save(f'temp_videos/{video_file.name}', video_file)
            full_video_path = os.path.join(settings.MEDIA_ROOT, video_path)

            self.audio_path = os.path.join(settings.MEDIA_ROOT, 'audio_uploads', 'converted_audio.wav')

            # Convert video to audio (wav) using MoviePy
            clip = VideoFileClip(full_video_path)
            clip.audio.write_audiofile(self.audio_path)
            clip.close()

            # Use methods from ExtractVideo class (ví dụ chuyển âm thanh thành văn bản)
            self.transcribe_audio()

            # Kiểm tra xem kết quả chuyển văn bản có tồn tại không
            if self.transcription_result is None:
                raise ValueError("Transcription result is None.")

            # Gán nội dung văn bản cho original_content
            original_content = self.transcription_result

            # Tóm tắt văn bản
            summary_result = self.text_summary(original_content)

            # Dịch tóm tắt sang tiếng Việt
            translated_summary_result = self.translate_text(summary_result, src_lang='en', dest_lang='vi')

            # Dịch toàn bộ transcript sang tiếng Việt
            translated_transcript = self.translate_text(original_content, src_lang='en', dest_lang='vi')

            # Lưu vào cơ sở dữ liệu
            try:
                user_instance = users.objects.get(mssv=mssv)

                summarize_instance = summarize.objects.create(
                    sum_content=summary_result,  # Nội dung tóm tắt dịch
                    sum_link=video_file.name,  # Bạn có thể dùng đường dẫn video hoặc một giá trị khác
                    num_depart=user_instance.num_depart,
                    mssv=user_instance
                )
            except users.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            # Trả về kết quả
            return Response({
                'file_name': video_file.name,
                'original_transcription': original_content,  # Văn bản gốc từ video
                'translated_transcription': translated_transcript,  # Văn bản dịch sang tiếng Việt
                'summary': summary_result,  # Tóm tắt tiếng Anh
                'translated_summary': translated_summary_result  # Tóm tắt dịch sang tiếng Việt
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"An unexpected error occurred: {str(e)}", exc_info=True)
            return Response({'error': f'An unexpected error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
# Xử lý Video mp4 tiếng việt thành text
class SummarizeVideoVN(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = T5ForConditionalGeneration.from_pretrained("NlpHUST/t5-small-vi-summarization").to(self.device)
        self.tokenizer = T5Tokenizer.from_pretrained("NlpHUST/t5-small-vi-summarization")

    def text_summary_t5(self, text, max_length=256):
        """Tóm tắt văn bản bằng mô hình T5."""
        tokenized_text = self.tokenizer.encode(text, return_tensors="pt").to(self.device)
        self.model.eval()
        summary_ids = self.model.generate(
            tokenized_text,
            max_length=max_length,
            num_beams=5,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True
        )
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    
    def post(self, request, *args, **kwargs):
        # Load the Whisper model inside the function
        model = whisper.load_model("medium")
        mssv = request.data.get('mssv')

        # Check if a video file is provided in the request
        if 'video_file' not in request.FILES:
            return Response({"error": "No video file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        video_file = request.FILES['video_file']

        # Save the uploaded video to a temporary location
        temp_video_path = default_storage.save(video_file.name, video_file)
        video_file_path = os.path.join(default_storage.location, temp_video_path)

        # Create a temporary directory to store the extracted audio
        temp_dir = tempfile.mkdtemp()
        audio_file_path = os.path.join(temp_dir, "audio.wav")

        try:
            # Extract audio from the video
            video_clip = VideoFileClip(video_file_path)
            video_clip.audio.write_audiofile(audio_file_path, codec='pcm_s16le')
            video_clip.close()  # Close video_clip to release the file lock

            # Preprocess the audio
            audio = AudioSegment.from_wav(audio_file_path)
            audio = effects.normalize(audio)  # Enhance audio quality
            audio.export(audio_file_path, format="wav")

            # Transcribe the audio to text in Vietnamese
            vietnamese_transcription = model.transcribe(audio_file_path, language="vi")["text"]

            # Transcribe the audio to English
            english_transcription = model.transcribe(audio_file_path, language="en")["text"]

            # Use T5 model to summarize the Vietnamese transcription
            vietnamese_summary = self.text_summary_t5(vietnamese_transcription)

            # Clean up the temporary files
            default_storage.delete(temp_video_path)
            shutil.rmtree(temp_dir)

            try:
                user_instance = users.objects.get(mssv=mssv)
                document_summary = summarize.objects.create(
                    sum_content=vietnamese_summary,
                    sum_link=video_file, 
                    mssv=user_instance,
                    num_depart=user_instance.num_depart
                )
            except users.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            # Return the transcription result as a JSON response
            return Response({
                "vietnamese_transcription": vietnamese_transcription,
                "english_transcription": english_transcription,
                "vietnamese_summary": vietnamese_summary
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # In case of any error, clean up the temporary files
            if os.path.exists(temp_video_path):
                default_storage.delete(temp_video_path)
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# Xử lý audio mp3 tiếng việt và tiến hành sum lại
class SummaryAudioTranscriptionVN(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = T5ForConditionalGeneration.from_pretrained("NlpHUST/t5-small-vi-summarization").to(self.device)
        self.tokenizer = T5Tokenizer.from_pretrained("NlpHUST/t5-small-vi-summarization")

        self.sumy_summarizer = LsaSummarizer()
        
    def text_summary_t5(self, text, max_length=256):
        """Tóm tắt văn bản bằng mô hình T5."""
        tokenized_text = self.tokenizer.encode(text, return_tensors="pt").to(self.device)
        self.model.eval()
        summary_ids = self.model.generate(
            tokenized_text,
            max_length=max_length,
            num_beams=5,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True
        )
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    
    def text_summary_sumy(self, text, num_sentences=3):
        """Tóm tắt văn bản bằng phương pháp Sumy (LsaSummarizer)."""
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, num_sentences)

        summary_text = ' '.join(str(sentence) for sentence in summary)
        return summary_text
    
    def post(self, request, *args, **kwargs):
        # Load the Whisper model inside the function
        model = whisper.load_model("medium")

        # Check if an audio file is provided in the request
        if 'audio_file' not in request.FILES:
            return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        audio_file = request.FILES['audio_file']
        mssv = request.data.get('mssv')
        
        audio_file_name = audio_file.name.lower()

        # Validate the file extension
        if not (audio_file_name.endswith('.mp3') or audio_file_name.endswith('.wav')):
            return Response({"error": "File must be in .mp3 or .wav format"}, status=status.HTTP_400_BAD_REQUEST)

        # Save the uploaded audio file to a temporary location
        video_path = default_storage.save(f'temp_videos/{audio_file.name}', audio_file)
        full_audio_path = os.path.join(settings.MEDIA_ROOT, video_path)

        try:
            # Transcribe the audio to text in Vietnamese
            vietnamese_transcription = model.transcribe(full_audio_path, language="vi")["text"]

            # Transcribe the audio to English
            english_transcription = model.transcribe(full_audio_path, language="en")["text"]

            # Use T5 model to summarize the Vietnamese transcription
            vietnamese_summary = self.text_summary_sumy(vietnamese_transcription)

            # Clean up the temporary file after processing
            if os.path.exists(full_audio_path):
                default_storage.delete(video_path)

            try:
                user_instance = users.objects.get(mssv=mssv)
                document_summary = summarize.objects.create(
                    sum_content=vietnamese_summary,
                    sum_link=audio_file, 
                    mssv=user_instance,
                    num_depart=user_instance.num_depart
                )
            except users.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
                
            # Return the transcription result as a JSON response
            return Response({
                "vietnamese_transcription": vietnamese_transcription,
                "english_transcription": english_transcription,
                "vietnamese_summary": vietnamese_summary
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # In case of any error, clean up the temporary files
            if os.path.exists(full_audio_path):
                default_storage.delete(video_path)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Ghi âm trực tiếp
# SummaryAudioTranscriptionVN tái sử dụng hàm này vào speech to text
class SpeechToText(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = T5ForConditionalGeneration.from_pretrained("NlpHUST/t5-small-vi-summarization").to(self.device)
        self.tokenizer = T5Tokenizer.from_pretrained("NlpHUST/t5-small-vi-summarization")
        self.sumy_summarizer = LsaSummarizer()
        
    def text_summary_t5(self, text, max_length=256):
        """Tóm tắt văn bản bằng mô hình T5."""
        tokenized_text = self.tokenizer.encode(text, return_tensors="pt").to(self.device)
        self.model.eval()
        summary_ids = self.model.generate(
            tokenized_text,
            max_length=max_length,
            num_beams=5,
            repetition_penalty=2.5,
            length_penalty=1.0,
            early_stopping=True
        )
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    
    def text_summary_sumy(self, text, num_sentences=3):
        """Tóm tắt văn bản bằng cách sử dụng Sumy (LsaSummarizer)."""
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, num_sentences)
        summary_text = ' '.join(str(sentence) for sentence in summary)
        return summary_text
    
    def summarize_tokenize(self, text, num_sentences=2):
        """Tóm tắt văn bản bằng cách sử dụng tokenization của NLTK."""
        # Tokenize văn bản thành câu
        sentences = sent_tokenize(text)

        # Tokenize văn bản thành từ và loại bỏ stop words
        word_frequencies = defaultdict(int)
        for word in word_tokenize(text.lower()):
            if word.isalnum() and word not in self.stop_words:
                word_frequencies[word] += 1

        # Tính toán tần suất tối đa
        max_frequency = max(word_frequencies.values())

        # Tính toán tần suất từ chuẩn hóa
        for word in word_frequencies:
            word_frequencies[word] = (word_frequencies[word] / max_frequency)

        # Tính điểm cho mỗi câu
        sentence_scores = defaultdict(int)
        for sentence in sentences:
            for word in word_tokenize(sentence.lower()):
                if word in word_frequencies:
                    sentence_scores[sentence] += word_frequencies[word]

        # Chọn số lượng câu để tạo bản tóm tắt
        summary_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]

        # Tạo bản tóm tắt
        summary = ' '.join(summary_sentences)
        return summary
    
    def speechtotext(self):
        """Ghi âm và chuyển đổi âm thanh đầu vào theo thời gian thực từ micro."""
        recognizer = sr.Recognizer()
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.2)
                print("Đang ghi âm... Bắt đầu nói!")
                audio = recognizer.listen(source)
                print("Ghi âm xong!")
                text = recognizer.recognize_google(audio, language='vi')  # 'vi' cho chuyển đổi tiếng Việt
                return text
        except sr.UnknownValueError:
            return "Lỗi: Không thể nhận diện giọng nói"
        except sr.RequestError as e:
            return f"Lỗi từ dịch vụ Google Speech: {e}"

    def output_text(self, text):
        """Tùy chọn: Lưu văn bản đã chuyển đổi vào tệp."""
        with open("output.txt", "a") as f:
            f.write(text + "\n")

    def record_audio(self, duration=5):
        """Ghi âm âm thanh trong một khoảng thời gian xác định bằng sounddevice."""
        fs = 44100  # Tần số mẫu
        print("Đang ghi âm... Bắt đầu nói!")
        
        # Ghi âm âm thanh
        audio_data = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float64')
        sd.wait()  # Chờ cho ghi âm hoàn tất
        print("Ghi âm xong!")
        
        # Định nghĩa thư mục đầu ra
        output_dir = 'temp_videos'
        os.makedirs(output_dir, exist_ok=True)  # Tạo thư mục nếu chưa tồn tại

        # Định nghĩa đường dẫn tệp đầu ra
        output_file = os.path.join(output_dir, 'output.wav')

        # Chuyển đổi âm thanh sang định dạng int16 và lưu dưới dạng tệp WAV
        wavfile.write(output_file, fs, (audio_data * 32767).astype(np.int16))
        
        return output_file

    def transcribe_audio(self, audio_path):
        """Chuyển đổi tệp âm thanh thành văn bản."""
        recognizer = sr.Recognizer()
        try:
            with sr.AudioFile(audio_path) as source:
                audio_data = recognizer.record(source)
                return recognizer.recognize_google(audio_data, language="vi")
        except sr.UnknownValueError:
            return "Lỗi: Không thể nhận diện giọng nói"
        except sr.RequestError as e:
            return f"Lỗi từ dịch vụ Google Speech: {e}"
        
    def post(self, request, *args, **kwargs):
        # Kiểm tra xem tệp âm thanh có trong yêu cầu không
        if 'audio_file' not in request.FILES:
            return Response({"error": "Chưa có tệp âm thanh nào được cung cấp"}, status=status.HTTP_400_BAD_REQUEST)
        
        mssv = request.data.get('mssv')
        audio_file = request.FILES['audio_file']
        audio_file_name = audio_file.name.lower()

        # Xác thực định dạng tệp
        if not (audio_file_name.endswith('.mp3') or audio_file_name.endswith('.wav')):
            return Response({"error": "Tệp phải có định dạng .mp3 hoặc .wav"}, status=status.HTTP_400_BAD_REQUEST)

        # Lưu tệp âm thanh đã tải lên vào vị trí tạm thời
        temp_audio_path = default_storage.save(f'temp_videos/{audio_file.name}', audio_file)
        full_audio_path = os.path.join(settings.MEDIA_ROOT, temp_audio_path)

        try:
            # Chuyển đổi tệp âm thanh sang định dạng WAV bằng pydub
            audio = AudioSegment.from_file(full_audio_path)
            wav_audio_path = full_audio_path.rsplit('.', 1)[0] + '.wav'
            audio.export(wav_audio_path, format='wav')

            # Chuyển đổi tệp âm thanh
            vietnamese_transcription = self.transcribe_audio(wav_audio_path)

            # Tóm tắt văn bản
            summary = self.text_summary_t5(vietnamese_transcription)

            # Dọn dẹp các tệp tạm thời
            default_storage.delete(temp_audio_path)
            if os.path.exists(wav_audio_path):
                os.remove(wav_audio_path)

            try:
                user_instance = users.objects.get(mssv=mssv)
                document_summary = summarize.objects.create(
                    sum_content=summary,
                    sum_link=audio_file, 
                    mssv=user_instance,
                    num_depart=user_instance.num_depart
                )
            except users.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            # Trả về kết quả chuyển đổi dưới dạng phản hồi JSON
            return Response({
                "vietnamese_transcription": vietnamese_transcription,
                "summary": summary
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Dọn dẹp các tệp tạm thời trong trường hợp có lỗi
            if os.path.exists(full_audio_path):
                default_storage.delete(temp_audio_path)
            if os.path.exists(wav_audio_path):
                os.remove(wav_audio_path)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "Đăng nhập thành công"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LogoutView(APIView):
    def post(self, request, *args, **kwargs):
        # Thực hiện việc đăng xuất
        logout(request)
        return Response({"message": "Đăng xuất thành công"}, status=status.HTTP_200_OK)