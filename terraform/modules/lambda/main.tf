data "aws_ecr_repository" "app" {
  name = var.ecr_repository_name
}


data "aws_secretsmanager_secret" "app_secrets" {
  name = var.secrets_manager_name
}

data "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = data.aws_secretsmanager_secret.app_secrets.id
}

resource "aws_iam_role" "lambda_role" {
  name = "${var.function_name}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  count      = length(var.vpc_subnet_ids) > 0 ? 1 : 0
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

resource "aws_iam_role_policy" "lambda_secrets" {
  name = "${var.function_name}-secrets-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = data.aws_secretsmanager_secret.app_secrets.arn
      }
    ]
  })
}

resource "aws_lambda_function" "app" {
  function_name = var.function_name
  role          = aws_iam_role.lambda_role.arn
  timeout       = var.timeout
  memory_size   = var.memory_size

  package_type = "Image"
  image_uri    = "${data.aws_ecr_repository.app.repository_url}:${var.image_tag}"
  
  architectures = ["x86_64"]
  
  image_config {
    entry_point = ["/lambda-entrypoint.sh"]
    command     = ["index.handler"]
  }

  environment {
    variables = merge(
      {
        SECRETS_ARN = data.aws_secretsmanager_secret.app_secrets.arn
      },
      var.environment_variables
    )
  }
  
  # VPC Configuration
  dynamic "vpc_config" {
    for_each = length(var.vpc_subnet_ids) > 0 ? [1] : []
    content {
      subnet_ids         = var.vpc_subnet_ids
      security_group_ids = var.vpc_security_group_ids
    }
  }
}