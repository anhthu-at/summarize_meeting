from django.db import models

# Create your models here.
# 0 la admin
# 1 la manager
# 2 la user
class department(models.Model):
    ROLE_CHOICES = [
        ('0', '0'), 
        ('1', '1'),
        ('2', '2'),
    ]
    num_depart = models.CharField(unique=True,max_length=100,primary_key=True)
    name_depart = models.CharField(max_length=100)
    role = models.CharField(max_length=2, choices=ROLE_CHOICES, null=True)
    
    def __str__(self):
        return self.num_depart

class users(models.Model):
    mssv = models.CharField(max_length=50, unique=True,primary_key=True)
    name = models.CharField(max_length=50, null=True)
    password = models.CharField(max_length=50, null=True)
    num_depart = models.ForeignKey(department, on_delete=models.CASCADE,blank=True, null=True) 
    
    def __str__(self):
            return self.mssv

class meeting(models.Model):
    meeting_name = models.CharField(unique=True, max_length=100,primary_key=True)
    meeting_link = models.URLField(max_length=2000)
    start_date = models.DateField(default='2024-01-01')
    start_time = models.TimeField(default='12:00:00')
    end_date = models.DateField(default='2024-01-01')
    end_time = models.TimeField(default='12:00:00')
    num_depart = models.ForeignKey(department, on_delete=models.CASCADE,blank=True, null=True) 
    
    def __str__(self):
        return self.meeting_name
    

class summarize(models.Model):
    sum_content = models.CharField(max_length=10000)
    sum_link = models.CharField(max_length=1000)
    num_depart = models.ForeignKey(department,on_delete=models.CASCADE,blank=True, null=True)
    mssv = models.ForeignKey(users,on_delete=models.CASCADE,blank=True, null=True)

    def __str__(self):
        return self.id

