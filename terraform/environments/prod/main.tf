terraform {
  cloud {
    organization = "IsleZ"
    workspaces {
      name = "terraform-min-prod"
    }
  }
}

locals {
  environment  = "prod"
  project_name = "islez-min"
  role_name    = "min-role-prod"
  
  # 既存VPC情報
  existing_vpc_id = "vpc-0f8f1ad4b6314201c"
  existing_private_subnet_ids = [
    "subnet-03bb02c488a34a5d9", # ap-northeast-1a
    "subnet-0f5021bdf0fe75091", # ap-northeast-1c
    "subnet-0f3b982cc9886c37f"  # ap-northeast-1d
  ]
}

# Security Group for Lambda
resource "aws_security_group" "lambda" {
  name_prefix = "${local.project_name}-${local.environment}-lambda-sg"
  vpc_id      = local.existing_vpc_id
  description = "Security group for Lambda function"

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS outbound"
  }

  egress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "MongoDB Atlas"
  }

  egress {
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "DNS resolution"
  }

  egress {
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "DNS resolution TCP"
  }

  tags = {
    Name = "${local.project_name}-${local.environment}-lambda-sg"
  }
}

module "lambda" {
  source = "../../modules/lambda"

  function_name        = "${local.project_name}-${local.environment}"
  ecr_repository_name  = "${local.project_name}-${local.environment}"
  image_tag           = var.image_tag
  secrets_manager_name = "${local.project_name}-${local.environment}-secrets"
  timeout             = 60
  memory_size         = 512
  
  # 既存VPC Configuration
  vpc_subnet_ids         = local.existing_private_subnet_ids
  vpc_security_group_ids = [aws_security_group.lambda.id]
  
  environment_variables = {
    ENVIRONMENT = local.environment
  }
}

module "api_gateway" {
  source = "../../modules/api_gateway"

  api_name             = "${local.project_name}-${local.environment}"
  api_description      = "API Gateway for ${local.project_name} ${local.environment}"
  stage_name          = local.environment
  lambda_function_name = module.lambda.lambda_function_name
  lambda_invoke_arn   = module.lambda.lambda_invoke_arn
  
  # API Key configuration
  enable_api_key = true
  api_key_name   = "${local.project_name}-${local.environment}-api-key"
  
  # Custom domain configuration
  create_custom_domain = true
  custom_domain_name   = "min.sup-api.com"
  certificate_arn     = "arn:aws:acm:ap-northeast-1:190623961132:certificate/2bc1099e-ab47-4bd8-aeef-49e91f96286a"
  hosted_zone_id      = "Z05113242J9D9UG3V632B"
}
