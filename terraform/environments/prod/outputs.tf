output "api_gateway_url" {
  description = "URL of the API Gateway"
  value       = module.api_gateway.api_gateway_invoke_url
}

output "custom_domain_url" {
  description = "Custom domain URL"
  value       = module.api_gateway.custom_domain_url
}

output "api_key_value" {
  description = "API Key value (run 'terraform output -raw api_key_value' to see)"
  value       = module.api_gateway.api_key_value
  sensitive   = true
}

output "vpc_endpoint_id" {
  description = "MongoDB Atlas VPC Endpoint ID"
  value       = module.mongodb_privatelink.vpc_endpoint_id
}

output "vpc_endpoint_dns" {
  description = "VPC Endpoint DNS entries"
  value       = module.mongodb_privatelink.vpc_endpoint_dns_names
}