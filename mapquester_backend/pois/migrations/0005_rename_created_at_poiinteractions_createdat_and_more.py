# Generated by Django 4.2.16 on 2024-12-08 07:10

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("pois", "0004_poiinteractions"),
    ]

    operations = [
        migrations.RenameField(
            model_name="poiinteractions",
            old_name="created_at",
            new_name="createdAt",
        ),
        migrations.RenameField(
            model_name="poiinteractions",
            old_name="interaction_type",
            new_name="interactionType",
        ),
        migrations.RenameField(
            model_name="poiinteractions",
            old_name="updated_at",
            new_name="updatedAt",
        ),
    ]
