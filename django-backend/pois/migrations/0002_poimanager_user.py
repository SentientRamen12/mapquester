# Generated by Django 3.2.3 on 2024-10-16 03:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('users', '0001_initial'),
        ('pois', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='poimanager',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.user'),
        ),
    ]
