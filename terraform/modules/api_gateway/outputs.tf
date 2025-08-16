output "api_gateway_invoke_url" {
  description = "Invoke URL of the API Gateway"
  value       = aws_api_gateway_deployment.api.invoke_url
}

output "custom_domain_url" {
  description = "Custom domain URL if configured"
  value       = var.create_custom_domain ? "https://${var.custom_domain_name}" : ""
}