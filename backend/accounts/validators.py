import os
from django.core.exceptions import ValidationError

def validate_resume_file(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.pdf', '.docx']
    if ext not in valid_extensions:
        raise ValidationError(f'Unsupported file format. Please upload a PDF or DOCX file (got {ext}).')
    
    max_size = 5 * 1024 * 1024  # 5 MB
    if value.size > max_size:
        raise ValidationError('Resume file size cannot exceed 5MB.')

def validate_image_file(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    if ext not in valid_extensions:
        raise ValidationError(f'Unsupported image format. Allowed formats: JPG, PNG, WEBP (got {ext}).')
    
    max_size = 3 * 1024 * 1024  # 3 MB
    if value.size > max_size:
        raise ValidationError('Image file size cannot exceed 3MB.')
