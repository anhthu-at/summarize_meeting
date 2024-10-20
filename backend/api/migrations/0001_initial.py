# Generated by Django 5.1.1 on 2024-09-18 01:31

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='department',
            fields=[
                ('num_depart', models.CharField(max_length=100, primary_key=True, serialize=False, unique=True)),
                ('name_depart', models.CharField(max_length=100)),
                ('role', models.CharField(choices=[('0', '0'), ('1', '1'), ('2', '2')], max_length=2, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='meeting',
            fields=[
                ('meeting_name', models.CharField(max_length=100, primary_key=True, serialize=False, unique=True)),
                ('meeting_link', models.URLField(max_length=2000)),
                ('start_date', models.DateField(default='2024-01-01')),
                ('start_time', models.TimeField(default='12:00:00')),
                ('end_date', models.DateField(default='2024-01-01')),
                ('end_time', models.TimeField(default='12:00:00')),
                ('num_depart', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.department')),
            ],
        ),
        migrations.CreateModel(
            name='users',
            fields=[
                ('mssv', models.CharField(max_length=50, primary_key=True, serialize=False, unique=True)),
                ('name', models.CharField(max_length=50, null=True)),
                ('password', models.CharField(max_length=50, null=True)),
                ('num_depart', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.department')),
            ],
        ),
        migrations.CreateModel(
            name='summarize',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sum_content', models.CharField(max_length=10000)),
                ('sum_link', models.CharField(max_length=1000)),
                ('num_depart', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.department')),
                ('mssv', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.users')),
            ],
        ),
    ]
