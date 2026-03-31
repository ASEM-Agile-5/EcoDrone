from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('drone', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='drone',
            name='model',
            field=models.CharField(default='ED-X1', max_length=100),
        ),
        migrations.AddField(
            model_name='drone',
            name='max_payload',
            field=models.CharField(default='0kg', max_length=50),
        ),
        migrations.AlterField(
            model_name='drone',
            name='status',
            field=models.CharField(default='Idle', max_length=100),
        ),
        migrations.AlterField(
            model_name='drone',
            name='battery_level',
            field=models.CharField(default='100%', max_length=50),
        ),
        migrations.AlterField(
            model_name='drone',
            name='current_location',
            field=models.CharField(default='Base', max_length=255),
        ),
    ]
