from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from accounts.models import CandidateProfile, RecruiterProfile
from accounts.serializers import (
    UserSerializer,
    CandidateRegistrationSerializer,
    RecruiterRegistrationSerializer,
    CandidateProfileSerializer,
    RecruiterProfileSerializer,
    CustomTokenObtainPairSerializer,
)
from accounts.permissions import IsCandidate, IsRecruiter, IsAdminUserRole

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class CandidateRegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CandidateRegistrationSerializer


class RecruiterRegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RecruiterRegistrationSerializer


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        if request.user.role == User.Role.CANDIDATE and hasattr(request.user, 'candidate_profile'):
            data['candidate_profile'] = CandidateProfileSerializer(request.user.candidate_profile).data
        elif request.user.role == User.Role.RECRUITER and hasattr(request.user, 'recruiter_profile'):
            data['recruiter_profile'] = RecruiterProfileSerializer(request.user.recruiter_profile).data
        return Response(data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CandidateProfileView(APIView):
    permission_classes = [IsCandidate]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecruiterProfileView(APIView):
    permission_classes = [IsRecruiter]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdminUserRole]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all().order_by('-created_at')
        role = self.request.query_params.get('role', None)
        search = self.request.query_params.get('search', None)
        if role:
            queryset = queryset.filter(role=role.upper())
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(email__icontains=search)
        return queryset


class AdminUserToggleStatusView(APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Prevent disabling self
            if user == request.user:
                return Response({'error': 'You cannot deactivate your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)
            user.is_active = not user.is_active
            user.save()
            return Response({'id': user.id, 'is_active': user.is_active, 'message': f"User {'activated' if user.is_active else 'deactivated'} successfully."})
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
