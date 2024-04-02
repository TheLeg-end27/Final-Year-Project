"""
Models for map project.

Describes the fields and tables for the moderator role. 
"""
from django.contrib.auth.models import AbstractUser
from django.db import models

class Moderator(AbstractUser):
    pass
    def __str__(self):
        return self.username