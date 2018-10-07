# Procfile with nginx, pgbouncer, uWSGI and django-q
web: bin/start-nginx bin/start-pgbouncer-stunnel uwsgi uwsgi.ini
worker: bin/start-pgbouncer-stunnel python manage.py qcluster
