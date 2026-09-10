# Slim, not alpine: trafilatura pulls lxml, and musl wheels do not exist for it,
# so alpine would compile it from source at every build.
FROM python:3.13-slim

WORKDIR /app

# Dependencies first, in their own layer: they change far less often than the
# prompts, so editing an instruction rebuilds seconds instead of minutes.
COPY pyproject.toml ./
COPY digest_agent ./digest_agent
RUN pip install --no-cache-dir uv && uv pip install --system --no-cache .

# Non-root: the container is exposed through the Nginx facade, so it runs with
# the least it needs.
RUN useradd --create-home --uid 10001 agent
USER agent

EXPOSE 8000
CMD ["uvicorn", "digest_agent.service:app", "--host", "0.0.0.0", "--port", "8000"]
