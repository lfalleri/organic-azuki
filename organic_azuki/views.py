from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic.base import TemplateView
from django.utils.decorators import method_decorator
from rest_framework import views

class IndexView(TemplateView):
    template_name = 'organic_azuki/index.html'

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, *args, **kwargs):
        return super(IndexView, self).dispatch(*args, **kwargs)



class LandingPageView(TemplateView):
    template_name = 'general.html'

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, *args, **kwargs):
        return super(LandingPageView, self).dispatch(*args, **kwargs)



