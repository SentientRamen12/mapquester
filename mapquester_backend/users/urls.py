from django.urls import path

from . import views

urlpatterns = [
    # Define the paths for user-related functionalities
    path("signup/", views.signup, name="signup"),
    path("login/", views.login, name="login"),
    path("logout/", views.logout, name="logout"),
    path("edit-profile/", views.edit_profile, name="edit_profile"),
    path("delete-account/", views.delete_account, name="delete_account"),
    path("user/", views.get_user, name="get_user"),
    path("user/<str:username>/", views.get_user, name="get_user_detail"),
    path("exact-user/<str:id>/", views.get_exact_user, name="get_exact_user_detail"),
]
