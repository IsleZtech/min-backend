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
}

module "lambda" {
  source = "../../modules/lambda"

  function_name        = "${local.project_name}-${local.environment}"
  ecr_repository_name  = "${local.project_name}-${local.environment}"
  image_tag           = var.image_tag
  secrets_manager_name = "${local.project_name}-${local.environment}-secrets"
  timeout             = 30
  memory_size         = 512
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
}
