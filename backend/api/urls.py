from django.urls import path

from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('project', get_LinksViewSet, basename='project')
router.register('department', get_Department , basename='department')
router.register('summarize', get_Sum , basename='summarize')
router.register('users', get_User , basename='users')

urlpatterns = [
    path('home', get_home),  # Trang chủ
    path('api/transcribe/', AudioTranscriptionAPI.as_view(), name='audio_transcribe_api'),
    path('api/summarize-text/', SummarizerText.as_view(), name='summarize_text_api'),
    path('api/summarize-document/', SummarizerDocument.as_view(), name='summarize_document_api'),
    path('api/translate-document/', TranslateDocument.as_view(), name='translate_document'),
    path('api/translate-video/', TranslateVideo.as_view(), name='translate_video'),
    path('api/translate-summary/', TranslateSummary.as_view(), name='translate_summarize'),
    path('api/translate-summaryVN/', SummarizeDocumentVN.as_view(), name='summarize_documentVN'),
    path('api/translate-summaryEN/', SummarizeDocumentEN.as_view(), name='summarize_documentVN'),
    
    path('api/today-meetings/', Get_home_meeting.as_view(), name='today-meetings'),
    
    path('api/speech-to-text/', SpeechToText.as_view(), name='speech-to-text'),
    path('api/translate-summary-audioEN/', SummaryAudioTranscriptionEN.as_view(), name='translate_audio_EN'),
    path('api/translate-summary-audioVN/', SummaryAudioTranscriptionVN.as_view(), name='translate_audio_VN'),

    path('api/translate-summary-videoEN/', SummarizeVideoEN.as_view(), name='translate_summarize_videoEN'),
    path('api/translate-summary-videoVN/', SummarizeVideoVN.as_view(), name='translate_summarize_videoVN'),
    
    path('api/login/', LoginView.as_view(), name='login_api'),
    path('api/logout/', LogoutView.as_view(), name='login_api'),


]

urlpatterns += router.urls