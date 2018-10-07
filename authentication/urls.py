from django.urls import path

from .views import LandingPageView

app_name = 'authentication'
urlpatterns = [
    path('', LandingPageView.index, name='index'),
]