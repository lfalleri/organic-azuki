from django.conf.urls import patterns, url, include
from django.contrib import admin
from django.conf.urls.static import static
from django.conf import settings

from rest_framework_nested import routers

from authentication.views import AccountViewSet, \
                                 AccountView, \
                                 AddressesView,\
                                 LoginView, \
                                 LogoutView, \
                                 FullAccountView, \
                                 SettingsView, \
                                 LandingPageView, \
                                 ConfigView, \
                                 PasswordRecoveryView,\
                                 UpdateNewPasswordView

from shop.views import ReferenceView, \
                       CollectionView, \
                       PanierView, \
                       ModeDeLivraisonView,\
                       CodeReductionView,\
                       TransactionView, \
                       CommandeView

from organic_azuki.views import IndexView,\
                           LandingPageView

from messaging.views import AccountCreationEmailView, \
                            AccountDeletionToCustomerEmailView,\
                            AccountDeletionToStaffEmailView, \
                            CommandConfirmationToCustomerEmailView, \
                            CommandConfirmationToStaffEmailView, \
                            YogaCancellationToCustomerEmailView, \
                            YogaCancellationToStaffEmailView,\
                            RestaurantReservationToStaffEmailView, \
                            RestaurantReservationToCustomerEmailView, \
                            ContactEmailView,\
                            PasswordRecoveryEmailView

router = routers.SimpleRouter()
router.register(r'accounts', AccountViewSet)

accounts_router = routers.NestedSimpleRouter(
    router, r'accounts', lookup='account'
)

admin.autodiscover()

urlpatterns = patterns(
    '',
    # Account Views
    url(r'^api/v1/', include(router.urls)),
    url(r'^api/v1/', include(accounts_router.urls)),
    url(r'^api/v1/auth/login/$', LoginView.as_view(), name='login'),
    url(r'^api/v1/auth/logout/$', LogoutView.as_view(), name='logout'),
    url(r'^api/v1/auth/fullaccount/$', FullAccountView.as_view(), name='account'),
    url(r'^api/v1/auth/accounts/$', AccountView.as_view(), name='accounts'),
    url(r'^api/v1/auth/update-profile/$', AccountView.as_view(), name='update'),
    url(r'^api/v1/auth/password-recovery/$', PasswordRecoveryView.as_view(), name='recovery'),
    url(r'^api/v1/auth/update-password/$', UpdateNewPasswordView.as_view(), name='update-password'),
    url(r'^api/v1/auth/addresses/$', AddressesView.as_view(), name='addresses'),

    # Config view
    url(r'^api/v1/config/$', ConfigView.as_view(), name='config'),

    # Shop views
    url(r'^api/v1/shop/allReferences/$', ReferenceView.as_view(), name='allReferences'),
    url(r'^api/v1/shop/reference/$', ReferenceView.as_view(), name='reference'),
    url(r'^api/v1/shop/collection/$', CollectionView.as_view(), name='collection'),
    url(r'^api/v1/shop/panier/$', PanierView.as_view(), name='panier'),
    url(r'^api/v1/shop/modeDeLivraison/$', ModeDeLivraisonView.as_view(), name='modeDeLivraison'),
    url(r'^api/v1/shop/codeReduction/$', CodeReductionView.as_view(), name='codeReduction'),
    url(r'^api/v1/shop/transaction/$', TransactionView.as_view(), name='transaction'),
    url(r'^api/v1/shop/commande/$', CommandeView.as_view(), name='commande'),

    # Messaging Views
    url(r'^api/v1/messaging/account_creation_email/$', AccountCreationEmailView.as_view(), name='creation_email'),
    url(r'^api/v1/messaging/account_deletion_to_customer_email/$', AccountDeletionToCustomerEmailView.as_view(), name='deletion_to_customer_email'),
    url(r'^api/v1/messaging/account_deletion_to_staff_email/$', AccountDeletionToStaffEmailView.as_view(), name='deletion_to_staff_email'),
    url(r'^api/v1/messaging/command_confirmation_to_customer_email/$', CommandConfirmationToCustomerEmailView.as_view(), name='command_confirmation_to_customer_email'),
    url(r'^api/v1/messaging/command_confirmation_to_staff_email/$', CommandConfirmationToStaffEmailView.as_view(), name='command_confirmation_to_staff_email'),
    url(r'^api/v1/messaging/contact/$', ContactEmailView.as_view(), name='contact_email'),
    url(r'^api/v1/messaging/recovery/$', PasswordRecoveryEmailView.as_view(), name='recovery_email'),

    # Admin Views
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin/$', include(admin.site.urls)),
    url(r'^admin/([-]?[0-9]*)/$', include(admin.site.urls)),

    # Index Views
    url('^.*$', IndexView.as_view(), name='index'),
) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
