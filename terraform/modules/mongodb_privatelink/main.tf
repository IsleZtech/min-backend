# VPC for Lambda and MongoDB PrivateLink
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.name_prefix}-vpc"
  }
}

# Private Subnets (2 AZs required for PrivateLink)
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[0]
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.name_prefix}-private-subnet-a"
  }
}

resource "aws_subnet" "private_c" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[1]
  availability_zone = "${var.aws_region}c"

  tags = {
    Name = "${var.name_prefix}-private-subnet-c"
  }
}

# Security Group for Lambda
resource "aws_security_group" "lambda" {
  name_prefix = "${var.name_prefix}-lambda-sg"
  vpc_id      = aws_vpc.main.id
  description = "Security group for Lambda function"

  egress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "MongoDB Atlas via PrivateLink"
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "AWS Services via VPC Endpoints"
  }

  tags = {
    Name = "${var.name_prefix}-lambda-sg"
  }
}

# MongoDB Atlas VPC Endpoint
resource "aws_vpc_endpoint" "mongodb_atlas" {
  vpc_id              = aws_vpc.main.id
  service_name        = var.mongodb_atlas_service_name
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_c.id]
  security_group_ids  = [aws_security_group.mongodb_endpoint.id]
  private_dns_enabled = false

  tags = {
    Name = "${var.name_prefix}-mongodb-privatelink"
  }
}

# Security Group for MongoDB Endpoint
resource "aws_security_group" "mongodb_endpoint" {
  name_prefix = "${var.name_prefix}-mongodb-endpoint-sg"
  vpc_id      = aws_vpc.main.id
  description = "Security group for MongoDB Atlas Private Endpoint"

  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
    description     = "MongoDB traffic from Lambda"
  }

  tags = {
    Name = "${var.name_prefix}-mongodb-endpoint-sg"
  }
}

# Secrets Manager VPC Endpoint
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_c.id]
  security_group_ids  = [aws_security_group.aws_endpoints.id]
  private_dns_enabled = true

  tags = {
    Name = "${var.name_prefix}-secretsmanager-endpoint"
  }
}

# Security Group for AWS Endpoints
resource "aws_security_group" "aws_endpoints" {
  name_prefix = "${var.name_prefix}-aws-endpoints-sg"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
    description     = "HTTPS from Lambda"
  }

  tags = {
    Name = "${var.name_prefix}-aws-endpoints-sg"
  }
}