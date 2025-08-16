output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "subnet_ids" {
  description = "Private subnet IDs"
  value       = [aws_subnet.private_a.id, aws_subnet.private_c.id]
}

output "lambda_security_group_id" {
  description = "Lambda security group ID"
  value       = aws_security_group.lambda.id
}

output "vpc_endpoint_id" {
  description = "MongoDB Atlas VPC Endpoint ID"
  value       = aws_vpc_endpoint.mongodb_atlas.id
}

output "vpc_endpoint_dns_names" {
  description = "DNS names for the VPC endpoint"
  value       = aws_vpc_endpoint.mongodb_atlas.dns_entry
}