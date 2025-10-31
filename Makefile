SHELL := /bin/bash
# =============================================================================
# Variables
# =============================================================================

.DEFAULT_GOAL:=help
.ONESHELL:
.EXPORT_ALL_VARIABLES:
MAKEFLAGS += --no-print-directory

# Define colors and formatting
BLUE := $(shell printf "\033[1;34m")
GREEN := $(shell printf "\033[1;32m")
RED := $(shell printf "\033[1;31m")
YELLOW := $(shell printf "\033[1;33m")
NC := $(shell printf "\033[0m")
INFO := $(shell printf "$(BLUE)ℹ$(NC)")
OK := $(shell printf "$(GREEN)✓$(NC)")
WARN := $(shell printf "$(YELLOW)⚠$(NC)")
ERROR := $(shell printf "$(RED)✖$(NC)")

LOCAL_PHENOMATE_CORE := ../phenomate-core
LOCAL_APPM := ../appn-project-manager

.PHONY: help
help:                                               ## Display this help text for Makefile
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z0-9_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)


# =============================================================================
# Developer Utils
# =============================================================================
.PHONY: install-mq
install-mq: 										## Install rabbit mq server for local development
	@apt-get install rabbitmq-server
.PHONY: install-libjpeg-turbo
install-libjpeg-turbo: 								# Install libjpeg turbo - run with sudo
	@wget -q -O- https://packagecloud.io/dcommander/libjpeg-turbo/gpgkey | gpg --dearmor > /etc/apt/trusted.gpg.d/libjpeg-turbo.gpg
	@echo "deb [signed-by=/etc/apt/trusted.gpg.d/libjpeg-turbo.gpg] https://packagecloud.io/dcommander/libjpeg-turbo/any/ any main" > /etc/apt/sources.list.d/libjpeg-turbo.list
	@apt update
	@apt install libjpeg-turbo-official

.PHONY: install-uv
install-uv:                                         ## Install latest version of uv
	@echo "${INFO} Installing uv..."
	@curl -LsSf https://astral.sh/uv/install.sh  | sh # >/dev/null 2>&1
	@uv tool install nodeenv >/dev/null 2>&1
	@echo "${OK} UV installed successfully"

.PHONY: install-backend-dev
install-backend-dev: destroy clean                  ## Install the project, dependencies, and pre-commit for local development
	@echo "${INFO} Starting fresh installation..."
	@uv python pin 3.11 >/dev/null 2>&1
	@uv venv >/dev/null 2>&1
	@uv sync --all-extras --dev --group analysis

.PHONY: install-backend
install-backend: destroy clean						## Install backend - for docker
	@echo "${INFO} Starting fresh installation..."
	@uv python pin 3.11 >/dev/null 2>&1
	@uv pip install --system --no-cache -r pyproject.toml

.PHONY: install-frontend
install-frontend-dev:
	@if ! command -v npm >/dev/null 2>&1; then \
		echo "${INFO} Installing Node environment... 📦"; \
		uvx nodeenv .venv --force --quiet; \
	fi
	@NODE_OPTIONS="--no-deprecation --disable-warning=ExperimentalWarning" npm install --no-fund
	@echo "${OK} Installation complete! 🎉"
.PHONY: install-dev
install-dev: install-backend-dev install-frontend-dev

.PHONY: upgrade
upgrade:                                            ## Upgrade all dependencies to the latest stable versions
	@echo "${INFO} Updating all dependencies... 🔄"
	@uv lock --upgrade
	@NODE_OPTIONS="--no-deprecation --disable-warning=ExperimentalWarning" uv run npm upgrade --latest
	@echo "${OK} Dependencies updated 🔄"
	@NODE_OPTIONS="--no-deprecation --disable-warning=ExperimentalWarning" uv run pre-commit autoupdate
	@echo "${OK} Updated Pre-commit hooks 🔄"

.PHONY: clean
clean:                                              ## Cleanup temporary build artifacts
	@echo "${INFO} Cleaning working directory..."
	@rm -rf pytest_cache .ruff_cache .hypothesis build/ -rf dist/ .eggs/ .coverage coverage.xml coverage.json htmlcov/ .pytest_cache tests/.pytest_cache tests/**/.pytest_cache .mypy_cache .unasyncd_cache/ .auto_pytabs_cache node_modules >/dev/null 2>&1
	@find . -name '*.egg-info' -exec rm -rf {} + >/dev/null 2>&1
	@find . -type f -name '*.egg' -exec rm -f {} + >/dev/null 2>&1
	@find . -name '*.pyc' -exec rm -f {} + >/dev/null 2>&1
	@find . -name '*.pyo' -exec rm -f {} + >/dev/null 2>&1
	@find . -name '*~' -exec rm -f {} + >/dev/null 2>&1
	@find . -name '__pycache__' -exec rm -rf {} + >/dev/null 2>&1
	@find . -name '.ipynb_checkpoints' -exec rm -rf {} + >/dev/null 2>&1
	@echo "${OK} Working directory cleaned"

.PHONY: destroy
destroy:                                            ## Destroy the virtual environment
	@echo "${INFO} Destroying virtual environment... 🗑️"
	@rm -rf .venv
	@echo "${OK} Virtual environment destroyed 🗑️"

.PHONY: lock
lock:                                              ## Rebuild lockfiles from scratch, updating all dependencies
	@echo "${INFO} Rebuilding lockfiles... 🔄"
	@uv lock --upgrade >/dev/null 2>&1
	@echo "${OK} Lockfiles updated"

# Update the path to phenomate-core as needed
.PHONY: install-local-phenomate-core
install-local-phenomate-core:
	uv pip install ${LOCAL_PHENOMATE_CORE}

# Update the path to appn-project-manager as needed
.PHONY: install-local-appm
install-local-appm:
	uv pip install ${LOCAL_APPM}

# =============================================================================
# Tests, Linting, Coverage
# =============================================================================
.PHONY: mypy
mypy:                                              ## Run mypy
	@echo "${INFO} Running mypy... 🔍"
	@uv run dmypy run backend
	@echo "${OK} Mypy checks passed ✨"

.PHONY: type-check
type-check: mypy		                           ## Run all type checking

.PHONY: pre-commit
pre-commit:                                        ## Runs pre-commit hooks; includes ruff formatting and linting, codespell
	@echo "${INFO} Running pre-commit checks... 🔎"
	@uv run pre-commit run --color=always --all-files
	@echo "${OK} Pre-commit checks passed ✨"


.PHONY: fix
fix:                                               ## Run formatting scripts
	@echo "${INFO} Running code formatters... 🔧"
	@uv run ruff check --fix --unsafe-fixes
	@echo "${OK} Code formatting complete ✨"

.PHONY: lint
lint: pre-commit type-check 			       ## Run all linting

.PHONY: coverage
coverage:                                          ## Run the tests and generate coverage report
	@echo "${INFO} Running tests with coverage... 📊"
	@uv run pytest tests --cov -n auto --quiet
	@uv run coverage html >/dev/null 2>&1
	@uv run coverage xml >/dev/null 2>&1
	@echo "${OK} Coverage report generated ✨"

.PHONY: test
test:                                              ## Run the tests
	@echo "${INFO} Running test cases... 🧪"
	@uv run pytest tests -n 2 --quiet
	@echo "${OK} Tests passed ✨"

.PHONY: test-all
test-all:                                          ## Run all tests
	@echo "${INFO} Running all test cases... 🧪"
	@uv run pytest tests -m '' -n 2 --quiet
	@echo "${OK} All tests passed ✨"

.PHONY: check-all
check-all: lint test-all coverage                  ## Run all linting, tests, and coverage checks


# -----------------------------------------------------------------------------
# Server
# -----------------------------------------------------------------------------
.PHONY: run-server
run-server:											## Start local django server for debugging
	@uv run manage.py runserver

# sudo systemctl status rabbitmq-server
# sudo systemctl start rabbitmq-server
.PHONY: run-celery
# loglevel can be overriden in file: backend\settings.py 
run-celery: 										## Start celery server 
	@uv run celery -A backend worker --loglevel=info --concurrency=4

.PHONY: clear-db
clear-db:											## Remove current db session and load bootstrap data
	@rm -rf db.sqlite3
	@uv run manage.py makemigrations project activity researcher organisation
	@uv run manage.py migrate

.PHONY:
admin:												## Create admin username admin
	@uv run manage.py createsuperuser --username admin

.PHONY: run-ui
run-ui:												## Run local ui server for development
	npm run dev
	
.PHONY: run-docker									## Docker compose up and kill existing ports
run-docker:
	@kill -9 $$(lsof -ti:5432) 2>/dev/null || echo "No process found on port 5432"
	@kill -9 $$(lsof -ti:5672) 2>/dev/null || echo "No process found on port 5672"
	@kill -9 $$(lsof -ti:8000) 2>/dev/null || echo "No process found on port 8000"
	@kill -9 $$(lsof -ti:3000) 2>/dev/null || echo "No process found on port 3000"
	@docker compose up
