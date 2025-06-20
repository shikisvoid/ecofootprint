# Terraform configuration for Google Cloud deployment
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

# Variables
variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "app_name" {
  description = "The application name"
  type        = string
  default     = "eco-footprint-app"
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "compute.googleapis.com"
  ])
  
  project = var.project_id
  service = each.value
  
  disable_dependent_services = true
}

# Cloud Run service
resource "google_cloud_run_service" "eco_footprint_app" {
  name     = var.app_name
  location = var.region
  project  = var.project_id

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/${var.app_name}:latest"
        
        ports {
          container_port = 80
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
      }
      
      container_concurrency = 80
      timeout_seconds      = 300
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
        "run.googleapis.com/cpu-throttling" = "true"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.required_apis]
}

# IAM policy to allow unauthenticated access
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.eco_footprint_app.name
  location = google_cloud_run_service.eco_footprint_app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output the service URL
output "service_url" {
  value = google_cloud_run_service.eco_footprint_app.status[0].url
  description = "The URL of the deployed Cloud Run service"
}

output "service_name" {
  value = google_cloud_run_service.eco_footprint_app.name
  description = "The name of the Cloud Run service"
}
