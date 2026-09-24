import django_filters
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job

class JobFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    company = django_filters.CharFilter(lookup_expr='icontains')
    location = django_filters.CharFilter(lookup_expr='icontains')
    skill = django_filters.CharFilter(field_name='required_skills', lookup_expr='icontains')
    job_type = django_filters.ChoiceFilter(choices=Job.JobType.choices)
    experience_min = django_filters.NumberFilter(field_name='experience_min', lookup_expr='lte')
    experience_max = django_filters.NumberFilter(field_name='experience_max', lookup_expr='gte')
    salary_min = django_filters.NumberFilter(field_name='salary_min', lookup_expr='gte')
    posted_within = django_filters.NumberFilter(method='filter_posted_within')

    class Meta:
        model = Job
        fields = ['title', 'company', 'location', 'job_type', 'experience_min', 'experience_max', 'salary_min', 'status']

    def filter_posted_within(self, queryset, name, value):
        if value:
            cutoff = timezone.now() - timedelta(days=int(value))
            return queryset.filter(created_at__gte=cutoff)
        return queryset
