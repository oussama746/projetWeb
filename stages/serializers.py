from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import StageOffer, Candidature, StudentProfile


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
    
    def get_role(self, obj):
        groups = obj.groups.all()
        return groups[0].name if groups.exists() else None


class StageOfferSerializer(serializers.ModelSerializer):
    candidature_count = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StageOffer
        fields = [
            'id', 'organisme', 'contact_name', 'contact_email', 
            'date_depot', 'title', 'description', 'state', 
            'closing_reason', 'candidature_count', 'has_applied',
            'company', 'company_name', 'city', 'duration', 'domain', 'remote'
        ]
        read_only_fields = ['date_depot', 'candidature_count']
    
    def get_candidature_count(self, obj):
        return obj.candidature_set.count()
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.candidature_set.filter(student=request.user).exists()
        return False
    
    def get_company_name(self, obj):
        return obj.company.username if obj.company else None


class CandidatureSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    offer = StageOfferSerializer(read_only=True)
    offer_id = serializers.PrimaryKeyRelatedField(
        queryset=StageOffer.objects.all(),
        source='offer',
        write_only=True
    )
    student_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidature
        fields = ['id', 'offer', 'offer_id', 'student', 'student_profile', 'date_candidature', 'status']
        read_only_fields = ['date_candidature', 'student']
    
    def get_student_profile(self, obj):
        try:
            profile = obj.student.studentprofile
            return {
                'bio': profile.bio,
                'cv': profile.cv.url if profile.cv else None,
                'phone': profile.phone
            }
        except StudentProfile.DoesNotExist:
            return None


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'bio', 'cv', 'phone']
