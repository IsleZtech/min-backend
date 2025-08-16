output "api_gateway_invoke_url" {
  description = "Invoke URL of the API Gateway"
  value       = aws_api_gateway_deployment.api.invoke_url
}

output "custom_domain_url" {
  description = "Custom domain URL if configured"
  value       = var.create_custom_domain ? "https://${var.custom_domain_name}" : ""
}

output "api_key_id" {
  description = "API Key ID"
  value       = var.enable_api_key ? aws_api_gateway_api_key.api_key[0].id : ""
  sensitive   = true
}

output "api_key_value" {
  description = "API Key value"
  value       = var.enable_api_key ? aws_api_gateway_api_key.api_key[0].value : ""
  sensitive   = true
}