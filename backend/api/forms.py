from django import forms

class TextForm(forms.Form):
    input_text = forms.CharField(widget=forms.Textarea, label="Enter your text here")

class DocumentForm(forms.Form):
    input_file = forms.FileField(label="Upload your document here")

