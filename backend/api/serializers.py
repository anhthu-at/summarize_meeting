from rest_framework import serializers
from .models import *

  
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = department
        fields = ('num_depart','name_depart','role')

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = users
        fields = ('mssv','name','password','num_depart')

class SumSerializer(serializers.ModelSerializer):
    class Meta:
        model = summarize
        fields = ('id','sum_content','sum_link','mssv','num_depart')

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = meeting
        fields = ('meeting_name','meeting_link','start_date','start_time','end_date','end_time','num_depart')

class TextSerializer(serializers.Serializer):
    input_text = serializers.CharField()

class LoginSerializer(serializers.Serializer):
    student_id = serializers.CharField(required=True)  # Mã số sinh viên
    password = serializers.CharField(required=True)     # Mật khẩu
    
    def validate(self, data):
        student_id = data.get('student_id')
        password = data.get('password')
        
        # Kiểm tra xem người dùng có tồn tại không
        try:
            user = users.objects.get(mssv=student_id)
        except users.DoesNotExist:
            raise serializers.ValidationError("Mã số sinh viên không hợp lệ")
        
        # Kiểm tra mật khẩu có đúng không
        if user.password != password:  # Đảm bảo so sánh mật khẩu chính xác
            raise serializers.ValidationError("Mật khẩu không đúng")
        
        return data