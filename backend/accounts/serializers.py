from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from accounts.models import CandidateProfile, RecruiterProfile
from accounts.validators import validate_resume_file, validate_image_file

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['name'] = user.name
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'name': self.user.name,
            'email': self.user.email,
            'role': self.user.role,
            'phone': self.user.phone,
            'profile_image': self.user.profile_image.url if self.user.profile_image else None,
            'is_active': self.user.is_active,
        }
        if self.user.role == 'RECRUITER' and hasattr(self.user, 'recruiter_profile'):
            data['user']['company_name'] = self.user.recruiter_profile.company_name
            data['user']['company_logo'] = self.user.recruiter_profile.company_logo.url if self.user.recruiter_profile.company_logo else None
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'role', 'profile_image', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'role', 'created_at', 'updated_at']


class CandidateRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            name=validated_data['name'],
            phone=validated_data.get('phone', ''),
            role=User.Role.CANDIDATE
        )
        CandidateProfile.objects.create(user=user)
        return user


class RecruiterRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)
    company_name = serializers.CharField(write_only=True, required=True, max_length=255)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'company_name', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            name=validated_data['name'],
            phone=validated_data.get('phone', ''),
            role=User.Role.RECRUITER
        )
        RecruiterProfile.objects.create(user=user, company_name=company_name)
        return user


class CandidateProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    resume_name = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user', 'location', 'bio', 'education', 'degree',
            'institution', 'graduation_year', 'experience', 'skills',
            'projects', 'resume', 'resume_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_resume(self, value):
        if value:
            validate_resume_file(value)
        return value

    def get_resume_name(self, obj):
        if obj.resume:
            import os
            return os.path.basename(obj.resume.name)
        return None


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'user', 'company_name', 'company_logo', 'company_description',
            'website', 'location', 'industry', 'company_size', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
