ARG PYTHON_VERSION=3.13.0
FROM python:${PYTHON_VERSION}-slim as base

# Dont write pyc files to pycache ig
ENV PYTHONDONTWRITEBYTECODE=1

# Making sure no logs get lost if something crashes
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# user for security reasons
# ARG UID=10001
# RUN adduser \
#     --disabled-password \
#     --gecos "" \
#     --home "/nonexistent" \
#     --shell "/sbin/nologin" \
#     --no-create-home \
#     --uid "${UID}" \
#     appuser

COPY requirements.txt .
RUN pip install -r requirements.txt

# USER appuser

COPY . . 

EXPOSE 8000

CMD python main.py