output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = module.api_gateway.api_gateway_invoke_url
}

output "custom_domain_url" {
  description = "Custom domain URL"
  value       = module.api_gateway.custom_domain_url
}