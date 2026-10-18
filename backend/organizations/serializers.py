from rest_framework import serializers
from .models import Organization, Membership, Invitation

class OrganizationSerializer(serializers.ModelSerializer):
    my_role = serializers.SerializerMethodField()
    class Meta:
        model = Organization
        fields = ("id", "name", "slug", "my_role", "created_at")
        read_only_fields = ("id", "slug", "my_role", "created_at")
    def get_my_role(self, obj):
        user = self.context["request"].user
        return Membership.objects.filter(organization=obj, user=user).values_list("role", flat=True).first()

class MemberSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    membership_id = serializers.IntegerField(source="id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = Membership
        fields = ("id", "membership_id", "username", "email", "full_name", "role", "joined_at")
        read_only_fields = fields
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

class InvitationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = ("id", "email", "role", "created_at", "expires_at", "accepted_at")
        read_only_fields = fields

class CreateInvitationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=["admin", "manager", "member"], default="member")
    def validate_email(self, value):
        return value.strip().lower()
